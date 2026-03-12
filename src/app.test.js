// src/app.test.js — Tests for the Express app
const request = require('supertest');
const app = require('./app');

test('GET / returns hello message', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('GET /health returns healthy', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('healthy');
});