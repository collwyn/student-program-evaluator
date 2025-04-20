// src/components/pages/ClassDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import EffectivenessIndicator from '../layout/EffectivenessIndicator';
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ClassDetail = () => {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classRes = await axios.get(`/api/classes/${id}`);
        setClassData(classRes.data);
        
        // Fetch full student details for each student in the class
        const studentPromises = classRes.data.students.map(student => 
          axios.get(`/api/students/${student._id}`)
        );
        
        const studentResponses = await Promise.all(studentPromises);
        setStudents(studentResponses.map(res => res.data));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching class details:', err);
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  // Prepare chart data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Average Grades',
        data: months.map(month => classData.monthlyAverages[month] || null),
        borderColor: 'rgba(46, 204, 113, 0.6)',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.1,
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
          text: 'Grade (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Class Average',
        font: {
          size: 16,
        },
      },
    },
  };

  // Calculate the threshold line for effectiveness
  const thresholdChartData = {
    labels: months,
    datasets: [
      {
        label: 'Class Average',
        data: months.map(month => classData.monthlyAverages[month] || null),
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Effective Threshold (75%)',
        data: months.map(() => 75),
        borderColor: 'rgba(46, 204, 113, 0.6)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Ineffective Threshold (50%)',
        data: months.map(() => 50),
        borderColor: 'rgba(231, 76, 60, 0.6)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="class-detail">
      <div className="page-header">
        <h1>{classData.name}</h1>
        <Link to="/classes" className="btn">
          Back to Programs
        </Link>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Program Information</h3>
          <p><strong>Students Enrolled:</strong> {classData.students.length}</p>
          <p><strong>Year Average:</strong> {classData.yearAverage.toFixed(2)}%</p>
          <p>
            <strong>Effectiveness:</strong>{' '}
            <EffectivenessIndicator effectiveness={classData.effectiveness} />
          </p>
        </div>

        <div className="card">
          <h3>Effectiveness Analysis</h3>
          <p>
            This program is considered{' '}
            <EffectivenessIndicator effectiveness={classData.effectiveness} /> based on
            the average student performance over the year.
          </p>
          {classData.effectiveness === 'Effective' && (
            <p>
              Students in this program consistently achieved high scores, indicating
              that the curriculum and teaching methods are successful.
            </p>
          )}
          {classData.effectiveness === 'Neutral' && (
            <p>
              Students in this program achieved moderate scores. There may be
              opportunities to improve the curriculum or teaching methods.
            </p>
          )}
          {classData.effectiveness === 'Ineffective' && (
            <p>
              Students in this program struggled to achieve high scores. A review of
              the curriculum and teaching methods is recommended.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Monthly Performance</h3>
        <Line data={thresholdChartData} options={chartOptions} />
      </div>

      <div className="card">
        <h3>Enrolled Students</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Year Average in this Program</th>
              <th>Performance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              // Calculate the student's average in this specific class
              const classGrades = student.monthlyGrades[classData._id];
              const classGradeValues = classGrades ? Object.values(classGrades) : [];
              const classAverage = classGradeValues.length > 0
                ? classGradeValues.reduce((a, b) => a + b, 0) / classGradeValues.length
                : 0;
              
              return (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.grade}</td>
                  <td>{classAverage.toFixed(2)}%</td>
                  <td>{student.performanceIndicator}</td>
                  <td>
                    <Link to={`/students/${student._id}`} className="btn">
                      View Profile
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassDetail;