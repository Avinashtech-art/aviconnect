import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import database
import { initializeDatabase } from './database/sqlite.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import conversationRoutes from './routes/conversations.js';

// Import socket handlers
import { handleSocketConnection } from './socket/socketHandlers.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global variable to track database connection status
let isDbConnected = false;

// Initialize SQLite database
const connectToDatabase = async () => {
  try {
    await initializeDatabase();
    isDbConnected = true;
    console.log('✅ Connected to SQLite database successfully');
  } catch (err) {
    isDbConnected = false;
    console.error('❌ Database initialization failed:', err.message);
    console.warn('🔧 Server will continue running in development mode');
    console.warn('📝 Note: Database-dependent features will not work');
  }
};

// Initialize database connection
connectToDatabase();

// Middleware to check database connection for database-dependent routes
const requireDatabase = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'This feature requires a database connection. Please check server logs.'
    });
  }
  next();
};

// Routes with database dependency middleware
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/messages', requireDatabase, messageRoutes);
app.use('/api/conversations', requireDatabase, conversationRoutes);

// Health check endpoint (works without database)
app.get('/api/health', (req, res) => {
  const dbStatus = isDbConnected ? 'connected' : 'disconnected';
  const serverStatus = 'running';
  
  res.json({ 
    status: 'OK',
    server: serverStatus,
    database: dbStatus,
    timestamp: new Date().toISOString(),
    message: isDbConnected 
      ? 'All systems operational' 
      : 'Server running in development mode (database disconnected)'
  });
});

// Development info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'AviConnect Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: isDbConnected,
      type: 'SQLite',
      location: 'local file system'
    },
    features: {
      authentication: isDbConnected,
      messaging: isDbConnected,
      realtime: true, // Socket.IO works without database
    }
  });
});

// Socket.IO connection handling (works without database)
io.on('connection', (socket) => {
  if (isDbConnected) {
    handleSocketConnection(socket, io);
  } else {
    socket.emit('server_info', {
      message: 'Connected to AviConnect server',
      database: false,
      note: 'Database features are currently unavailable'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  
  // Check if error is database-related
  if (err.code === 'SQLITE_ERROR' || err.name === 'SqliteError') {
    return res.status(503).json({ 
      error: 'Database error',
      message: 'Database operation failed. Please try again later.'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on our end. Please try again later.'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('🚀 AviConnect Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`ℹ️  Server info: http://localhost:${PORT}/api/info`);
  
  if (!isDbConnected) {
    console.log('\n⚠️  DEVELOPMENT MODE NOTICE:');
    console.log('   Database connection is not available');
    console.log('   The server will continue running for frontend development');
    console.log('   Database-dependent features will return 503 errors');
  }
});