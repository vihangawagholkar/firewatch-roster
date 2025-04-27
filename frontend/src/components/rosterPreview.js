import React from 'react';
import './rosterPreview.css';

const RosterPreview = ({ rosterData }) => {
  if (!rosterData || rosterData.length === 0) return null;

  const isWeekend = (day) => ['Friday', 'Saturday', 'Sunday'].includes(day);

  return (
    <div className="preview-container">
      <h2>📋 Roster Preview</h2>
      <div className="roster-table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>OOD/Battery</th>
              <th>Phone</th>
              <th>Comments</th>
              <th>A Duty/Battery</th>
              <th>Phone</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {rosterData.map((row, idx) => (
              <tr
                key={idx}
                className={isWeekend(row.day) ? 'weekend-row' : ''}
              >
                <td>{row.date}</td>
                <td>{row.day}</td>
                <td>{row.ood || '-'}</td>
                <td>{row.oodPhone || '-'}</td>
                <td>{row.oodComment || '-'}</td>
                <td>{row.aDuty || '-'}</td>
                <td>{row.aDutyPhone || '-'}</td>
                <td>{row.aDutyComment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RosterPreview;