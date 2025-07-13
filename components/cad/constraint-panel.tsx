import React from 'react';
import { ConstraintType } from './constraint-utils';

export default function ConstraintPanel({
  entities,
  onAddConstraint,
}: {
  entities: any[];
  onAddConstraint: (type: ConstraintType, eIdx: number, eIdx2?: number) => void;
}) {
  const [type, setType] = React.useState<ConstraintType>('coincident');
  const [entityA, setEntityA] = React.useState<number>(0);
  const [entityB, setEntityB] = React.useState<number>(0);

  return (
    <div className="p-2 bg-gray-100 rounded shadow mb-2">
      <div className="font-semibold mb-1">Add Constraint</div>
      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value as ConstraintType)} className="border rounded px-2 py-1">
          <option value="coincident">Coincident</option>
          <option value="parallel">Parallel</option>
          <option value="perpendicular">Perpendicular</option>
          <option value="equal">Equal</option>
          <option value="dimension">Dimension</option>
        </select>
        <select value={entityA} onChange={e => setEntityA(Number(e.target.value))} className="border rounded px-2 py-1">
          {entities.map((ent, i) => (
            <option value={i} key={i}>{ent.type} {i + 1}</option>
          ))}
        </select>
        {(type !== 'dimension') && (
          <select value={entityB} onChange={e => setEntityB(Number(e.target.value))} className="border rounded px-2 py-1">
            {entities.map((ent, i) => (
              <option value={i} key={i}>{ent.type} {i + 1}</option>
            ))}
          </select>
        )}
        <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => onAddConstraint(type, entityA, type !== 'dimension' ? entityB : undefined)}>Add</button>
      </div>
    </div>
  );
}
