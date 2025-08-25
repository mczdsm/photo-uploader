import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 5173;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(morgan('dev')); // Log HTTP requests to the console
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'dist'))); // Serve static files from the 'dist' directory

// Endpoint to receive logs from the client
app.post('/log', (req, res) => {
  const { level, message, ...meta } = req.body;
  console[level](message, meta);
  res.sendStatus(200);
});

// Catch-all to serve index.html for any other request (for single-page applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
