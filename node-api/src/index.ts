import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import bookingsRouter from './routes/bookings';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow frontend origin from environment or default to localhost
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NWA Jumpers API is running' });
});

// Bookings routes
app.use('/api/bookings', bookingsRouter);

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

