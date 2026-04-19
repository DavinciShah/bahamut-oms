import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Charts({ data, type = 'line', title = 'Orders Over Time' }) {
  const labels = data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = data?.values || [0, 0, 0, 0, 0, 0];

  const chartData = {
    labels,
    datasets: [
      {
        label: data?.datasetLabel || 'Orders',
        data: values,
        borderColor: '#2563eb',
        backgroundColor: type === 'bar' ? 'rgba(37,99,235,0.6)' : 'rgba(37,99,235,0.1)',
        fill: type === 'line',
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: Boolean(title), text: title },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        {type === 'bar' ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}

export default Charts;
