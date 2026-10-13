const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rock_zenekarok_70s',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
app.get('/api/zenekar', async (req, res) => {
    try {
        const [zenekarok] = await db.query(
            'SELECT * FROM zenekarok'
        );

        res.status(200).json(zenekarok);
    } catch (error) {
        console.error('Lekérdezési hiba:', error.message);

        res.status(500).json({
            hiba: 'Nem sikerült lekérdezni a zenekarokat.'
        });
    }
});
app.post('/api/ujzenekar', async (req, res) => {
    const {
        id,
        nev,
        stilus_id,
        orszag,
        varos,
        aktiv_evek,
        tagok,
        legsikeresebb_album,
        kep_url
    } = req.body || {};
    if (
        id == null ||
        nev == null || nev === '' ||
        stilus_id == null ||
        orszag == null || orszag === '' ||
        varos == null || varos === '' ||
        aktiv_evek == null || aktiv_evek === '' ||
        tagok == null || tagok === '' ||
        legsikeresebb_album == null || legsikeresebb_album === '' ||
        kep_url == null || kep_url === ''
    ) {
        return res.status(400).json('Hiányos adatok.');
    }

    try {
        const [eredmeny] = await db.execute(
            `INSERT INTO zenekarok
            (id, nev, stilus_id, orszag, varos, aktiv_evek,
             tagok, legsikeresebb_album, kep_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                nev,
                stilus_id,
                orszag,
                varos,
                aktiv_evek,
                tagok,
                legsikeresebb_album,
                kep_url
            ]
        );

        return res.status(201).json({
            id: eredmeny.insertId || id
        });
    } catch (error) {
        console.error('Rögzítési hiba:', error.message);

        return res.status(500).json({
            hiba: 'Sikertelen rögzítés.'
        });
    }
});
async function inditas() {
    try {
        await db.query('SELECT 1');

        app.listen(PORT, () => {
            console.log(`Szerver: http://localhost:${PORT}`);
            console.log(
                `Zenekarok: http://localhost:${PORT}/api/zenekar`
            );
            console.log(
                `Új zenekar: http://localhost:${PORT}/api/ujzenekar`
            );
        });
    } catch (error) {
        console.error(
            'Nem sikerült csatlakozni az adatbázishoz:',
            error.message
        );
        process.exit(1);
    }
}

inditas();