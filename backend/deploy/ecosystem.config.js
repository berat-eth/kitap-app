// PM2 Ecosystem Configuration
// Bu dosya PM2 ile uygulamayı yönetmek için kullanılır

module.exports = {
  apps: [
    {
      name: 'sesli-kitap-api',
      script: './dist/app.js',
      cwd: '/var/www/sesli-kitap-backend',
      instances: 'max', // CPU sayısı kadar instance
      exec_mode: 'cluster', // Cluster mode
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      
      // Logging
      log_file: '/var/www/sesli-kitap-backend/logs/combined.log',
      error_file: '/var/www/sesli-kitap-backend/logs/error.log',
      out_file: '/var/www/sesli-kitap-backend/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
