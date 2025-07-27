const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./icu_chart.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        admissionDate TEXT NOT NULL,
        history TEXT,
        diagnosis TEXT,
        medications TEXT,
        notes TEXT,
        procedures TEXT,
        allergies TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating patients table:', err.message);
        } else {
          console.log('Patients table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )`, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        } else {
          console.log('Users table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        vital TEXT NOT NULL,
        value TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating alerts table:', err.message);
        } else {
          console.log('Alerts table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        heartRate INTEGER,
        bloodPressure TEXT,
        temperature REAL,
        spo2 INTEGER,
        respiratoryRate INTEGER,
        urineOutput INTEGER,
        ventilatorParameters TEXT,
        gcs INTEGER,
        inotropesAdded TEXT,
        infusionRates TEXT,
        medicationsOngoing TEXT,
        rhythm TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating vitals table:', err.message);
        } else {
          console.log('Vitals table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS bundles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating bundles table:', err.message);
        } else {
          console.log('Bundles table created or already exists.');
          // Insert initial bundles if they don't exist
          db.get(`SELECT COUNT(*) as count FROM bundles`, (err, row) => {
            if (err) {
              console.error('Error checking bundles count:', err.message);
              return;
            }
            if (row.count === 0) {
              const initialBundles = [
                { name: 'VAP Bundle', description: 'Ventilator-Associated Pneumonia Prevention Bundle' },
                { name: 'CLABSI Bundle', description: 'Central Line-Associated Bloodstream Infection Prevention Bundle' },
                { name: 'CAUTI Bundle', description: 'Catheter-Associated Urinary Tract Infection Prevention Bundle' },
              ];
              const stmt = db.prepare(`INSERT INTO bundles (name, description) VALUES (?, ?)`);
              initialBundles.forEach(bundle => {
                stmt.run(bundle.name, bundle.description);
              });
              stmt.finalize();
              console.log('Initial bundles inserted.');
            }
          });
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS bundle_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bundleId INTEGER NOT NULL,
        itemText TEXT NOT NULL,
        FOREIGN KEY (bundleId) REFERENCES bundles (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating bundle_items table:', err.message);
        } else {
          console.log('Bundle_items table created or already exists.');
          // Insert initial bundle items if they don't exist
          db.get(`SELECT COUNT(*) as count FROM bundle_items`, (err, row) => {
            if (err) {
              console.error('Error checking bundle_items count:', err.message);
              return;
            }
            if (row.count === 0) {
              const initialBundleItems = [
                // VAP Bundle Items (bundleId = 1, assuming auto-increment starts at 1)
                { bundleId: 1, itemText: 'Head of bed elevation 30-45 degrees' },
                { bundleId: 1, itemText: 'Daily sedation vacation and assessment of readiness to extubate' },
                { bundleId: 1, itemText: 'Peptic ulcer disease prophylaxis' },
                { bundleId: 1, itemText: 'Deep vein thrombosis prophylaxis' },
                { bundleId: 1, itemText: 'Daily oral care with chlorhexidine' },
                // CLABSI Bundle Items (bundleId = 2)
                { bundleId: 2, itemText: 'Hand hygiene' },
                { bundleId: 2, itemText: 'Maximal barrier precautions' },
                { bundleId: 2, itemText: 'Chlorhexidine skin antisepsis' },
                { bundleId: 2, itemText: 'Optimal catheter site selection' },
                { bundleId: 2, itemText: 'Daily review of line necessity with prompt removal of unnecessary lines' },
                // CAUTI Bundle Items (bundleId = 3)
                { bundleId: 3, itemText: 'Appropriate indications for urinary catheter insertion' },
                { bundleId: 3, itemText: 'Proper insertion technique' },
                { bundleId: 3, itemText: 'Hand hygiene' },
                { bundleId: 3, itemText: 'Securement of catheter' },
                { bundleId: 3, itemText: 'Maintenance of a closed drainage system' },
                { bundleId: 3, itemText: 'Daily review of catheter necessity with prompt removal of unnecessary catheters' },
              ];
              const stmt = db.prepare(`INSERT INTO bundle_items (bundleId, itemText) VALUES (?, ?)`);
              initialBundleItems.forEach(item => {
                stmt.run(item.bundleId, item.itemText);
              });
              stmt.finalize();
              console.log('Initial bundle items inserted.');
            }
          });
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS patient_bundle_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        bundleItemId INTEGER NOT NULL,
        checkedBy TEXT NOT NULL,
        checkDate TEXT NOT NULL,
        isChecked INTEGER NOT NULL, -- 0 for false, 1 for true
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (bundleItemId) REFERENCES bundle_items (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating patient_bundle_checks table:', err.message);
        } else {
          console.log('Patient_bundle_checks table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS doctor_handovers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        handoverText TEXT NOT NULL,
        handoverBy TEXT NOT NULL,
        handoverDate TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating doctor_handovers table:', err.message);
        } else {
          console.log('Doctor_handovers table created or already exists.');
        }
      });

      db.run(`CREATE TABLE IF NOT EXISTS nurse_handovers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        handoverText TEXT NOT NULL,
        handoverBy TEXT NOT NULL,
        handoverDate TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating nurse_handovers table:', err.message);
        } else {
          console.log('Nurse_handovers table created or already exists.');
        }
      });

      db.get(`SELECT COUNT(*) as count FROM patients`, (err, row) => {
        if (err) {
          console.error('Error checking patient count:', err.message);
          return;
        }
        if (row.count === 0) {
          const initialPatients = [
            { 
              name: 'John Doe', 
              age: 65, 
              gender: 'Male', 
              admissionDate: '2023-07-20', 
              history: '[]', 
              diagnosis: '[]',
              medications: '[]',
              notes: '[]',
              procedures: '[]'
            },
            { 
              name: 'Jane Smith', 
              age: 50, 
              gender: 'Female', 
              admissionDate: '2023-07-22', 
              history: '[]', 
              diagnosis: '[]',
              medications: '[]',
              notes: '[]',
              procedures: '[]'
            },
          ];
          const stmt = db.prepare(`INSERT INTO patients (name, age, gender, admissionDate, history, diagnosis, medications, notes, procedures) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          initialPatients.forEach(patient => {
            stmt.run(patient.name, patient.age, patient.gender, patient.admissionDate, patient.history, patient.diagnosis, patient.medications, patient.notes, patient.procedures);
          });
          stmt.finalize();
          console.log('Initial patient data inserted.');
        }
      });
    });
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to verify JWT
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const getInterval = (interval) => {
  switch (interval) {
    case '1h':
      return 60 * 60 * 1000;
    case '24h':
      return 24 * 60 * 60 * 1000;
    default:
      return 2000; // 2 seconds for 1m
  }
};

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  });
});

// Mock API Endpoints for Patients
app.get('/api/patients', auth, (req, res) => {
  db.all(`SELECT id, name, age, gender, admissionDate, history, diagnosis, medications, notes, procedures FROM patients`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({
      ...row,
      history: JSON.parse(row.history || '[]'),
      diagnosis: JSON.parse(row.diagnosis || '[]'),
      medications: JSON.parse(row.medications || '[]'),
      notes: JSON.parse(row.notes || '[]'),
      procedures: JSON.parse(row.procedures || '[]'),
    })));
  });
});

app.post('/api/patients', auth, (req, res) => {
  const { name, age, gender, admissionDate, history = [], diagnosis = [], allergies = [] } = req.body;
  if (!name || !age || !gender || !admissionDate) {
    return res.status(400).json({ message: 'All patient fields are required.' });
  }
  const stmt = db.prepare(`INSERT INTO patients (name, age, gender, admissionDate, history, diagnosis, medications, notes, procedures, allergies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(name, age, gender, admissionDate, JSON.stringify(history), JSON.stringify(diagnosis), JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify(allergies), function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ 
      id: this.lastID, 
      name, 
      age, 
      gender, 
      admissionDate, 
      history, 
      diagnosis,
      medications: [],
      notes: [],
      procedures: [],
      allergies
    });
  });
  stmt.finalize();
});

app.get('/api/patients/:id', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  db.get(`SELECT id, name, age, gender, admissionDate, history, diagnosis, medications, notes, procedures, allergies FROM patients WHERE id = ?`, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({
        ...row,
        history: JSON.parse(row.history || '[]'),
        diagnosis: JSON.parse(row.diagnosis || '[]'),
        medications: JSON.parse(row.medications || '[]'),
        notes: JSON.parse(row.notes || '[]'),
        procedures: JSON.parse(row.procedures || '[]'),
        allergies: JSON.parse(row.allergies || '[]'),
      });
    } else {
      res.status(404).json({ message: 'Patient not found.' });
    }
  });
});

// API endpoints for medical documentation
app.post('/api/patients/:id/medications', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  const { medication, dosage, frequency, route, datetime } = req.body;
  if (!medication || !dosage || !frequency || !route || !datetime) {
    return res.status(400).json({ message: 'All medication fields are required.' });
  }

  db.get(`SELECT medications FROM patients WHERE id = ?`, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const medications = JSON.parse(row.medications || '[]');
    const newMedication = {
      id: Date.now(),
      medication,
      dosage,
      frequency,
      route,
      datetime,
      administered: false
    };
    medications.push(newMedication);

    db.run(`UPDATE patients SET medications = ? WHERE id = ?`, [JSON.stringify(medications), patientId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(newMedication);
    });
  });
});

app.post('/api/patients/:id/notes', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  const { note, datetime, author } = req.body;
  if (!note || !datetime || !author) {
    return res.status(400).json({ message: 'Note, datetime, and author are required.' });
  }

  db.get(`SELECT notes FROM patients WHERE id = ?`, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const notes = JSON.parse(row.notes || '[]');
    const newNote = { id: Date.now(), note, datetime, author };
    notes.push(newNote);

    db.run(`UPDATE patients SET notes = ? WHERE id = ?`, [JSON.stringify(notes), patientId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(newNote);
    });
  });
});

app.post('/api/patients/:id/procedures', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  const { procedure, datetime, performedBy, notes } = req.body;
  if (!procedure || !datetime || !performedBy) {
    return res.status(400).json({ message: 'Procedure, datetime, and performedBy are required.' });
  }

  db.get(`SELECT procedures FROM patients WHERE id = ?`, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const procedures = JSON.parse(row.procedures || '[]');
    const newProcedure = { id: Date.now(), procedure, datetime, performedBy, notes: notes || '' };
    procedures.push(newProcedure);

    db.run(`UPDATE patients SET procedures = ? WHERE id = ?`, [JSON.stringify(procedures), patientId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(newProcedure);
    });
  });
});

// Endpoint to update medication administration status
app.put('/api/patients/:id/medications/:medId', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  const medId = parseInt(req.params.medId);
  const { administered } = req.body;

  db.get(`SELECT medications FROM patients WHERE id = ?`, [patientId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const medications = JSON.parse(row.medications || '[]');
    const medication = medications.find(m => m.id === medId);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found.' });
    }

    medication.administered = administered !== undefined ? administered : medication.administered;

    db.run(`UPDATE patients SET medications = ? WHERE id = ?`, [JSON.stringify(medications), patientId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(medication);
    });
  });
});

app.get('/api/patients/:id/vitals', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  db.all(`SELECT id, patientId, heartRate, bloodPressure, temperature, spo2, respiratoryRate, urineOutput, ventilatorParameters, gcs, inotropesAdded, infusionRates, medicationsOngoing, rhythm, timestamp FROM vitals WHERE patientId = ? ORDER BY timestamp DESC`, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({
      ...row,
      // Add parsing for other JSON fields if they are stored as JSON strings
      ventilatorParameters: row.ventilatorParameters ? JSON.parse(row.ventilatorParameters) : null,
      inotropesAdded: row.inotropesAdded ? JSON.parse(row.inotropesAdded) : null,
      infusionRates: row.infusionRates ? JSON.parse(row.infusionRates) : null,
      medicationsOngoing: row.medicationsOngoing ? JSON.parse(row.medicationsOngoing) : null,
    })));
  });
});

app.post('/api/patients/:id/vitals', auth, (req, res) => {
  const patientId = parseInt(req.params.id);
  const { heartRate, bloodPressure, temperature, spo2, respiratoryRate, urineOutput, ventilatorParameters, gcs, inotropesAdded, infusionRates, medicationsOngoing, rhythm, timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).json({ message: 'Timestamp is required.' });
  }

  db.run(`INSERT INTO vitals (patientId, heartRate, bloodPressure, temperature, spo2, respiratoryRate, urineOutput, ventilatorParameters, gcs, inotropesAdded, infusionRates, medicationsOngoing, rhythm, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [patientId, heartRate, bloodPressure, temperature, spo2, respiratoryRate, urineOutput, ventilatorParameters ? JSON.stringify(ventilatorParameters) : null, gcs, inotropesAdded, infusionRates, medicationsOngoing, rhythm, timestamp], 
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, patientId, heartRate, bloodPressure, temperature, spo2, respiratoryRate, urineOutput, ventilatorParameters, gcs, inotropesAdded, infusionRates, medicationsOngoing, rhythm, timestamp });
    }
  );
});

