declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_SERVER: string;
      DB_PORT: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

export {}; 