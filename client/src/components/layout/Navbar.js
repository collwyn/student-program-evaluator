// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1>
          <Link to="/">Student Program Evaluator</Link>
        </h1>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/students">Students</Link>
          </li>
          <li>
            <Link to="/classes">Programs</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;