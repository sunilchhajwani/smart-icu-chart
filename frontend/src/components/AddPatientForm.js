import React, { useState } from 'react';

const AddPatientForm = ({ onPatientAdded }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [history, setHistory] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [allergies, setAllergies] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const newPatient = {
      name,
      age: parseInt(age),
      gender,
      admissionDate,
      history: history.split('\n').filter(entry => entry.trim() !== ''),
      diagnosis: diagnosis.split('\n').filter(entry => entry.trim() !== ''),
    };

    try {
      console.log('Attempting to add new patient:', newPatient);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add patient');
      }

      const data = await response.json();
      console.log('Patient added successfully:', data);
      onPatientAdded(data);
      setSuccess(true);
      // Clear form
      setName('');
      setAge('');
      setGender('');
      setAdmissionDate('');
      setHistory('');
      setDiagnosis('');
    } catch (err) {
      console.error('Error adding patient:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="add-patient-form">
      <h3>Add New Patient</h3>
      <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Patient added successfully!</p>}
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
      </div>
      <div>
        <label>Gender:</label>
        <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} required />
      </div>
      <div>
        <label>Admission Date:</label>
        <input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
      </div>
      <div>
        <label>History (one entry per line):</label>
        <textarea value={history} onChange={(e) => setHistory(e.target.value)} rows="4"></textarea>
      </div>
      <div>
        <label>Diagnosis (one entry per line):</label>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows="4"></textarea>
      </div>
      <div>
        <label>Allergies (one entry per line):</label>
        <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} rows="4"></textarea>
      </div>
      <button type="submit">Add Patient</button>
    </form>
    </div>
  );
};

export default AddPatientForm;
