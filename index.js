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

app.get('/games/team/:team', async (req, res) => {
  // Convertir el parámetro a entero
  const teamId = parseInt(req.params.team, 10);
  
  try {
    const result = await pool.query(
      `SELECT 
         g.*,
         t1.team_name as visitor_team_name,
         t2.team_name as home_team_name,
         t1.team_logo AS visitor_team_logo,
         t2.team_logo AS home_team_logo
       FROM games g
       JOIN teams t1 ON g.visitor_team = t1.id
       JOIN teams t2 ON g.home_team = t2.id
       WHERE g.visitor_team = $1 OR g.home_team = $1`,
      [teamId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No se encontraron juegos para el equipo ${teamId}` });
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Iniciar servidor
app.listen(process.env.PORT || 4000, () => {
  console.log('API running on port', process.env.PORT || 4000);
});
