// index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (reset every server restart)
let employees = []; // { id, name, role }
let logs = [];      // { id, employeeId, type: 'IN' | 'OUT', time }

let employeeIdCounter = 1;
let logIdCounter = 1;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Logging API is running' });
});

// CREATE employee (POST)
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

// READ all employees (GET)
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// READ one employee (GET by ID)
app.get('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);

  const employee = employees.find((e) => e.id === id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json(employee);
});

// FULL UPDATE employee (PUT)
app.put('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, role } = req.body;

  const employeeIndex = employees.findIndex((e) => e.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  if (!name || !role) {
    return res.status(400).json({ error: 'Both name and role are required for PUT' });
  }

  const updatedEmployee = {
    id,
    name,
    role
  };

  employees[employeeIndex] = updatedEmployee;
  res.json(updatedEmployee);
});

// PARTIAL UPDATE employee (PATCH)
app.patch('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, role } = req.body;

  const employee = employees.find((e) => e.id === id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  if (name !== undefined) employee.name = name;
  if (role !== undefined) employee.role = role;

  res.json(employee);
});

// DELETE employee (DELETE)
app.delete('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);

  const index = employees.findIndex((e) => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const deletedEmployee = employees.splice(index, 1)[0];

  // Remove employee logs too
  logs = logs.filter((log) => log.employeeId !== id);

  res.json({
    message: 'Employee deleted successfully',
    employee: deletedEmployee
  });
});

// CLOCK-IN (POST)
app.post('/api/clock-in', (req, res) => {
  const { employeeId } = req.body;

  const employee = employees.find((e) => e.id === Number(employeeId));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const log = {
    id: logIdCounter++,
    employeeId: employee.id,
    type: "IN",
    time: new Date().toISOString(),
  };

  logs.push(log);
  res.status(201).json(log);
});

// CLOCK-OUT (POST)
app.post('/api/clock-out', (req, res) => {
  const { employeeId } = req.body;

  const employee = employees.find((e) => e.id === Number(employeeId));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const log = {
    id: logIdCounter++,
    employeeId: employee.id,
    type: "OUT",
    time: new Date().toISOString(),
  };

  logs.push(log);
  res.status(201).json(log);
});

// GET all logs or filter by employee
app.get('/api/logs', (req, res) => {
  const { employeeId } = req.query;

  if (employeeId) {
    return res.json(
      logs.filter((log) => log.employeeId === Number(employeeId))
    );
  }

  res.json(logs);
});

// START server on AWS (0.0.0.0 IMPORTANT!)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
