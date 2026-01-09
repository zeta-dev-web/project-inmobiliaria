module.exports = {
  apps: [
    {
      name: 'sistema-inmobiliaria',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/sistema-inmobiliaria/my-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
