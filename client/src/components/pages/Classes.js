// src/components/pages/Classes.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../layout/Spinner';
import EffectivenessIndicator from '../layout/EffectivenessIndicator';
import { classService } from '../../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEffectiveness, setFilterEffectiveness] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('Fetching classes...');
        // Use the service instead of direct axios call
        const res = await classService.getAll();
        console.log('Classes data received:', res.data);
        setClasses(Array.isArray(res.data) ? res.data : []);
        setFilteredClasses(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClasses([]);
        setFilteredClasses([]);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    // Apply filters
    if (!classes || !Array.isArray(classes)) {
      setFilteredClasses([]);
      return;
    }
    
    let results = [...classes];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(cls => 
        cls && cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply effectiveness filter
    if (filterEffectiveness) {
      results = results.filter(cls => 
        cls && cls.effectiveness === filterEffectiveness
      );
    }
    
    setFilteredClasses(results);
  }, [searchTerm, filterEffectiveness, classes]);

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = e => {
    setFilterEffectiveness(e.target.value);
  };

  if (loading) {
    return <Spinner />;
  }

  console.log('Classes data before render:', classes);
  console.log('Filtered classes before render:', filteredClasses);

  return (
    <div className="classes-page">
      <div className="page-header">
        <h1>Programs</h1>
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
            value={filterEffectiveness}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Effectiveness</option>
            <option value="Effective">Effective</option>
            <option value="Neutral">Neutral</option>
            <option value="Ineffective">Ineffective</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Students Enrolled</th>
              <th>Year Average</th>
              <th>Effectiveness</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses && filteredClasses.map(cls => (
              <tr key={cls._id}>
                <td>{cls.name}</td>
                <td>{cls.students ? cls.students.length : 0}</td>
                <td>{(cls.yearAverage || 0).toFixed(2)}%</td>
                <td>
                  <EffectivenessIndicator effectiveness={cls.effectiveness || 'Neutral'} />
                </td>
                <td>
                  <Link to={`/classes/${cls._id}`} className="btn">
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

export default Classes;