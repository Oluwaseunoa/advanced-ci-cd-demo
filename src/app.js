// src/app.js — A simple Express web server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from GitHub Actions CI/CD!', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

module.exports = app;