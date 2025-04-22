// src/components/pages/StudentDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';
import PerformanceIndicator from '../layout/PerformanceIndicator';
import { studentService } from '../../services/api';
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

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        console.log(`Fetching details for student ID: ${id}`);
        const result = await studentService.getById(id);
        
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        
        if (!result.data) {
          setError('No student data received');
          setLoading(false);
          return;
        }
        
        console.log('Student data received:', result.data);
        setStudent(result.data);
        setLoading(false);
      } catch (err) {
        console.error('Error in student detail component:', err);
        setError('Failed to load student data. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-danger">{error}</div>
        <Link to="/students" className="btn">
          Back to Students
        </Link>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card">
        <div className="alert alert-danger">Student not found</div>
        <Link to="/students" className="btn">
          Back to Students
        </Link>
      </div>
    );
  }

  // Prepare chart data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate datasets for each class
  const datasets = student.classes.map((cls, index) => {
    const classGrades = student.monthlyGrades[cls._id];
    const colors = [
      'rgba(46, 204, 113, 0.6)',
      'rgba(52, 152, 219, 0.6)',
      'rgba(155, 89, 182, 0.6)',
      'rgba(243, 156, 18, 0.6)'
    ];
    
    return {
      label: cls.name,
      data: months.map(month => classGrades ? classGrades[month] : null),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('0.6', '0.1'),
      tension: 0.1,
    };
  });

  const chartData = {
    labels: months,
    datasets,
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
        text: 'Monthly Grades by Class',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="student-detail">
      <div className="page-header">
        <h1>{student.name}</h1>
        <Link to="/students" className="btn">
          Back to Students
        </Link>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Student Information</h3>
          <p><strong>Age:</strong> {student.age}</p>
          <p><strong>Grade:</strong> {student.grade}</p>
          <p><strong>Average Year Grade:</strong> {student.averageYearGrade.toFixed(2)}%</p>
          <p>
            <strong>Performance:</strong>{' '}
            <PerformanceIndicator performance={student.performanceIndicator} />
          </p>
        </div>

        <div className="card">
          <h3>Enrolled Classes</h3>
          <ul>
            {student.classes.map(cls => (
              <li key={cls._id}>
                <Link to={`/classes/${cls._id}`}>{cls.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Grade Progression</h3>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="card">
        <h3>Student Reflection</h3>
        <div className="essay">
          {student.essay ? student.essay.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          )) : <p>No reflection available</p>}
        </div>
      </div>

      <div className="card">
        <h3>Attendance Record</h3>
        <table>
          <thead>
            <tr>
              <th>Class</th>
              {months.map(month => (
                <th key={month}>{month.substring(0, 3)}</th>
              ))}
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {student.classes.map(cls => {
              const classAttendance = student.attendance[cls._id] || {};
              const attendanceValues = months.map(month => classAttendance[month] || 0);
              const averageAttendance = attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length;
              
              return (
                <tr key={cls._id}>
                  <td>{cls.name}</td>
                  {months.map(month => (
                    <td key={month}>{classAttendance[month] || 0}%</td>
                  ))}
                  <td>{averageAttendance.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDetail;