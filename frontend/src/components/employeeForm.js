import React, { useState, useEffect } from 'react';
import './employeeForm.css';

const ranks = ['LCpl', 'Cpl', 'Sgt', 'SSgt', 'GySgt','1st Lt'];
const batteries = ['A', 'B', 'C', 'H&S'];

const EmployeeForm = ({ employeeInput, setEmployeeInput, handleAddEmployee, phoneInput, setPhoneInput}) => {
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  // const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    console.log("phoneInput state:", phoneInput);
  }, [phoneInput]);
  // Get all dates between the given start and end dates
  const getDatesBetween = (start, end) => {
    const dateArray = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dateArray.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dateArray;
  };

  // Add leave range to the employee's leave list
  const addLeaveRange = () => {
    if (!leaveStart || !leaveEnd || leaveEnd < leaveStart) return;

    const newDates = getDatesBetween(leaveStart, leaveEnd);
    const overlaps = newDates.filter(d => employeeInput.leaves.includes(d));

    if (overlaps.length > 0) {
      alert(`Some dates already exist: ${overlaps.join(', ')}`);
      return;
    }

    setEmployeeInput({
      ...employeeInput,
      leaves: [...employeeInput.leaves, ...newDates],
    });
    setLeaveStart('');
    setLeaveEnd('');
  };

  // Remove specific leave date from the employee's list
  const removeLeaveDate = (date) => {
    setEmployeeInput({
      ...employeeInput,
      leaves: employeeInput.leaves.filter(d => d !== date),
    });
  };

  // Update the phone number input when rank is selected
 
  const handleSubmit = () => {
    handleAddEmployee();
  };

  return (
    <>
      <div className="form-grid">
        <div>
          <label>Name</label>
          <input
            type="text"
            placeholder="Name"
            value={employeeInput.name}
            onChange={(e) => setEmployeeInput({ ...employeeInput, name: e.target.value })}
          />
        </div>
        <div>
          <label>Rank</label>
          <select
            value={employeeInput.rank}
            onChange={(e) => setEmployeeInput({ ...employeeInput, rank: e.target.value })}
          >
            <option value="">Select Rank</option>
            {ranks.map(rank => <option key={rank} value={rank}>{rank}</option>)}
          </select>
        </div>
        <div>
          <label>Battery</label>
          <select
            value={employeeInput.battery}
            onChange={(e) => setEmployeeInput({ ...employeeInput, battery: e.target.value })}
          >
            <option value="">Select Battery</option>
            {batteries.map(bat => <option key={bat} value={bat}>{bat}</option>)}
          </select>
        </div>

        {/* Display phone input conditionally */}
        {employeeInput.rank && (
          <div>
            <label htmlFor="phoneInput">
              {['LCpl'].includes(employeeInput.rank) ? 'A Duty Phone' : 'OOD Phone'}
            </label>
            <input
              type="tel"
              id="phoneInput"
              placeholder="e.g. 555-1234"
              value={phoneInput}
              onChange={(e) => {console.log('Phone input changed:', e.target.value);
                setPhoneInput(e.target.value)}}
            />
          </div>
        )}

        {/* Leave date range selection */}
        <div className="full-width">
          <div className="leave-picker">
            <input
              type="date"
              value={leaveStart}
              onChange={(e) => setLeaveStart(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={leaveEnd}
              onChange={(e) => setLeaveEnd(e.target.value)}
            />
            <button type="button" onClick={addLeaveRange}>➕ Add Leave Range</button>
          </div>

          {/* Display added leave dates */}
          {employeeInput.leaves.length > 0 && (
            <ul className="leave-list">
              {employeeInput.leaves.map((date, idx) => {
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;

                return (
                  <li key={idx} className={isWeekend ? 'weekend-leave' : ''}>
                    {date} ({dayName})
                    <button onClick={() => removeLeaveDate(date)}>❌</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
};

export default EmployeeForm;