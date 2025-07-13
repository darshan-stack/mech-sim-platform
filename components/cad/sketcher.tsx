import React from 'react';

import MechanismAssembler from './assembler';
import ConstraintPanel from './constraint-panel';
import ThreeMechanismViewer from './three-mechanism-viewer';
import AICadCamGenerator from './ai-cad-cam-generator';
import { Constraint, ConstraintType, applyConstraints } from './constraint-utils';
import { getBezierPath, Point as SplinePoint } from './spline-utils';

type Tool = 'select' | 'point' | 'line' | 'rectangle' | 'square' | 'circle' | 'arc' | 'polygon' | 'spline' | 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'dimension' | 'constraint';

interface PointEntity { type: 'point'; position: Point; }
interface Point { x: number; y: number; }
interface LineEntity { type: 'line'; start: Point; end: Point; }
interface CircleEntity { type: 'circle'; center: Point; radius: number; }
interface ArcEntity { type: 'arc'; center: Point; radius: number; start: number; end: number; }
interface SplineEntity { type: 'spline'; points: Point[]; }
interface RectangleEntity { type: 'rectangle'; start: Point; end: Point; }
interface SquareEntity { type: 'square'; start: Point; size: number; }
interface PolygonEntity { type: 'polygon'; points: Point[]; }
interface BoxEntity { type: 'box'; start: Point; end: Point; height: number; }
interface SphereEntity { type: 'sphere'; center: Point; radius: number; }
interface CylinderEntity { type: 'cylinder'; start: Point; end: Point; radius: number; }
interface ConeEntity { type: 'cone'; base: Point; tip: Point; radius: number; }
interface TorusEntity { type: 'torus'; center: Point; radius: number; tube: number; }
type Entity = PointEntity | LineEntity | CircleEntity | ArcEntity | SplineEntity | RectangleEntity | SquareEntity | PolygonEntity | BoxEntity | SphereEntity | CylinderEntity | ConeEntity | TorusEntity;

export default function Sketcher() {
  // AI CAD/CAM state
  const [aiSketch, setAiSketch] = React.useState<any>(null);
  const [tool, setTool] = React.useState<Tool>('select');
  const [entities, setEntities] = React.useState<Entity[]>([]);
  const [current, setCurrent] = React.useState<any>(null); // For in-progress drawing
  const [selected, setSelected] = React.useState<number | null>(null);
  const [constraints, setConstraints] = React.useState<Constraint[]>([]);
  const [dimensions, setDimensions] = React.useState<any[]>([]);
  const [showAssembler, setShowAssembler] = React.useState(false);
  const [exportedSketch, setExportedSketch] = React.useState<any>(null);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = React.useState<Entity[][]>([]);
  const [redoStack, setRedoStack] = React.useState<Entity[][]>([]);

  // Push to undo stack on entity change
  React.useEffect(() => {
    setUndoStack((stack) => [...stack, entities]);
    setRedoStack([]);
  }, [entities]);

  function handleUndo() {
    if (undoStack.length > 1) {
      setRedoStack((stack) => [undoStack[undoStack.length - 1], ...stack]);
      setUndoStack((stack) => stack.slice(0, -1));
      setEntities(undoStack[undoStack.length - 2]);
    }
  }
  function handleRedo() {
    if (redoStack.length > 0) {
      setUndoStack((stack) => [...stack, redoStack[0]]);
      setEntities(redoStack[0]);
      setRedoStack((stack) => stack.slice(1));
    }
  }

  // Selection logic: click entity in list to select
  function handleSelectEntity(idx: number) {
    setSelected(idx === selected ? null : idx);
  }

  // Handle AI CAD/CAM generation

  // Handle AI CAD/CAM generation
  function handleAIGenerate(result: any) {
    setEntities(result.entities || []);
    setConstraints(result.constraints || []);
    setDimensions(result.dimensions || []);
    setAiSketch(result);
    setShowAssembler(false);
    setExportedSketch(null);
  }

  // SVG event handlers
  function handleSvgClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    const rect = (e.target as SVGSVGElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'point') {
      setEntities([...entities, { type: 'point', position: { x, y } }]);
    }
    if (tool === 'line') {
      if (!current) setCurrent({ start: { x, y } });
      else {
        setEntities([...entities, { type: 'line', start: current.start, end: { x, y } }]);
        setCurrent(null);
      }
    }
    if (tool === 'rectangle') {
      if (!current) setCurrent({ start: { x, y } });
      else {
        setEntities([...entities, { type: 'rectangle', start: current.start, end: { x, y } }]);
        setCurrent(null);
      }
    }
    if (tool === 'square') {
      if (!current) setCurrent({ start: { x, y } });
      else {
        const size = Math.max(Math.abs(x - current.start.x), Math.abs(y - current.start.y));
        setEntities([...entities, { type: 'square', start: current.start, size }]);
        setCurrent(null);
      }
    }
    if (tool === 'circle') {
      if (!current) setCurrent({ center: { x, y } });
      else {
        const r = Math.hypot(x - current.center.x, y - current.center.y);
        setEntities([...entities, { type: 'circle', center: current.center, radius: r }]);
        setCurrent(null);
      }
    }
    if (tool === 'arc') {
      if (!current) setCurrent({ center: { x, y }, points: [{ x, y }] });
      else if (current.points.length === 1) setCurrent({ ...current, points: [...current.points, { x, y }] });
      else {
        // Arc needs center and two points on circumference
        const [p1, p2] = current.points;
        const r = Math.hypot(p1.x - current.center.x, p1.y - current.center.y);
        // Calculate start/end angles
        const start = Math.atan2(p1.y - current.center.y, p1.x - current.center.x);
        const end = Math.atan2(y - current.center.y, x - current.center.x);
        setEntities([...entities, { type: 'arc', center: current.center, radius: r, start, end }]);
        setCurrent(null);
      }
    }
    if (tool === 'polygon') {
      if (!current) setCurrent({ points: [{ x, y }] });
      else if (current.points.length < 8) setCurrent({ points: [...current.points, { x, y }] });
      else {
        setEntities([...entities, { type: 'polygon', points: [...current.points, { x, y }] }]);
        setCurrent(null);
      }
    }
    if (tool === 'spline') {
      if (!current) setCurrent({ points: [{ x, y }] });
      else if (current.points.length < 7) setCurrent({ points: [...current.points, { x, y }] });
      else {
        setEntities([...entities, { type: 'spline', points: [...current.points, { x, y }] }]);
        setCurrent(null);
      }
    }
    if (tool === 'box') {
      if (!current) setCurrent({ start: { x, y } });
      else {
        const height = parseFloat(prompt('Box Height (3D)?', '50') || '50');
        setEntities([...entities, { type: 'box', start: current.start, end: { x, y }, height }]);
        setCurrent(null);
      }
    }
    if (tool === 'sphere') {
      if (!current) setCurrent({ center: { x, y } });
      else {
        const r = parseFloat(prompt('Sphere Radius?', '30') || '30');
        setEntities([...entities, { type: 'sphere', center: current.center, radius: r }]);
        setCurrent(null);
      }
    }
    if (tool === 'cylinder') {
      if (!current) setCurrent({ start: { x, y } });
      else {
        const r = parseFloat(prompt('Cylinder Radius?', '20') || '20');
        setEntities([...entities, { type: 'cylinder', start: current.start, end: { x, y }, radius: r }]);
        setCurrent(null);
      }
    }
    if (tool === 'cone') {
      if (!current) setCurrent({ base: { x, y } });
      else {
        const r = parseFloat(prompt('Cone Base Radius?', '20') || '20');
        setEntities([...entities, { type: 'cone', base: current.base, tip: { x, y }, radius: r }]);
        setCurrent(null);
      }
    }
    if (tool === 'torus') {
      if (!current) setCurrent({ center: { x, y } });
      else {
        const r = parseFloat(prompt('Torus Radius?', '25') || '25');
        const tube = parseFloat(prompt('Torus Tube Radius?', '8') || '8');
        setEntities([...entities, { type: 'torus', center: current.center, radius: r, tube }]);
        setCurrent(null);
      }
    }
    // TODO: dimension, constraint
  }

  function handleExport() {
    setExportedSketch({ entities, constraints, dimensions });
    setShowAssembler(true);
  }

  function handleAddConstraint(type: ConstraintType, eIdx: number, eIdx2?: number) {
    setConstraints([...constraints, { type, entityIndices: [eIdx, ...(eIdx2 !== undefined ? [eIdx2] : [])] }]);
  }

  // Apply constraints (stub)
  const solvedEntities = applyConstraints(entities, constraints);


  return (
    <div className="p-4">
      <AICadCamGenerator onGenerate={handleAIGenerate} />
      <h2 className="text-xl font-bold mb-4">2D Sketcher (CAD)</h2>
      <div className="flex gap-2 mb-4">
        <button onClick={handleUndo} className="px-2 py-1 rounded bg-gray-200 border">Undo</button>
        <button onClick={handleRedo} className="px-2 py-1 rounded bg-gray-200 border">Redo</button>
        <button onClick={() => setTool('select')} className={`px-2 py-1 rounded ${tool === 'select' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Select</button>
        <button onClick={() => setTool('point')} className={`px-2 py-1 rounded ${tool === 'point' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Point</button>
        <button onClick={() => setTool('line')} className={`px-2 py-1 rounded ${tool === 'line' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Line</button>
        <button onClick={() => setTool('rectangle')} className={`px-2 py-1 rounded ${tool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Rectangle</button>
        <button onClick={() => setTool('square')} className={`px-2 py-1 rounded ${tool === 'square' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Square</button>
        <button onClick={() => setTool('circle')} className={`px-2 py-1 rounded ${tool === 'circle' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Circle</button>
        <button onClick={() => setTool('arc')} className={`px-2 py-1 rounded ${tool === 'arc' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Arc</button>
        <button onClick={() => setTool('polygon')} className={`px-2 py-1 rounded ${tool === 'polygon' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Polygon</button>
        <button onClick={() => setTool('spline')} className={`px-2 py-1 rounded ${tool === 'spline' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Spline</button>
        <button onClick={() => setTool('box')} className={`px-2 py-1 rounded ${tool === 'box' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Box</button>
        <button onClick={() => setTool('sphere')} className={`px-2 py-1 rounded ${tool === 'sphere' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Sphere</button>
        <button onClick={() => setTool('cylinder')} className={`px-2 py-1 rounded ${tool === 'cylinder' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Cylinder</button>
        <button onClick={() => setTool('cone')} className={`px-2 py-1 rounded ${tool === 'cone' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Cone</button>
        <button onClick={() => setTool('torus')} className={`px-2 py-1 rounded ${tool === 'torus' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Torus</button>
        <button onClick={() => setTool('dimension')} className={`px-2 py-1 rounded ${tool === 'dimension' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Dimension</button>
        <button onClick={() => setTool('constraint')} className={`px-2 py-1 rounded ${tool === 'constraint' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Constraint</button>
        <button onClick={handleExport} className="ml-4 bg-green-600 text-white px-3 py-1 rounded">Export</button>
      </div>
      {/* 3D CAD/CAM Sketching & Modeling Space */}
      <div className="w-full h-[70vh] flex items-center justify-center">
        <ThreeMechanismViewer
          sketch={{ entities: solvedEntities, constraints, dimensions }}
          tool={tool}
          entities={entities}
          setEntities={setEntities}
          selected={selected}
          setSelected={setSelected}
          constraints={constraints}
          setConstraints={setConstraints}
          onEntityEdit={(entity, idx) => {
            const updated = [...entities];
            updated[idx] = entity;
            setEntities(updated);
          }}
          onEntitySelect={setSelected}
          onSnap={(snapPoint: any) => {
            // Example: snap to grid or existing points
            // (Implement snapping logic here)
          }}
          onConstraintAdd={(constraint: any) => {
            setConstraints([...constraints, constraint]);
          }}
        />
        {/* Modeling tool stubs */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/90 px-5 py-3 rounded-xl shadow-lg items-center">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              const height = parseFloat(prompt('Extrude Height?', '50') || '50');
              alert('Extrude: Would extrude closed profile by ' + height + ' units. (TODO: Implement real extrude logic)');
            }}
          >
            Extrude
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              const angle = parseFloat(prompt('Revolve Angle (deg)?', '360') || '360');
              alert('Revolve: Would revolve profile by ' + angle + ' degrees. (TODO: Implement real revolve logic)');
            }}
          >
            Revolve
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              alert('Fillet: Select an edge or corner, then specify radius. (TODO: Implement fillet logic)');
            }}
          >
            Fillet
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              alert('Chamfer: Select an edge or corner, then specify distance. (TODO: Implement chamfer logic)');
            }}
          >
            Chamfer
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => {
              alert('Pattern: Would pattern selected feature(s). (TODO: Implement pattern logic)');
            }}
          >
            Pattern
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <ConstraintPanel entities={entities} onAddConstraint={handleAddConstraint} />
        <div className="flex gap-8">
          <div>
            <h3 className="font-semibold mb-1">Entities</h3>
            <ul className="text-sm">
              {entities.map((ent, i) => (
                <li key={i} className={selected === i ? 'text-blue-600 font-bold cursor-pointer' : 'cursor-pointer'} onClick={() => handleSelectEntity(i)}>{ent.type} {i + 1}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Constraints</h3>
            <ul className="text-sm">
              {constraints.length === 0 ? <li className="text-gray-400">None</li> : constraints.map((c, i) => <li key={i}>{c.type} ({c.entityIndices.join(', ')})</li>)}
            </ul>
          </div>
        </div>
      </div>
      {showAssembler && exportedSketch && (
        <div className="mt-8">
          <MechanismAssembler sketch={exportedSketch} />
          <div className="mt-4">
            <ThreeMechanismViewer sketch={exportedSketch} />
          </div>
        </div>
      )}
    </div>
  );
}

