// index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory "database"
let employees = []; // { id, name, role }
let logs = [];      // { id, employeeId, type: 'IN' | 'OUT', time }

// Simple ID generator
let employeeIdCounter = 1;
let logIdCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Logging API is running' });
});

// Create employee
app.post('/api/employees', (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'name and role are required' });
  }

  const employee = {
    id: employeeIdCounter++,
    name,
    role,
  };

  employees.push(employee);
  res.status(201).json(employee);
});

// List employees
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// Clock-in
app.post('/api/clock-in', (req, res) => {
  const { employeeId } = req.body;

  const employee = employees.find((e) => e.id === Number(employeeId));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const log = {
    id: logIdCounter++,
    employeeId: employee.id,
    type: 'IN',
    time: new Date().toISOString(),
  };

  logs.push(log);
  res.status(201).json(log);
});

// Clock-out
app.post('/api/clock-out', (req, res) => {
  const { employeeId } = req.body;

  const employee = employees.find((e) => e.id === Number(employeeId));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const log = {
    id: logIdCounter++,
    employeeId: employee.id,
    type: 'OUT',
    time: new Date().toISOString(),
  };

  logs.push(log);
  res.status(201).json(log);
});

// Get logs (optionally filter by employeeId)
app.get('/api/logs', (req, res) => {
  const { employeeId } = req.query;

  if (employeeId) {
    return res.json(
      logs.filter((log) => log.employeeId === Number(employeeId))
    );
  }

  res.json(logs);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
