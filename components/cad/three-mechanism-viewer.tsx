import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import AICadCamGenerator from './ai-cad-cam-generator';

const PLANE_OPTIONS = [
  { label: 'XY', normal: [0, 0, 1] },
  { label: 'YZ', normal: [1, 0, 0] },
  { label: 'XZ', normal: [0, 1, 0] },
];

interface ThreeMechanismViewerProps {
  sketch: any;
  tool?: string;
  entities?: any[];
  setEntities?: (entities: any[]) => void;
  selected?: number | null;
  setSelected?: (idx: number | null) => void;
  constraints?: any[];
  setConstraints?: (constraints: any[]) => void;
  onEntityAdd?: (entity: any) => void;
  onEntityEdit?: (entity: any, idx: number) => void;
  onEntitySelect?: (idx: number | null) => void;
  onSnap?: (snapPoint: any) => void;
  onConstraintAdd?: (constraint: any) => void;
  onToolChange?: (tool: string) => void;
}

export default function ThreeMechanismViewer({
  sketch,
  entities = [],
  setEntities = () => {},
  selected = null,
  setSelected = () => {},
  onEntityAdd,
  onEntityEdit,
  onEntitySelect = () => {},
  onSnap = () => {},
  tool = 'select',
}: ThreeMechanismViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [plane, setPlane] = React.useState<'XY' | 'YZ' | 'XZ'>('XY');
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [bgMode, setBgMode] = React.useState<'dark' | 'light'>('dark');
  const [snapIndicator, setSnapIndicator] = React.useState<{ x: number; y: number; z: number } | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Responsive fullscreen fit
  useEffect(() => {
    function handleResize() {
      if (mountRef.current) {
        setDimensions({
          width: mountRef.current.clientWidth,
          height: mountRef.current.clientHeight,
        });
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgMode === 'dark' ? 0x181818 : 0xffffff);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 220);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(bgMode === 'dark' ? 0x181818 : 0xffffff, 1);
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Grid helper (modern CAD look)
    const gridHelper = new THREE.GridHelper(600, 60, bgMode === 'dark' ? 0x888888 : 0xcccccc, bgMode === 'dark' ? 0x222222 : 0xe0e0e0);
    scene.add(gridHelper);

    // Convert 2D sketch entities to 3D lines/geometries
    if (sketch && sketch.entities) {
      sketch.entities.forEach((ent: any) => {
        if (ent.type === 'point') {
          const geometry = new THREE.SphereGeometry(2, 16, 16);
          let pos;
          if (plane === 'XY') pos = new THREE.Vector3(ent.position.x - 300, ent.position.y - 200, 0);
          else if (plane === 'YZ') pos = new THREE.Vector3(0, ent.position.x - 300, ent.position.y - 200);
          else pos = new THREE.Vector3(ent.position.x - 300, 0, ent.position.y - 200);
          geometry.translate(pos.x, pos.y, pos.z);
          const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }
        if (ent.type === 'line') {
          const material = new THREE.LineBasicMaterial({ color: 0x0074d9 });
          let v1, v2;
          if (plane === 'XY') {
            v1 = new THREE.Vector3(ent.start.x - 300, ent.start.y - 200, 0);
            v2 = new THREE.Vector3(ent.end.x - 300, ent.end.y - 200, 0);
          } else if (plane === 'YZ') {
            v1 = new THREE.Vector3(0, ent.start.x - 300, ent.start.y - 200);
            v2 = new THREE.Vector3(0, ent.end.x - 300, ent.end.y - 200);
          } else {
            v1 = new THREE.Vector3(ent.start.x - 300, 0, ent.start.y - 200);
            v2 = new THREE.Vector3(ent.end.x - 300, 0, ent.end.y - 200);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
          const line = new THREE.Line(geometry, material);
          scene.add(line);
        }
        if (ent.type === 'rectangle') {
          const material = new THREE.LineBasicMaterial({ color: 0xff9800 });
          let points = [];
          if (plane === 'XY') {
            points = [
              new THREE.Vector3(ent.start.x - 300, ent.start.y - 200, 0),
              new THREE.Vector3(ent.end.x - 300, ent.start.y - 200, 0),
              new THREE.Vector3(ent.end.x - 300, ent.end.y - 200, 0),
              new THREE.Vector3(ent.start.x - 300, ent.end.y - 200, 0),
              new THREE.Vector3(ent.start.x - 300, ent.start.y - 200, 0),
            ];
          } else if (plane === 'YZ') {
            points = [
              new THREE.Vector3(0, ent.start.x - 300, ent.start.y - 200),
              new THREE.Vector3(0, ent.end.x - 300, ent.start.y - 200),
              new THREE.Vector3(0, ent.end.x - 300, ent.end.y - 200),
              new THREE.Vector3(0, ent.start.x - 300, ent.end.y - 200),
              new THREE.Vector3(0, ent.start.x - 300, ent.start.y - 200),
            ];
          } else {
            points = [
              new THREE.Vector3(ent.start.x - 300, 0, ent.start.y - 200),
              new THREE.Vector3(ent.end.x - 300, 0, ent.start.y - 200),
              new THREE.Vector3(ent.end.x - 300, 0, ent.end.y - 200),
              new THREE.Vector3(ent.start.x - 300, 0, ent.end.y - 200),
              new THREE.Vector3(ent.start.x - 300, 0, ent.start.y - 200),
            ];
          }
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const rect = new THREE.Line(geometry, material);
          scene.add(rect);
        }
        if (ent.type === 'square') {
          const material = new THREE.LineBasicMaterial({ color: 0x9c27b0 });
          let points = [];
          const { x, y } = ent.start;
          const size = ent.size;
          if (plane === 'XY') {
            points = [
              new THREE.Vector3(x - 300, y - 200, 0),
              new THREE.Vector3(x + size - 300, y - 200, 0),
              new THREE.Vector3(x + size - 300, y + size - 200, 0),
              new THREE.Vector3(x - 300, y + size - 200, 0),
              new THREE.Vector3(x - 300, y - 200, 0),
            ];
          } else if (plane === 'YZ') {
            points = [
              new THREE.Vector3(0, x - 300, y - 200),
              new THREE.Vector3(0, x + size - 300, y - 200),
              new THREE.Vector3(0, x + size - 300, y + size - 200),
              new THREE.Vector3(0, x - 300, y + size - 200),
              new THREE.Vector3(0, x - 300, y - 200),
            ];
          } else {
            points = [
              new THREE.Vector3(x - 300, 0, y - 200),
              new THREE.Vector3(x + size - 300, 0, y - 200),
              new THREE.Vector3(x + size - 300, 0, y + size - 200),
              new THREE.Vector3(x - 300, 0, y + size - 200),
              new THREE.Vector3(x - 300, 0, y - 200),
            ];
          }
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const square = new THREE.Line(geometry, material);
          scene.add(square);
        }
        if (ent.type === 'polygon') {
          const material = new THREE.LineBasicMaterial({ color: 0x607d8b });
          let points = [];
          if (plane === 'XY') {
            points = ent.points.map((p: any) => new THREE.Vector3(p.x - 300, p.y - 200, 0));
          } else if (plane === 'YZ') {
            points = ent.points.map((p: any) => new THREE.Vector3(0, p.x - 300, p.y - 200));
          } else {
            points = ent.points.map((p: any) => new THREE.Vector3(p.x - 300, 0, p.y - 200));
          }
          if (points.length > 2) points.push(points[0]); // close polygon
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const poly = new THREE.Line(geometry, material);
          scene.add(poly);
        }
        if (ent.type === 'box') {
          const material = new THREE.MeshStandardMaterial({ color: 0x2196f3, metalness: 0.3, roughness: 0.7, transparent: true, opacity: 0.5 });
          let width = Math.abs(ent.end.x - ent.start.x);
          let depth = Math.abs(ent.end.y - ent.start.y);
          let height = ent.height;
          let x = Math.min(ent.start.x, ent.end.x) - 300;
          let y = Math.min(ent.start.y, ent.end.y) - 200;
          let z = 0;
          if (plane === 'YZ') {
            x = 0;
            y = Math.min(ent.start.x, ent.end.x) - 300;
            z = Math.min(ent.start.y, ent.end.y) - 200;
            width = height; // height along x axis
            height = Math.abs(ent.end.x - ent.start.x);
            depth = Math.abs(ent.end.y - ent.start.y);
          } else if (plane === 'XZ') {
            y = 0;
            x = Math.min(ent.start.x, ent.end.x) - 300;
            z = Math.min(ent.start.y, ent.end.y) - 200;
            depth = height;
            height = Math.abs(ent.end.y - ent.start.y);
            width = Math.abs(ent.end.x - ent.start.x);
          }
          const geometry = new THREE.BoxGeometry(width, depth, height);
          geometry.translate(x + width / 2, y + depth / 2, z + height / 2);
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }
        if (ent.type === 'arc') {
          const material = new THREE.LineBasicMaterial({ color: 0x00bcd4 });
          const curve = new THREE.ArcCurve(
            ent.center.x - 300,
            ent.center.y - 200,
            ent.radius,
            ent.start,
            ent.end,
            false
          );
          const points = curve.getPoints(32).map(p => {
            if (plane === 'XY') return new THREE.Vector3(p.x, p.y, 0);
            if (plane === 'YZ') return new THREE.Vector3(0, p.x, p.y);
            return new THREE.Vector3(p.x, 0, p.y);
          });
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const arc = new THREE.Line(geometry, material);
          scene.add(arc);
        }
        if (ent.type === 'spline') {
          const material = new THREE.LineBasicMaterial({ color: 0xe91e63 });
          let points = ent.points.map((p: any) => {
            if (plane === 'XY') return new THREE.Vector3(p.x - 300, p.y - 200, 0);
            if (plane === 'YZ') return new THREE.Vector3(0, p.x - 300, p.y - 200);
            return new THREE.Vector3(p.x - 300, 0, p.y - 200);
          });
          const curve = new THREE.CatmullRomCurve3(points);
          const curvePoints = curve.getPoints(64);
          const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
          const spline = new THREE.Line(geometry, material);
          scene.add(spline);
        }
        if (ent.type === 'circle') {
          const material = new THREE.LineBasicMaterial({ color: 0x2ecc40 });
          const geometry = new THREE.CircleGeometry(ent.radius, 64);
          if (plane === 'XY') geometry.translate(ent.center.x - 300, ent.center.y - 200, 0);
          else if (plane === 'YZ') geometry.translate(0, ent.center.x - 300, ent.center.y - 200);
          else geometry.translate(ent.center.x - 300, 0, ent.center.y - 200);
          const circle = new THREE.Line(geometry, material);
          scene.add(circle);
        }
        if (ent.type === 'sphere') {
          // 3D stub: render as circle in current plane
          const material = new THREE.LineBasicMaterial({ color: 0xf44336 });
          const geometry = new THREE.CircleGeometry(ent.radius, 64);
          if (plane === 'XY') geometry.translate(ent.center.x - 300, ent.center.y - 200, 0);
          else if (plane === 'YZ') geometry.translate(0, ent.center.x - 300, ent.center.y - 200);
          else geometry.translate(ent.center.x - 300, 0, ent.center.y - 200);
          const circle = new THREE.Line(geometry, material);
          scene.add(circle);
        }
        if (ent.type === 'cylinder') {
          // 3D stub: render as line with circle at each end
          const material = new THREE.LineBasicMaterial({ color: 0x8bc34a });
          let v1, v2;
          if (plane === 'XY') {
            v1 = new THREE.Vector3(ent.start.x - 300, ent.start.y - 200, 0);
            v2 = new THREE.Vector3(ent.end.x - 300, ent.end.y - 200, 0);
          } else if (plane === 'YZ') {
            v1 = new THREE.Vector3(0, ent.start.x - 300, ent.start.y - 200);
            v2 = new THREE.Vector3(0, ent.end.x - 300, ent.end.y - 200);
          } else {
            v1 = new THREE.Vector3(ent.start.x - 300, 0, ent.start.y - 200);
            v2 = new THREE.Vector3(ent.end.x - 300, 0, ent.end.y - 200);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          // Circles at ends
          const circMat = new THREE.LineBasicMaterial({ color: 0x8bc34a });
          const circGeom1 = new THREE.CircleGeometry(ent.radius, 32);
          circGeom1.translate(v1.x, v1.y, v1.z);
          const circGeom2 = new THREE.CircleGeometry(ent.radius, 32);
          circGeom2.translate(v2.x, v2.y, v2.z);
          scene.add(new THREE.Line(circGeom1, circMat));
          scene.add(new THREE.Line(circGeom2, circMat));
        }
        if (ent.type === 'cone') {
          // 3D stub: render as line and circle at base
          const material = new THREE.LineBasicMaterial({ color: 0xffc107 });
          let v1, v2;
          if (plane === 'XY') {
            v1 = new THREE.Vector3(ent.base.x - 300, ent.base.y - 200, 0);
            v2 = new THREE.Vector3(ent.tip.x - 300, ent.tip.y - 200, 0);
          } else if (plane === 'YZ') {
            v1 = new THREE.Vector3(0, ent.base.x - 300, ent.base.y - 200);
            v2 = new THREE.Vector3(0, ent.tip.x - 300, ent.tip.y - 200);
          } else {
            v1 = new THREE.Vector3(ent.base.x - 300, 0, ent.base.y - 200);
            v2 = new THREE.Vector3(ent.tip.x - 300, 0, ent.tip.y - 200);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints([v1, v2]);
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          // Circle at base
          const circMat = new THREE.LineBasicMaterial({ color: 0xffc107 });
          const circGeom = new THREE.CircleGeometry(ent.radius, 32);
          circGeom.translate(v1.x, v1.y, v1.z);
          scene.add(new THREE.Line(circGeom, circMat));
        }
        if (ent.type === 'torus') {
          // 3D stub: render as circle (major radius)
          const material = new THREE.LineBasicMaterial({ color: 0x00bfae });
          const geometry = new THREE.TorusGeometry(ent.radius, ent.tube, 16, 64);
          if (plane === 'XY') geometry.rotateX(Math.PI / 2);
          else if (plane === 'YZ') geometry.rotateY(Math.PI / 2);
          geometry.translate(ent.center.x - 300, ent.center.y - 200, 0);
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }
        // TODO: constraints, joints, links, gears, cams
      });
    }

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(100, 100, 100);
    scene.add(light);

    // Controls (basic orbit)
    // @ts-ignore
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [sketch, plane, bgMode]);

  const handlePointerDown = (evt: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !Array.isArray(entities) || !setSelected) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    const clickPoint = { x: x * 300, y: y * 200, z: 0 };
    // Selection: find closest entity within threshold
    let minDist = 20,
      selectedIdx = null;
    entities.forEach((ent, idx) => {
      if (ent.type === 'point') {
        const d = Math.hypot(ent.position.x - clickPoint.x, ent.position.y - clickPoint.y);
        if (d < minDist) {
          minDist = d;
          selectedIdx = idx;
        }
      }
      if (ent.type === 'line') {
        // Distance from point to line segment
        const { start, end } = ent;
        const A = { x: start.x, y: start.y };
        const B = { x: end.x, y: end.y };
        const AP = { x: clickPoint.x - A.x, y: clickPoint.y - A.y };
        const AB = { x: B.x - A.x, y: B.y - A.y };
        const ab2 = AB.x * AB.x + AB.y * AB.y;
        const ap_ab = AP.x * AB.x + AP.y * AB.y;
        let t = ab2 ? ap_ab / ab2 : 0;
        t = Math.max(0, Math.min(1, t));
        const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t };
        const d = Math.hypot(closest.x - clickPoint.x, closest.y - clickPoint.y);
        if (d < minDist) {
          minDist = d;
          selectedIdx = idx;
        }
      }
    });
    setSelected(selectedIdx);
    if (onEntitySelect) onEntitySelect(selectedIdx);
    // Drag start
    if (selectedIdx !== null) {
      (window as any).__draggingEntity = selectedIdx;
      (window as any).__dragOffset = clickPoint;
    }
  };

  const handlePointerMove = (evt: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !Array.isArray(entities) || !setEntities) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    const movePoint = { x: x * 300, y: y * 200, z: 0 };
    // Dragging
    if ((window as any).__draggingEntity !== undefined && (window as any).__draggingEntity !== null) {
      const idx = (window as any).__draggingEntity;
      const ents = [...entities];
      if (ents[idx].type === 'point') {
        ents[idx] = { ...ents[idx], position: { x: movePoint.x, y: movePoint.y, z: 0 } };
      }
      if (ents[idx].type === 'line') {
        // Move both start and end by the same delta (for simplicity)
        const delta = {
          x: movePoint.x - (window as any).__dragOffset.x,
          y: movePoint.y - (window as any).__dragOffset.y,
        };
        ents[idx] = {
          ...ents[idx],
          start: { x: ents[idx].start.x + delta.x, y: ents[idx].start.y + delta.y },
          end: { x: ents[idx].end.x + delta.x, y: ents[idx].end.y + delta.y },
        };
        (window as any).__dragOffset = movePoint;
      }
      if (ents[idx].type === 'rectangle') {
        // Move both corners by the same delta
        const delta = {
          x: movePoint.x - (window as any).__dragOffset.x,
          y: movePoint.y - (window as any).__dragOffset.y,
        };
        ents[idx] = {
          ...ents[idx],
          start: { x: ents[idx].start.x + delta.x, y: ents[idx].start.y + delta.y },
          end: { x: ents[idx].end.x + delta.x, y: ents[idx].end.y + delta.y },
        };
        (window as any).__dragOffset = movePoint;
      }
      if (ents[idx].type === 'square') {
        // Move origin by delta
        const delta = {
          x: movePoint.x - (window as any).__dragOffset.x,
          y: movePoint.y - (window as any).__dragOffset.y,
        };
        ents[idx] = {
          ...ents[idx],
          start: { x: ents[idx].start.x + delta.x, y: ents[idx].start.y + delta.y },
        };
        (window as any).__dragOffset = movePoint;
      }
      if (ents[idx].type === 'polygon') {
        // Move all points by delta
        const delta = {
          x: movePoint.x - (window as any).__dragOffset.x,
          y: movePoint.y - (window as any).__dragOffset.y,
        };
        ents[idx] = {
          ...ents[idx],
          points: ents[idx].points.map((p: any) => ({ x: p.x + delta.x, y: p.y + delta.y })),
        };
        (window as any).__dragOffset = movePoint;
      }
      if (ents[idx].type === 'box') {
        // Move both corners by delta
        const delta = {
          x: movePoint.x - (window as any).__dragOffset.x,
          y: movePoint.y - (window as any).__dragOffset.y,
        };
        ents[idx] = {
          ...ents[idx],
          start: { x: ents[idx].start.x + delta.x, y: ents[idx].start.y + delta.y },
          end: { x: ents[idx].end.x + delta.x, y: ents[idx].end.y + delta.y },
        };
        (window as any).__dragOffset = movePoint;
      }
      setEntities(ents);
      if (onEntityEdit) onEntityEdit(ents[idx], idx);
    }
    // Advanced snapping: grid, endpoints, midpoints
    let snapTarget = null;
    let minSnapDist = 15;
    // Snap to endpoints
    entities.forEach((ent) => {
      if (ent.type === 'point') {
        const d = Math.hypot(ent.position.x - movePoint.x, ent.position.y - movePoint.y);
        if (d < minSnapDist) {
          minSnapDist = d;
          snapTarget = { ...ent.position };
        }
      }
      if (ent.type === 'line') {
        const d1 = Math.hypot(ent.start.x - movePoint.x, ent.start.y - movePoint.y);
        if (d1 < minSnapDist) {
          minSnapDist = d1;
          snapTarget = { ...ent.start };
        }
        const d2 = Math.hypot(ent.end.x - movePoint.x, ent.end.y - movePoint.y);
        if (d2 < minSnapDist) {
          minSnapDist = d2;
          snapTarget = { ...ent.end };
        }
        // Midpoint
        const mx = (ent.start.x + ent.end.x) / 2;
        const my = (ent.start.y + ent.end.y) / 2;
        const dm = Math.hypot(mx - movePoint.x, my - movePoint.y);
        if (dm < minSnapDist) {
          minSnapDist = dm;
          snapTarget = { x: mx, y: my, z: 0 };
        }
      }
    });
    // Snap to grid if nothing closer
    if (!snapTarget) {
      const snapGrid = 10;
      snapTarget = {
        x: Math.round(movePoint.x / snapGrid) * snapGrid,
        y: Math.round(movePoint.y / snapGrid) * snapGrid,
        z: 0,
      };
    }
    setSnapIndicator(snapTarget);
    if (onSnap) onSnap(snapTarget);
  };

  const handlePointerUp = () => {
    (window as any).__draggingEntity = null;
    (window as any).__dragOffset = null;
    setSnapIndicator(null);
  };

  const handleDoubleClick = (evt: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !Array.isArray(entities) || !setEntities) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    const clickPoint = { x: x * 300, y: y * 200, z: 0 };
    // Edit: open prompt to edit entity position
    let minDist = 20,
      selectedIdx = null;
    entities.forEach((ent, idx) => {
      if (ent.type === 'point') {
        const d = Math.hypot(ent.position.x - clickPoint.x, ent.position.y - clickPoint.y);
        if (d < minDist) {
          minDist = d;
          selectedIdx = idx;
        }
      }
      if (ent.type === 'line') {
        const { start, end } = ent;
        const A = { x: start.x, y: start.y };
        const B = { x: end.x, y: end.y };
        const AP = { x: clickPoint.x - A.x, y: clickPoint.y - A.y };
        const AB = { x: B.x - A.x, y: B.y - A.y };
        const ab2 = AB.x * AB.x + AB.y * AB.y;
        const ap_ab = AP.x * AB.x + AP.y * AB.y;
        let t = ab2 ? ap_ab / ab2 : 0;
        t = Math.max(0, Math.min(1, t));
        const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t };
        const d = Math.hypot(closest.x - clickPoint.x, closest.y - clickPoint.y);
        if (d < minDist) {
          minDist = d;
          selectedIdx = idx;
        }
      }
    });
    if (selectedIdx !== null) {
      const ent = entities[selectedIdx];
      if (ent.type === 'point') {
        const pos = prompt('Edit point position as x,y', `${ent.position.x},${ent.position.y}`);
        if (pos) {
          const [x, y] = pos.split(',').map(Number);
          const ents = [...entities];
          ents[selectedIdx] = { ...ent, position: { x, y, z: 0 } };
          setEntities(ents);
          if (onEntityEdit) onEntityEdit(ents[selectedIdx], selectedIdx);
        }
      }
      if (ent.type === 'line') {
        const pos = prompt('Edit line start,end as x1,y1,x2,y2', `${ent.start.x},${ent.start.y},${ent.end.x},${ent.end.y}`);
        if (pos) {
          const [x1, y1, x2, y2] = pos.split(',').map(Number);
          const ents = [...entities];
          ents[selectedIdx] = { ...ent, start: { x: x1, y: y1 }, end: { x: x2, y: y2 } };
          setEntities(ents);
          if (onEntityEdit) onEntityEdit(ents[selectedIdx], selectedIdx);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-black bg-opacity-90 flex flex-col" style={{ minHeight: '100vh', minWidth: '100vw' }}>
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-white/90 rounded-xl shadow p-3 items-center">
        <span className="font-semibold text-gray-700">Plane:</span>
        {PLANE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setPlane(opt.label as 'XY' | 'YZ' | 'XZ')}
            className={`px-3 py-1 rounded ${plane === opt.label ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-700'}`}
          >
            {opt.label}
          </button>
        ))}
        <button
          className="ml-3 px-2 py-1 rounded bg-black text-white border border-white"
          onClick={() => setBgMode(bgMode === 'dark' ? 'light' : 'dark')}
        >
          {bgMode === 'dark' ? 'White BG' : 'Dark BG'}
        </button>
        <button className="ml-2 px-2 py-1 rounded bg-green-600 text-white">Fit to Screen</button>
        {/* CAD/CAM tool stubs (removed duplicate geometry buttons) */}
      </div>
      {/* 3D Canvas with direct 3D interaction */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Snap indicator overlay */}
        {snapIndicator && (
          <svg
            style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', width: '100%', height: '100%', zIndex: 10 }}
            width={dimensions.width}
            height={dimensions.height}
          >
            <circle
              cx={((snapIndicator.x / 600) + 0.5) * dimensions.width}
              cy={((0.5 - snapIndicator.y / 400)) * dimensions.height}
              r={10}
              fill="none"
              stroke="#ffcc00"
              strokeWidth={3}
              opacity={0.85}
            />
          </svg>
        )}
        <div
          ref={mountRef}
          className="flex-1 w-full h-full cursor-crosshair"
          style={{ minHeight: 0, minWidth: 0 }}
          onPointerDown={e => {
            // Context menu (right click)
            if (e.button === 2) {
              e.preventDefault();
              // Show context menu (demo)
              alert('Context menu: Copy, Paste, Delete, Properties, etc. (TODO: real context menu)');
            } else {
              handlePointerDown(e);
            }
          }}
          onPointerMove={e => {
            // Snapping logic (demo: snap to grid)
            const gridSize = 10;
            const rect = (e.target as HTMLDivElement).getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
            const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;
            setSnapIndicator({ x, y, z: 0 });
            handlePointerMove(e);
          }}
          onPointerUp={handlePointerUp}
          onDoubleClick={e => {
            // Tooltip on double click (demo)
            alert('Tooltip: Double-clicked at position. (TODO: real tooltip/help overlay)');
            handleDoubleClick(e);
          }}
          tabIndex={0}
          onKeyDown={e => {
            // Keyboard shortcuts (demo)
            if (e.ctrlKey && e.key === 'z') handleUndo();
            if (e.ctrlKey && e.key === 'y') handleRedo();
            if (e.key === 'Delete' && selected !== null) {
              setEntities(entities.filter((_, i) => i !== selected));
              setSelected(null);
            }
          }}
        />
        {/* 3D Modeling/Simulation/Assembly Tool Stubs */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/90 px-5 py-3 rounded-xl shadow-lg items-center">

          <button
            className="px-3 py-1 rounded bg-green-600 text-white"
            onClick={() => setShowAIModal(true)}
          >
            AI: Generate/Parametric
          </button>
          {showAIModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black"
                  onClick={() => setShowAIModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <AICadCamGenerator
                  onGenerate={result => {
                    setShowAIModal(false);
                    if (result && result.entities) {
                      setEntities && setEntities([...entities, ...result.entities]);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}