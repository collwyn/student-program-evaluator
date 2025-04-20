// src/components/pages/Students.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import PerformanceIndicator from '../layout/PerformanceIndicator';
import { studentService } from '../../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerformance, setFilterPerformance] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log('Fetching students...');
        const res = await studentService.getAll();
        console.log('Students data received:', res.data);
        setStudents(res.data);
        setFilteredStudents(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = [...students];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply performance filter
    if (filterPerformance) {
      results = results.filter(student => 
        student.performanceIndicator === filterPerformance
      );
    }
    
    setFilteredStudents(results);
  }, [searchTerm, filterPerformance, students]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = e => {
    setFilterPerformance(e.target.value);
  };

  if (loading) {
    return <Spinner />;
  }

  console.log('Students data before render:', students);
  console.log('Filtered students before render:', filteredStudents);

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Students</h1>
      </div>

      <div className="card">
        <div className="filters">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          
          <select
            value={filterPerformance}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Performances</option>
            <option value="Improved">Improved</option>
            <option value="Neutral">Neutral</option>
            <option value="Struggled">Struggled</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Age</th>
              <th>Average Year Grade</th>
              <th>Performance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.grade}</td>
                <td>{student.age}</td>
                <td>{student.averageYearGrade.toFixed(2)}%</td>
                <td>
                  <PerformanceIndicator performance={student.performanceIndicator} />
                </td>
                <td>
                  <Link to={`/students/${student._id}`} className="btn">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;