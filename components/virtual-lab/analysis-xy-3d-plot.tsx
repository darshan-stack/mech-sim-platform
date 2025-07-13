import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Plotly for Next.js SSR compatibility
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

/**
 * 3D Scatter Plot for XY Analysis (e.g., Position vs Velocity vs Time)
 * @param {Object[]} dataPoints - Array of {x, y, z} points
 * @param {string} xLabel
 * @param {string} yLabel
 * @param {string} zLabel
 * @param {string} title
 */
export default function AnalysisXY3DPlot({ dataPoints = [], xLabel = 'X', yLabel = 'Y', zLabel = 'Z', title = '3D Analysis Plot' }) {
  return (
    <div className="bg-white rounded p-2 border" style={{ height: 350, minHeight: 300 }}>
      <Plot
        data={[
          {
            x: dataPoints.map(p => p.x),
            y: dataPoints.map(p => p.y),
            z: dataPoints.map(p => p.z),
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: 5, color: dataPoints.map(p => p.z), colorscale: 'Viridis' },
          },
        ]}
        layout={{
          title,
          scene: {
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            zaxis: { title: zLabel },
          },
          autosize: true,
          margin: { l: 0, r: 0, b: 0, t: 30 },
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
}
