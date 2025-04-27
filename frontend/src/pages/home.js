import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import EmployeeForm from '../components/employeeForm';
import EmployeeList from '../components/employeeList';
import './home.css'; // Military-themed styling
import RosterPreview from '../components/rosterPreview';
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [userId, setUserId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeInput, setEmployeeInput] = useState({ name: '', rank: '', battery: '', leaves: [], phone: '' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [oodPhone, setOodPhone] = useState('');
  const [aDutyPhone, setADutyPhone] = useState('');
  const [rosterData, setRosterData] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');

  const { logout } = useAuth();
  const handleEdit = (index) => {
    const emp = employees[index];
    setEmployeeInput(emp);
    setEmployees(employees.filter((_, i) => i !== index));
  };
  
  const handleDelete = (index) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    let newId = storedId;
  
    if (!storedId) {
      newId = uuidv4();
      localStorage.setItem('userId', newId);
    }
  
    setUserId(newId);
  
    axios.get(`https://firewatch-roster.onrender.com/api/roster/load-draft/${newId}`)
      .then(res => {
        const { employees, startDate, endDate } = res.data;
        if (employees) setEmployees(employees);
        if (startDate) setStartDate(startDate);
        if (endDate) setEndDate(endDate);
      })
      .catch(err => console.log("No saved draft found.", err));
  }, []);

  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
  
    const format = (d) => d.toISOString().split('T')[0];
  
    setStartDate(format(today));
    setEndDate(format(nextMonth));
  }, []);

  const loadDraft = async (id) => {
    try {
      const res = await axios.get(`https://firewatch-roster.onrender.com/api/roster/load-draft/${id}`);
      const { employees, startDate, endDate } = res.data;
      setEmployees(employees || []);
      setStartDate(startDate || '');
      setEndDate(endDate || '');
    } catch (err) {
      console.warn('No previous draft found.');
    }
  };

  const handleAddEmployee = () => {
    if (!employeeInput.name || !employeeInput.rank || !employeeInput.battery) return;
  
    const newEmployee = {
      ...employeeInput,
      phone: phoneInput, // assign the phone input directly here
    };
  
    setEmployees([...employees, newEmployee]);
  
    // Reset
    setEmployeeInput({ name: '', rank: '', battery: '', leaves: [] });
    setPhoneInput('');
  };

  const handleSaveDraft = async () => {
    try {
      await axios.post('https://firewatch-roster.onrender.com/api/roster/save-draft', {
        userId,
        employees,
        startDate,
        endDate,
      });
      alert('Draft saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving draft.');
    }
  };

  const handleGenerateRoster = async () => {
    try {
      const res = await axios.post('https://firewatch-roster.onrender.com/api/roster/generate', {
        employees,
        startDate,
        endDate,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Shift_Roster.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert('Error generating roster.');
    }
  };

  const handlePreviewRoster = async () => {
    console.log('Preview payload:', employees);
    try {
      const res = await axios.post('http://localhost:3001/api/roster/preview', {
        employees,
        startDate,
        endDate,
        oodPhone,
  aDutyPhone,
      });
      setRosterData(res.data);
    } catch (err) {
      console.error(err);
      alert('Error generating preview.');
    }
  };

  const handleResetForm = () => {
    setEmployees([]);
    setEmployeeInput({ name: '', rank: '', battery: '', leaves: [], phone: '' });
    setStartDate('');
    setEndDate('');
    setRosterData([]);
  };

  return (
    <><button className="logout-btn-fixed" onClick={logout}>🚪 Logout</button>
    <div className="home-container">
      <header className="hero-banner">
        <h1 className="animated-title">🪖 Firewatch Roster Builder</h1>
        <p className="subtitle">Duty-ready. Always prepared.</p>
      </header>

      <section className="form-section">
        <EmployeeForm
          employeeInput={employeeInput}
          setEmployeeInput={setEmployeeInput}
          handleAddEmployee={handleAddEmployee}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput} />

        <div className="date-inputs">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)} />

          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="button-group">
          <button onClick={handleSaveDraft}>💾 Save Draft</button>
          <button onClick={handleGenerateRoster}>📥 Generate Roster</button>
          <button onClick={handlePreviewRoster}>👀 Preview Roster</button>
          <button onClick={handleResetForm}>🧹 Clear Form</button>
        </div>
      </section>

      <EmployeeList
        className='employee-list-container'
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete} />

      <RosterPreview rosterData={rosterData} />

      <footer className="footer">
        <p>Developed with precision ⚔️</p>
      </footer>
    </div></>
  );
};

export default Home;