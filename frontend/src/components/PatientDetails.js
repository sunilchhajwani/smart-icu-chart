import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import VitalsChart from './VitalsChart';
import Documentation from './Documentation';
import VitalsInputForm from './VitalsInputForm';
import BundleChecklist from './BundleChecklist';
import DoctorHandover from './DoctorHandover';
import NurseHandover from './NurseHandover';

const socket = io('http://localhost:3001');

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({});
  const [historicalVitals, setHistoricalVitals] = useState([]);
  const [autoScale, setAutoScale] = useState(true);
  const [timeInterval, setTimeInterval, ] = useState('1m');
  const [yMax, setYMax] = useState(100);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/patients/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    const fetchHistoricalVitals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/patients/${id}/vitals`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setHistoricalVitals(data);
      } catch (error) {
        console.error('Error fetching historical vitals:', error);
      }
    };

    fetchPatient();
    fetchHistoricalVitals();

    socket.emit('requestVitals', { patientId: id, interval: timeInterval });

    socket.on('vitals', (data) => {
      setVitals(data);
    });

    return () => {
      socket.off('vitals');
    };
  }, [id, timeInterval]);

  const handleIntervalChange = (interval) => {
    setTimeInterval(interval);
  };

  const handleMedicationAdded = async (medicationData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${id}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...medicationData,
          datetime: medicationData.datetime || new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        const newMedication = await response.json();
        setPatient(prevPatient => ({
          ...prevPatient,
          medications: [...(prevPatient.medications || []), newMedication]
        }));
      }
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleNoteAdded = async (noteData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noteData,
          datetime: noteData.datetime || new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        const newNote = await response.json();
        setPatient(prevPatient => ({
          ...prevPatient,
          notes: [...(prevPatient.notes || []), newNote]
        }));
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleProcedureAdded = async (procedureData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${id}/procedures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...procedureData,
          datetime: procedureData.datetime || new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        const newProcedure = await response.json();
        setPatient(prevPatient => ({
          ...prevPatient,
          procedures: [...(prevPatient.procedures || []), newProcedure]
        }));
      }
    } catch (error) {
      console.error('Error adding procedure:', error);
    }
  };

  const handleMedicationUpdated = async (medId, administered) => {
    try {
      const response = await fetch(`http://localhost:3001/api/patients/${id}/medications/${medId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ administered }),
      });
      
      if (response.ok) {
        const updatedMedication = await response.json();
        setPatient(prevPatient => ({
          ...prevPatient,
          medications: prevPatient.medications.map(med => 
            med.id === medId ? updatedMedication : med
          )
        }));
      }
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const handleVitalsSubmitted = (newVitals) => {
    setHistoricalVitals((prevVitals) => [...prevVitals, newVitals]);
  };

  if (!patient) {
    return <div>Loading patient details...</div>;
  }

  return (
    <div className="patient-details-container">
      <h2>Patient Details for {patient.name} (ID: {patient.id})</h2>
      <div className="patient-info">
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Admission Date:</strong> {patient.admissionDate}</p>
      </div>

      <div className="vitals-display">
        <h3>Current Vitals</h3>
        <div className="vitals-grid">
          <div className="vital-item">
            <span className="vital-label">Heart Rate:</span>
            <span className="vital-value">{vitals.heartRate} bpm</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Blood Pressure:</span>
            <span className="vital-value">{vitals.bloodPressure} mmHg</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Temperature:</span>
            <span className="vital-value">{vitals.temperature} °C</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">SpO2:</span>
            <span className="vital-value">{vitals.spo2}%</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Respiratory Rate:</span>
            <span className="vital-value">{vitals.respiratoryRate} rpm</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Urine Output:</span>
            <span className="vital-value">{vitals.urineOutput} ml</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent Mode:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.mode || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent FiO2:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.fio2 || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent PEEP:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.peep || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent Tidal Volume:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.tidalVolume || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent RR:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.rr || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent Peak Pressure:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.peakPressure || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent Plateau Pressure:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.plateauPressure || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Vent Mean Pressure:</span>
            <span className="vital-value">{vitals.ventilatorParameters?.meanPressure || 'N/A'}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">GCS:</span>
            <span className="vital-value">{vitals.gcs}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Inotropes Added:</span>
            <span className="vital-value">{vitals.inotropesAdded}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Infusion Rates:</span>
            <span className="vital-value">{vitals.infusionRates}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Medications Ongoing:</span>
            <span className="vital-value">{vitals.medicationsOngoing}</span>
          </div>
          <div className="vital-item">
            <span className="vital-label">Rhythm:</span>
            <span className="vital-value">{vitals.rhythm}</span>
          </div>
        </div>
      </div>
      <div className="controls-container">
        <button onClick={() => handleIntervalChange('1m')}>1m</button>
        <button onClick={() => handleIntervalChange('1h')}>1h</button>
        <button onClick={() => handleIntervalChange('24h')}>24h</button>
      </div>
      <div className="controls-container">
        <button onClick={() => setAutoScale(!autoScale)}>
          {autoScale ? 'Switch to Manual Scale' : 'Switch to Auto Scale'}
        </button>
        {!autoScale && (
          <div className="scale-control-container">
            <label htmlFor="yMax">Max Y-Axis:</label>
            <input
              type="range"
              id="yMax"
              min="100"
              max="300"
              value={yMax}
              onChange={(e) => setYMax(e.target.value)}
            />
            <span>{yMax}</span>
          </div>
        )}
      </div>
      <div className="chart-container">
        <VitalsChart vitals={vitals} autoScale={autoScale} yMax={yMax} />
      </div>

      <div className="historical-vitals">
        <h3>Historical Vitals</h3>
        {historicalVitals.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Heart Rate</th>
                <th>Blood Pressure</th>
                <th>Temperature</th>
                <th>SpO2</th>
                <th>Respiratory Rate</th>
                <th>Urine Output</th>
                <th>Ventilator Params</th>
                <th>GCS</th>
                <th>Inotropes Added</th>
                <th>Infusion Rates</th>
                <th>Medications Ongoing</th>
                <th>Rhythm</th>
              </tr>
            </thead>
            <tbody>
              {historicalVitals.map((vital, index) => (
                <tr key={index}>
                  <td>{new Date(vital.timestamp).toLocaleString()}</td>
                  <td>{vital.heartRate}</td>
                  <td>{vital.bloodPressure}</td>
                  <td>{vital.temperature}</td>
                  <td>{vital.spo2}</td>
                  <td>{vital.respiratoryRate}</td>
                  <td>{vital.urineOutput}</td>
                  <td>{vital.ventilatorParameters?.mode || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.fio2 || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.peep || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.tidalVolume || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.rr || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.peakPressure || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.plateauPressure || 'N/A'}</td>
                  <td>{vital.ventilatorParameters?.meanPressure || 'N/A'}</td>
                  <td>{vital.gcs || 'N/A'}</td>
                  <td>{vital.inotropesAdded ? (Array.isArray(vital.inotropesAdded) ? vital.inotropesAdded.join(', ') : vital.inotropesAdded) : 'N/A'}</td>
                  <td>{vital.infusionRates ? (Array.isArray(vital.infusionRates) ? vital.infusionRates.join(', ') : vital.infusionRates) : 'N/A'}</td>
                  <td>{vital.medicationsOngoing ? (Array.isArray(vital.medicationsOngoing) ? vital.medicationsOngoing.join(', ') : vital.medicationsOngoing) : 'N/A'}</td>
                  <td>{vital.rhythm || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No historical vitals available.</p>
        )}
      </div>

      <div className="patient-history">
        <h3>Patient History</h3>
        {patient.history && patient.history.length > 0 ? (
          <ul>
            {patient.history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>No history available.</p>
        )}
      </div>

      <div className="patient-diagnosis">
        <h3>Patient Diagnosis</h3>
        {patient.diagnosis && patient.diagnosis.length > 0 ? (
          <ul>
            {patient.diagnosis.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>No diagnosis available.</p>
        )}
      </div>

      <div className="patient-allergies">
        <h3>Patient Allergies</h3>
        {patient.allergies && patient.allergies.length > 0 ? (
          <ul>
            {patient.allergies.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>No allergies recorded.</p>
        )}
      </div>

      <Documentation 
        patient={patient}
        onMedicationAdded={handleMedicationAdded}
        onNoteAdded={handleNoteAdded}
        onProcedureAdded={handleProcedureAdded}
        onMedicationUpdated={handleMedicationUpdated}
      />

      <VitalsInputForm patientId={patient.id} onVitalsSubmitted={handleVitalsSubmitted} />
      <BundleChecklist patientId={patient.id} />
      <DoctorHandover patientId={patient.id} />
      <NurseHandover patientId={patient.id} />
    </div>
  );
};

export default PatientDetails;