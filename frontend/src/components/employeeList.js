import React from 'react';
import './employeeList.css';

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  return (
    <div className="employee-list-container">
      <h3>🪖 Current Firewatch Personnel</h3>
      {employees.length === 0 ? (
        <p className="empty-message">No employees added yet.</p>
      ) : (
        <ul className="employee-list">
          {employees.map((emp, idx) => (
            <li key={idx} className="employee-card">
              <div className="emp-main">
                <span className="emp-rank">{emp.rank}</span>
                <span className="emp-name">{emp.name}</span>
                <span className="emp-battery">({emp.battery})</span>
              </div>

              {/* Phone Number Display */}
              <div className="emp-phone">
                <strong>Phone:</strong> {emp.phone}
              </div>

              <div className="emp-leaves">
              <strong>Leave:</strong> {emp.leaves?.length ? emp.leaves.join(', ') : 'None'}
              </div>

              <div className="emp-actions">
                <button className="edit-btn" onClick={() => onEdit(idx)}>✏️ Edit</button>
                <button className="delete-btn" onClick={() => onDelete(idx)}>🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeList;