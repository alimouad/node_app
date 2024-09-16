
const express = require("express");
const path = require("path");


const app = express();
// convert data into json format
app.use(express.json());

const { Pool } = require('pg');


// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mdb',
    password: 'mouadali2020',
    port: 5432, // default Postgres port
});



pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Connection successful, current time:', result.rows[0]);
        // Close the pool connection
    });
});

app.get('/', (req, res) => {
    res.render("/public/map.ejs");
});

app.get('/get-geojson', async (req, res) => {
    try {
        const result = await pool.query('SELECT ST_AsGeoJSON(geom) AS geojson FROM ss');
        const geojson = result.rows.map(row => JSON.parse(row.geojson));
        res.json(geojson);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));