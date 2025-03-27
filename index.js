const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Obtener todos los equipos
app.get('/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Obtener equipo por ID
app.get('/teams/:id', async (req, res) => {
  const teamId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Team not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Crear un nuevo equipo
app.post('/teams', async (req, res) => {
  const { team_name, team_stadium, team_logo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO teams (team_name, team_stadium, team_logo) VALUES ($1, $2, $3) RETURNING *',
      [team_name, team_stadium, team_logo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar servidor
app.listen(process.env.PORT || 4000, () => {
  console.log('API running on port', process.env.PORT || 4000);
});
