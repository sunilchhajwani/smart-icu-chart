import React, { useState } from 'react';

const VitalsInputForm = ({ patientId, onVitalsSubmitted }) => {
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [urineOutput, setUrineOutput] = useState('');
  const [ventMode, setVentMode] = useState('');
  const [ventFiO2, setVentFiO2] = useState('');
  const [ventPEEP, setVentPEEP] = useState('');
  const [ventTidalVolume, setVentTidalVolume] = useState('');
  const [ventRR, setVentRR] = useState('');
  const [ventPeakPressure, setVentPeakPressure] = useState('');
  const [ventPlateauPressure, setVentPlateauPressure] = useState('');
  const [ventMeanPressure, setVentMeanPressure] = useState('');
  const [gcs, setGcs] = useState('');
  const [inotropesAdded, setInotropesAdded] = useState('');
  const [infusionRates, setInfusionRates] = useState('');
  const [medicationsOngoing, setMedicationsOngoing] = useState('');
  const [rhythm, setRhythm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const vitalsData = {
      heartRate: heartRate ? parseInt(heartRate) : null,
      bloodPressure: bloodPressure || null,
      temperature: temperature ? parseFloat(temperature) : null,
      spo2: spo2 ? parseInt(spo2) : null,
      respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
      urineOutput: urineOutput ? parseInt(urineOutput) : null,
      ventilatorParameters: {
        mode: ventMode || null,
        fio2: ventFiO2 ? parseFloat(ventFiO2) : null,
        peep: ventPEEP ? parseInt(ventPEEP) : null,
        tidalVolume: ventTidalVolume ? parseInt(ventTidalVolume) : null,
        rr: ventRR ? parseInt(ventRR) : null,
        peakPressure: ventPeakPressure ? parseInt(ventPeakPressure) : null,
        plateauPressure: ventPlateauPressure ? parseInt(ventPlateauPressure) : null,
        meanPressure: ventMeanPressure ? parseInt(ventMeanPressure) : null,
      },
      gcs: gcs ? parseInt(gcs) : null,
      inotropesAdded: inotropesAdded || null,
      infusionRates: infusionRates || null,
      medicationsOngoing: medicationsOngoing || null,
      rhythm: rhythm || null,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`http://localhost:3001/api/patients/${patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vitalsData),
      });

      if (response.ok) {
        const newVitals = await response.json();
        onVitalsSubmitted(newVitals);
        // Clear form
        setHeartRate('');
        setBloodPressure('');
        setTemperature('');
        setSpo2('');
        setRespiratoryRate('');
        setUrineOutput('');
        setVentMode('');
        setVentFiO2('');
        setVentPEEP('');
        setVentTidalVolume('');
        setVentRR('');
        setVentPeakPressure('');
        setVentPlateauPressure('');
        setVentMeanPressure('');
        setGcs('');
        setInotropesAdded('');
        setInfusionRates('');
        setMedicationsOngoing('');
        setRhythm('');
      } else {
        console.error('Failed to submit vitals');
      }
    } catch (error) {
      console.error('Error submitting vitals:', error);
    }
  };

  return (
    <div className="vitals-input-form">
      <h3>Record New Vitals</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Heart Rate (bpm):</label>
          <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Blood Pressure (mmHg):</label>
          <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Temperature (°C):</label>
          <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </div>
        <div className="form-group">
          <label>SpO2 (%):</label>
          <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Respiratory Rate (rpm):</label>
          <input type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Urine Output (ml):</label>
          <input type="number" value={urineOutput} onChange={(e) => setUrineOutput(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ventilator Mode:</label>
          <input type="text" value={ventMode} onChange={(e) => setVentMode(e.target.value)} placeholder="e.g., SIMV, AC" />
        </div>
        <div className="form-group">
          <label>Ventilator FiO2:</label>
          <input type="number" step="0.1" value={ventFiO2} onChange={(e) => setVentFiO2(e.target.value)} placeholder="e.g., 0.5" />
        </div>
        <div className="form-group">
          <label>Ventilator PEEP:</label>
          <input type="number" value={ventPEEP} onChange={(e) => setVentPEEP(e.target.value)} placeholder="e.g., 5" />
        </div>
        <div className="form-group">
          <label>Ventilator Tidal Volume (ml):</label>
          <input type="number" value={ventTidalVolume} onChange={(e) => setVentTidalVolume(e.target.value)} placeholder="e.g., 400" />
        </div>
        <div className="form-group">
          <label>Ventilator RR:</label>
          <input type="number" value={ventRR} onChange={(e) => setVentRR(e.target.value)} placeholder="e.g., 16" />
        </div>
        <div className="form-group">
          <label>Ventilator Peak Airway Pressure (cmH2O):</label>
          <input type="number" value={ventPeakPressure} onChange={(e) => setVentPeakPressure(e.target.value)} placeholder="e.g., 25" />
        </div>
        <div className="form-group">
          <label>Ventilator Plateau Airway Pressure (cmH2O):</label>
          <input type="number" value={ventPlateauPressure} onChange={(e) => setVentPlateauPressure(e.target.value)} placeholder="e.g., 20" />
        </div>
        <div className="form-group">
          <label>Ventilator Mean Airway Pressure (cmH2O):</label>
          <input type="number" value={ventMeanPressure} onChange={(e) => setVentMeanPressure(e.target.value)} placeholder="e.g., 10" />
        </div>
        <div className="form-group">
          <label>Ventilator Peak Airway Pressure (cmH2O):</label>
          <input type="number" value={ventPeakPressure} onChange={(e) => setVentPeakPressure(e.target.value)} placeholder="e.g., 25" />
        </div>
        <div className="form-group">
          <label>Ventilator Plateau Airway Pressure (cmH2O):</label>
          <input type="number" value={ventPlateauPressure} onChange={(e) => setVentPlateauPressure(e.target.value)} placeholder="e.g., 20" />
        </div>
        <div className="form-group">
          <label>Ventilator Mean Airway Pressure (cmH2O):</label>
          <input type="number" value={ventMeanPressure} onChange={(e) => setVentMeanPressure(e.target.value)} placeholder="e.g., 10" />
        </div>
        <div className="form-group">
          <label>GCS:</label>
          <input type="number" value={gcs} onChange={(e) => setGcs(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Inotropes Added:</label>
          <input type="text" value={inotropesAdded} onChange={(e) => setInotropesAdded(e.target.value)} placeholder="e.g., Dopamine, Norepinephrine"/>
        </div>
        <div className="form-group">
          <label>Infusion Rates:</label>
          <input type="text" value={infusionRates} onChange={(e) => setInfusionRates(e.target.value)} placeholder="e.g., Dopamine: 5mcg/kg/min"/>
        </div>
        <div className="form-group">
          <label>Medications Ongoing:</label>
          <textarea value={medicationsOngoing} onChange={(e) => setMedicationsOngoing(e.target.value)} placeholder="e.g., Insulin, Heparin"></textarea>
        </div>
        <div className="form-group">
          <label>Rhythm:</label>
          <textarea value={rhythm} onChange={(e) => setRhythm(e.target.value)} placeholder="e.g., Sinus Rhythm, Atrial Fibrillation"></textarea>
        </div>
        <button type="submit">Submit Vitals</button>
      </form>
    </div>
  );
};

export default VitalsInputForm;