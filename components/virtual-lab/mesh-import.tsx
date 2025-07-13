import React, { useRef, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

function MeshViewer({ meshUrl }: { meshUrl: string }) {
  const obj = useLoader(OBJLoader, meshUrl);
  return <primitive object={obj} scale={1} />;
}

export default function MeshImport() {
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setMeshUrl(url);
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">2D/3D Mesh Import</h2>
      <input
        type="file"
        accept=".obj"
        ref={inputRef}
        onChange={handleFileChange}
        className="mb-2"
      />
      <div className="h-64 w-full bg-gray-100 rounded">
        {meshUrl ? (
          <Canvas camera={{ position: [2, 2, 2] }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} />
            <MeshViewer meshUrl={meshUrl} />
            <OrbitControls />
          </Canvas>
        ) : (
          <p className="text-gray-500 text-center pt-16">Upload a .obj mesh file to view</p>
        )}
      </div>
    </div>
  );
}
