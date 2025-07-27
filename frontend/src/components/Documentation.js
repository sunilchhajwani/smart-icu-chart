import React, { useState } from 'react';

const Documentation = ({ patient, onMedicationAdded, onNoteAdded, onProcedureAdded, onMedicationUpdated }) => {
  const [medicationForm, setMedicationForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    route: '',
    datetime: ''
  });
  
  const [noteForm, setNoteForm] = useState({
    note: '',
    datetime: '',
    author: ''
  });
  
  const [procedureForm, setProcedureForm] = useState({
    procedure: '',
    datetime: '',
    performedBy: '',
    notes: ''
  });

  const handleMedicationSubmit = (e) => {
    e.preventDefault();
    if (medicationForm.medication && medicationForm.dosage && medicationForm.frequency && medicationForm.route && medicationForm.datetime) {
      onMedicationAdded(medicationForm);
      setMedicationForm({
        medication: '',
        dosage: '',
        frequency: '',
        route: '',
        datetime: ''
      });
    }
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (noteForm.note && noteForm.datetime && noteForm.author) {
      onNoteAdded(noteForm);
      setNoteForm({
        note: '',
        datetime: '',
        author: ''
      });
    }
  };

  const handleProcedureSubmit = (e) => {
    e.preventDefault();
    if (procedureForm.procedure && procedureForm.datetime && procedureForm.performedBy) {
      onProcedureAdded(procedureForm);
      setProcedureForm({
        procedure: '',
        datetime: '',
        performedBy: '',
        notes: ''
      });
    }
  };

  const handleMedicationToggle = (medId, currentStatus) => {
    onMedicationUpdated(medId, !currentStatus);
  };

  return (
    <div className="documentation-container">
      <h3>Medical Documentation</h3>
      
      <div className="documentation-sections">
        {/* Medications Section */}
        <div className="documentation-section">
          <h4>Medications</h4>
          <form onSubmit={handleMedicationSubmit} className="documentation-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Medication"
                value={medicationForm.medication}
                onChange={(e) => setMedicationForm({...medicationForm, medication: e.target.value})}
              />
              <input
                type="text"
                placeholder="Dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Frequency"
                value={medicationForm.frequency}
                onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
              />
              <input
                type="text"
                placeholder="Route"
                value={medicationForm.route}
                onChange={(e) => setMedicationForm({...medicationForm, route: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="datetime-local"
                value={medicationForm.datetime}
                onChange={(e) => setMedicationForm({...medicationForm, datetime: e.target.value})}
              />
              <button type="submit">Add Medication</button>
            </div>
          </form>
          
          <div className="documentation-list">
            {patient.medications && patient.medications.length > 0 ? (
              <ul>
                {patient.medications.map((med) => (
                  <li key={med.id} className={`medication-item ${med.administered ? 'administered' : ''}`}>
                    <div className="medication-info">
                      <strong>{med.medication}</strong> - {med.dosage} - {med.frequency} - {med.route}
                      <br />
                      <small>Ordered: {new Date(med.datetime).toLocaleString()}</small>
                    </div>
                    <button 
                      className={`administer-button ${med.administered ? 'administered' : ''}`}
                      onClick={() => handleMedicationToggle(med.id, med.administered)}
                    >
                      {med.administered ? 'Administered' : 'Mark Administered'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No medications recorded.</p>
            )}
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="documentation-section">
          <h4>Nursing Notes</h4>
          <form onSubmit={handleNoteSubmit} className="documentation-form">
            <textarea
              placeholder="Note content"
              value={noteForm.note}
              onChange={(e) => setNoteForm({...noteForm, note: e.target.value})}
              rows="3"
            />
            <div className="form-row">
              <input
                type="datetime-local"
                value={noteForm.datetime}
                onChange={(e) => setNoteForm({...noteForm, datetime: e.target.value})}
              />
              <input
                type="text"
                placeholder="Author"
                value={noteForm.author}
                onChange={(e) => setNoteForm({...noteForm, author: e.target.value})}
              />
              <button type="submit">Add Note</button>
            </div>
          </form>
          
          <div className="documentation-list">
            {patient.notes && patient.notes.length > 0 ? (
              <ul>
                {patient.notes.map((note) => (
                  <li key={note.id} className="note-item">
                    <p>{note.note}</p>
                    <div className="note-meta">
                      <small>By {note.author} on {new Date(note.datetime).toLocaleString()}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notes recorded.</p>
            )}
          </div>
        </div>
        
        {/* Procedures Section */}
        <div className="documentation-section">
          <h4>Procedures</h4>
          <form onSubmit={handleProcedureSubmit} className="documentation-form">
            <input
              type="text"
              placeholder="Procedure name"
              value={procedureForm.procedure}
              onChange={(e) => setProcedureForm({...procedureForm, procedure: e.target.value})}
            />
            <div className="form-row">
              <input
                type="datetime-local"
                value={procedureForm.datetime}
                onChange={(e) => setProcedureForm({...procedureForm, datetime: e.target.value})}
              />
              <input
                type="text"
                placeholder="Performed by"
                value={procedureForm.performedBy}
                onChange={(e) => setProcedureForm({...procedureForm, performedBy: e.target.value})}
              />
            </div>
            <textarea
              placeholder="Procedure notes"
              value={procedureForm.notes}
              onChange={(e) => setProcedureForm({...procedureForm, notes: e.target.value})}
              rows="2"
            />
            <button type="submit">Add Procedure</button>
          </form>
          
          <div className="documentation-list">
            {patient.procedures && patient.procedures.length > 0 ? (
              <ul>
                {patient.procedures.map((proc) => (
                  <li key={proc.id} className="procedure-item">
                    <strong>{proc.procedure}</strong>
                    <p>{proc.notes}</p>
                    <div className="procedure-meta">
                      <small>Performed by {proc.performedBy} on {new Date(proc.datetime).toLocaleString()}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No procedures recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;