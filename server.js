const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();

app.use(express.json());

const LOCAL_USERS_FILE = 'users.json';
const RESET_USERS_FILE = 'reset_users.json';

// ========== I. Külső API-s megoldás ==========

// GET - Összes felhasználó lekérése a jsonplaceholder API-ból
app.get('/apiurl/users', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a külső API elérésénél.' });
  }
});

// POST - Új felhasználó hozzáadása (külső API csak szimulál)
app.post('/apiurl/users', async (req, res) => {
  try {
    const response = await axios.post('https://jsonplaceholder.typicode.com/users', req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült új felhasználót hozzáadni (külső API).' });
  }
});

// PUT - Felhasználó módosítása
app.put('/apiurl/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`https://jsonplaceholder.typicode.com/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült módosítani a felhasználót (külső API).' });
  }
});

// DELETE - Felhasználó törlése
app.delete('/apiurl/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`https://jsonplaceholder.typicode.com/users/${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült törölni a felhasználót (külső API).' });
  }
});

// ========== II. Lokális JSON fájl alapú megoldás ==========

function readLocalUsers() {
  return JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, 'utf-8'));
}

function writeLocalUsers(users) {
  fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2));
}

// GET - Összes felhasználó
app.get('/local/users', (req, res) => {
  res.json(readLocalUsers());
});

// GET - Egy adott felhasználó
app.get('/local/users/:id', (req, res) => {
  const users = readLocalUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: 'Nem található a felhasználó.' });
});

// POST - Új felhasználó hozzáadása (id kötelező)
app.post('/local/users', (req, res) => {
  const users = readLocalUsers();
  if (!req.body.id) return res.status(400).json({ error: 'Az id mező megadása kötelező!' });
  users.push(req.body);
  writeLocalUsers(users);
  res.json(req.body);
});

// DELETE - Felhasználó törlése
app.delete('/local/users/:id', (req, res) => {
  let users = readLocalUsers();
  users = users.filter(u => u.id !== parseInt(req.params.id));
  writeLocalUsers(users);
  res.json({ success: true });
});

// (Szorgalmi) RESET - Felhasználók visszaállítása
app.post('/local/reset', (req, res) => {
  const resetData = JSON.parse(fs.readFileSync(RESET_USERS_FILE, 'utf-8'));
  writeLocalUsers(resetData);
  res.json({ success: true });
});

// Indítás
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
