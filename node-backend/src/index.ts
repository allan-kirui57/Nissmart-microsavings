import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
import routes from './routes/index';
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, { body: req.body });
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => { res.status(404).json({
    status: 'error', message: 'Route not found'
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
