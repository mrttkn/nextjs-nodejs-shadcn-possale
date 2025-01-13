import sql from 'mssql';

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || '',
  port: Number(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

// Veritabanı bağlantısını sağlayan fonksiyon
async function connectDB() {
  try {
    console.log('Connecting to database...', {
      server: sqlConfig.server,
      database: sqlConfig.database,
      port: sqlConfig.port
    });
    
    const pool = await sql.connect(sqlConfig);
    console.log('Database connected successfully');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

// Uygulama başladığında bağlantıyı test et
connectDB().then(() => {
  console.log('Initial database connection test successful');
}).catch((err) => {
  console.error('Initial database connection test failed:', err);
});

export { connectDB, sql }; 