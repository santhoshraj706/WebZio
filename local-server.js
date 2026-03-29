require('dotenv').config();
const express = require('express');
const path = require('path');
const handler = require('./api/send-email');

const app = express();
const PORT = 3010;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(__dirname));

// Map the Vercel API route to our Express server
app.post('/api/send-email', async (req, res) => {
    await handler(req, res);
});

app.listen(PORT, () => {
    console.log('');
    console.log('==============================================');
    console.log(`🚀 Local Server Running at http://localhost:${PORT}`);
    console.log('   Test the Order Form and API locally!');
    console.log('==============================================');
});