// API endpoints for Bundles
app.get('/api/bundles', auth, (req, res) => {
  db.all(`SELECT * FROM bundles`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/bundles/:bundleId/items', auth, (req, res) => {
  const bundleId = parseInt(req.params.bundleId);
  db.all(`SELECT * FROM bundle_items WHERE bundleId = ?`, [bundleId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/patients/:patientId/bundle-checks', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const { bundleItemId, checkedBy, isChecked } = req.body;
  const checkDate = new Date().toISOString();

  if (!bundleItemId || !checkedBy) {
    return res.status(400).json({ message: 'Bundle item ID and checker are required.' });
  }

  db.run(`INSERT INTO patient_bundle_checks (patientId, bundleItemId, checkedBy, checkDate, isChecked) VALUES (?, ?, ?, ?, ?)`,
    [patientId, bundleItemId, checkedBy, checkDate, isChecked],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, patientId, bundleItemId, checkedBy, checkDate, isChecked });
    }
  );
});

app.get('/api/patients/:patientId/bundle-checks', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  db.all(`SELECT pbc.*, bi.itemText, b.name as bundleName
          FROM patient_bundle_checks pbc
          JOIN bundle_items bi ON pbc.bundleItemId = bi.id
          JOIN bundles b ON bi.bundleId = b.id
          WHERE pbc.patientId = ? ORDER BY pbc.checkDate DESC`, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/patients/:patientId/bundle-checks', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  db.all(`SELECT pbc.*, bi.itemText, b.name as bundleName
          FROM patient_bundle_checks pbc
          JOIN bundle_items bi ON pbc.bundleItemId = bi.id
          JOIN bundles b ON bi.bundleId = b.id
          WHERE pbc.patientId = ? ORDER BY pbc.checkDate DESC`, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoints for Doctor Handovers
app.post('/api/patients/:patientId/doctor-handovers', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const { handoverText, handoverBy } = req.body;
  const handoverDate = new Date().toISOString();

  if (!handoverText || !handoverBy) {
    return res.status(400).json({ message: 'Handover text and author are required.' });
  }

  db.run(`INSERT INTO doctor_handovers (patientId, handoverText, handoverBy, handoverDate) VALUES (?, ?, ?, ?)`,
    [patientId, handoverText, handoverBy, handoverDate],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, patientId, handoverText, handoverBy, handoverDate });
    }
  );
});

app.get('/api/patients/:patientId/doctor-handovers', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  db.all(`SELECT * FROM doctor_handovers WHERE patientId = ? ORDER BY handoverDate DESC`, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API endpoints for Nurse Handovers
app.post('/api/patients/:patientId/nurse-handovers', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  const { handoverText, handoverBy } = req.body;
  const handoverDate = new Date().toISOString();

  if (!handoverText || !handoverBy) {
    return res.status(400).json({ message: 'Handover text and author are required.' });
  }

  db.run(`INSERT INTO nurse_handovers (patientId, handoverText, handoverBy, handoverDate) VALUES (?, ?, ?, ?)`,
    [patientId, handoverText, handoverBy, handoverDate],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID, patientId, handoverText, handoverBy, handoverDate });
    }
  );
});

app.get('/api/patients/:patientId/nurse-handovers', auth, (req, res) => {
  const patientId = parseInt(req.params.patientId);
  db.all(`SELECT * FROM nurse_handovers WHERE patientId = ? ORDER BY handoverDate DESC`, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  let intervalId;

  socket.on('requestVitals', ({ patientId, interval }) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
      socket.emit('vitals', {
        heartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
        bloodPressure: `${Math.floor(Math.random() * (120 - 110 + 1)) + 110}/${Math.floor(Math.random() * (80 - 70 + 1)) + 70}`,
        temperature: (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1),
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
        respiratoryRate: Math.floor(Math.random() * (20 - 12 + 1)) + 12,
        urineOutput: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
        gcs: Math.floor(Math.random() * (15 - 3 + 1)) + 3,
        ventilatorParameters: {
          mode: 'SIMV',
          fio2: (Math.random() * (0.8 - 0.21) + 0.21).toFixed(2),
          peep: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
          tidalVolume: Math.floor(Math.random() * (500 - 300 + 1)) + 300,
          rr: Math.floor(Math.random() * (25 - 10 + 1)) + 10,
          peakPressure: Math.floor(Math.random() * (30 - 15 + 1)) + 15,
          plateauPressure: Math.floor(Math.random() * (25 - 10 + 1)) + 10,
          meanPressure: Math.floor(Math.random() * (15 - 5 + 1)) + 5,
        },
      });
    }, getInterval(interval));
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    clearInterval(intervalId);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});