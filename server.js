// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
const API_USERNAME = process.env.CCApiUser;
const API_PASSWORD = process.env.CCApiPW;

const allowedOrigin = process.env.WEBSITE_CORS_ALLOWED_ORIGINS || "*";

const validateOrigin =() => ((req, res, next) => {
    const origin = req.headers.origin;

    // Reject requests with no origin (like direct browser hits)
    // if (!origin || origin !== allowedOrigin) {
    //     return res.status(403).json({ message: 'Access forbidden: invalid origin' });
    // }


    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/api/courses/:subject/:termCode', validateOrigin() ,async (req, res) => {
    const { subject, termCode } = req.params;
    console.log(req.ip +" requested "+subject+" data for "+termCode);
    try {
        const response = await axios.get(
            `https://opendata.concordia.ca/API/v1/course/scheduleTerm/filter/${subject}/${termCode}`,
            {
                auth: {
                    username: API_USERNAME,
                    password: API_PASSWORD,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching course data:', error.message);
        res.status(500).json({ message: 'Error fetching course data' });
    }
});

app.get('/api/descriptions/:subject/', validateOrigin(),async (req, res) => {
    const { subject} = req.params;

    try {
        const response = await axios.get(
            `https://opendata.concordia.ca/API/v1/course/scheduleTerm/filter/${subject}/${termCode}`,
            {
                auth: {
                    username: API_USERNAME,
                    password: API_PASSWORD,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching course descriptions:', error.message);
        res.status(500).json({ message: 'Error fetching course descriptions' });
    }
});

app.get('/api/information/:subject/', validateOrigin(),async (req, res) => {
    const { subject} = req.params;

    try {
        const response = await axios.get(
            `https://opendata.concordia.ca/API/v1/course/catalog/filter/${subject}/*/*`,
            {
                auth: {
                    username: API_USERNAME,
                    password: API_PASSWORD,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching course info:', error.message);
        res.status(500).json({ message: 'Error fetching course info' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});


app.get('/api/info', (req, res) => {
    res.send(
        "<h1>"+corsOptions.origin+"</h1>"+
        "<h1>"+corsOptions.origin+"</h1>"
    );
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
