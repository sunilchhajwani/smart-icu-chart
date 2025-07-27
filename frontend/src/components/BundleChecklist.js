import React, { useState, useEffect } from 'react';

const BundleChecklist = ({ patientId }) => {
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [bundleItems, setBundleItems] = useState([]);
  const [patientChecks, setPatientChecks] = useState([]);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/bundles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setBundles(data);
      } catch (error) {
        console.error('Error fetching bundles:', error);
      }
    };

    fetchBundles();
  }, []);

  useEffect(() => {
    if (selectedBundle) {
      const fetchBundleItems = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/bundles/${selectedBundle.id}/items`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setBundleItems(data);
        } catch (error) {
          console.error('Error fetching bundle items:', error);
        }
      };

      const fetchPatientChecks = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/patients/${patientId}/bundle-checks`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setPatientChecks(data);
        } catch (error) {
          console.error('Error fetching patient bundle checks:', error);
        }
      };

      fetchBundleItems();
      fetchPatientChecks();
    }
  }, [selectedBundle, patientId]);

  const handleCheck = async (bundleItemId, isChecked) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/patients/${patientId}/bundle-checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bundleItemId, checkedBy: 'NurseName', isChecked }), // TODO: Replace NurseName with actual logged-in user
      });

      if (response.ok) {
        const newCheck = await response.json();
        setPatientChecks(prevChecks => [...prevChecks, newCheck]);
      } else {
        console.error('Failed to submit bundle check');
      }
    } catch (error) {
      console.error('Error submitting bundle check:', error);
    }
  };

  const isItemChecked = (bundleItemId) => {
    // Check if the item was checked for today
    const today = new Date().toISOString().split('T')[0];
    return patientChecks.some(check => 
      check.bundleItemId === bundleItemId && 
      check.checkDate.startsWith(today) &&
      check.isChecked === 1
    );
  };

  return (
    <div className="bundle-checklist-container">
      <h3>Bundles Checklist</h3>
      <div className="bundle-selection">
        <label>Select Bundle:</label>
        <select onChange={(e) => setSelectedBundle(bundles.find(b => b.id === parseInt(e.target.value)))}>
          <option value="">--Select--</option>
          {bundles.map(bundle => (
            <option key={bundle.id} value={bundle.id}>{bundle.name}</option>
          ))}
        </select>
      </div>

      {selectedBundle && (
        <div className="selected-bundle-details">
          <h4>{selectedBundle.name}</h4>
          <p>{selectedBundle.description}</p>
          <div className="bundle-items">
            {bundleItems.length > 0 ? (
              <ul>
                {bundleItems.map(item => (
                  <li key={item.id}>
                    <input 
                      type="checkbox" 
                      id={`bundle-item-${item.id}`}
                      checked={isItemChecked(item.id)}
                      onChange={(e) => handleCheck(item.id, e.target.checked ? 1 : 0)}
                    />
                    <label htmlFor={`bundle-item-${item.id}`}>{item.itemText}</label>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items for this bundle.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleChecklist;