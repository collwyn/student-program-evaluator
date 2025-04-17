// src/components/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Combined router imports
import Spinner from '../layout/Spinner';
import { classService, dataService } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAll();
      setClasses(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes');
      setLoading(false);
    }
  };

  const generateData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request to generate mock data...');
      const response = await dataService.generate();
      console.log('Response received:', response);
      setDataGenerated(true);
      fetchClasses();
    } catch (err) {
      console.error('Error generating data:', err);
      if (err.response && err.response.data) {
        console.error('Server error message:', err.response.data);
        setError(`Error: ${err.response.data.message}`);
      } else {
        setError('Failed to generate data. Check server connection.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  const chartData = {
    labels: classes.map(c => c.name || 'Unknown'),
    datasets: [
      {
        label: 'Program Average Scores',
        data: classes.map(c => c.yearAverage || 0),
        backgroundColor: classes.map(c => {
          if (!c.effectiveness || c.effectiveness === 'Effective') return 'rgba(46, 204, 113, 0.6)';
          if (c.effectiveness === 'Neutral') return 'rgba(243, 156, 18, 0.6)';
          return 'rgba(231, 76, 60, 0.6)';
        }),
        borderColor: classes.map(c => {
          if (c.effectiveness === 'Effective') return 'rgba(39, 174, 96, 1)';
          if (c.effectiveness === 'Neutral') return 'rgba(211, 84, 0, 1)';
          return 'rgba(192, 57, 43, 1)';
        }),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Average Score',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Programs',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const index = context.dataIndex;
            return `Effectiveness: ${classes[index].effectiveness}`;
          }
        }
      },
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Program Effectiveness Overview',
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Program Effectiveness Dashboard</h1>
        <button className="btn" onClick={generateData}>
          {dataGenerated ? 'Regenerate Data' : 'Generate Mock Data'}
        </button>
      </div>

      {dataGenerated && (
        <div className="alert alert-success">
          Mock data generated successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card">
        {classes.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>No class data available. Click "Generate Mock Data" to create sample data.</p>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>Top Performing Programs</h3>
          {classes.filter(c => c.effectiveness === 'Effective').length > 0 ? (
            <ul>
              {classes
                .filter(c => c.effectiveness === 'Effective')
                .sort((a, b) => b.yearAverage - a.yearAverage)
                .slice(0, 3)
                .map(c => (
                  <li key={c._id}>
                    <Link to={`/classes/${c._id}`}>
                      {c.name} - {c.yearAverage.toFixed(2)}%
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No effective programs found.</p>
          )}
        </div>

        <div className="card">
          <h3>Programs Needing Improvement</h3>
          {classes.filter(c => c.effectiveness === 'Ineffective').length > 0 ? (
            <ul>
              {classes
                .filter(c => c.effectiveness === 'Ineffective')
                .sort((a, b) => a.yearAverage - b.yearAverage)
                .slice(0, 3)
                .map(c => (
                  <li key={c._id}>
                    <Link to={`/classes/${c._id}`}>
                      {c.name} - {c.yearAverage.toFixed(2)}%
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No ineffective programs found.</p>
          )}
        </div>

        <div className="card">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/students">View All Students</Link>
            </li>
            <li>
              <Link to="/classes">View All Programs</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;