import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnalysisXYPlot({ data, xLabel = 'X', yLabel = 'Y', title = 'Analysis Plot' }) {
  // Example data if none provided
  const defaultData = {
    labels: Array.from({ length: 20 }, (_, i) => i),
    datasets: [
      {
        label: yLabel,
        data: Array.from({ length: 20 }, (_, i) => Math.sin(i / 3)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };
  return (
    <div className="bg-white rounded p-2 border">
      <Line
        data={data || defaultData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: title },
          },
          scales: {
            x: { title: { display: true, text: xLabel } },
            y: { title: { display: true, text: yLabel } },
          },
        }}
      />
    </div>
  );
}
