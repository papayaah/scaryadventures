import express from 'express';
import { getStories, getRandomStory, getStoryById } from './api/stories';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log requests
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static assets from the assets directory
app.use('/assets', express.static('assets'));

// Game API endpoints
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Local dev API is working!', timestamp: new Date().toISOString() });
});

app.get('/api/stories', getStories);
app.get('/api/stories/random', getRandomStory);
app.get('/api/stories/:id', getStoryById);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'local-dev' });
});

app.listen(PORT, () => {
  console.log(`🚀 Local development server running on http://localhost:${PORT}`);
  console.log(`📚 Stories API available at http://localhost:${PORT}/api/stories`);
  console.log(`🎲 Random story API available at http://localhost:${PORT}/api/stories/random`);
  console.log(`📁 Assets served from http://localhost:${PORT}/assets/`);
});

export default app;