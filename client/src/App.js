// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/pages/Dashboard';
import Students from './components/pages/Students';
import StudentDetail from './components/pages/StudentDetail';
import Classes from './components/pages/Classes';
import ClassDetail from './components/pages/ClassDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;