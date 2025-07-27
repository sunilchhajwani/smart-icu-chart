import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddPatientForm from './AddPatientForm';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setPatients(data);
      } else {
        console.error('API response is not an array:', data);
        setPatients([]); // Ensure patients is always an array
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientAdded = (newPatient) => {
    setPatients((prevPatients) => [...prevPatients, newPatient]);
    setShowAddPatientForm(false); // Hide form after adding
  };

  return (
    <div className="patient-list-container">
      <h2>Patient Dashboard</h2>
      <button onClick={() => setShowAddPatientForm(!showAddPatientForm)}>
        {showAddPatientForm ? 'Cancel Add Patient' : 'Add New Patient'}
      </button>
      {showAddPatientForm && <AddPatientForm onPatientAdded={handlePatientAdded} />}
      <ul>
        {patients.map(patient => (
          <li key={patient.id}>
            <Link to={`/patient/${patient.id}`}>
              {patient.name} - {patient.age} years old
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;