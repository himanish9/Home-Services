const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify MySQL database connection
    await testConnection();

    const server = app.listen(PORT, () => {
      console.log(`
==================================================
  HomeServe Backend API Server
  Status:      RUNNING
  Port:        ${PORT}
  URL:         http://localhost:${PORT}
  Database:    CONNECTED (${process.env.DB_NAME || 'homeserve'})
  Environment: ${process.env.NODE_ENV || 'development'}
==================================================
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server due to database error:', error.message);
    process.exit(1);
  }
};

startServer();
