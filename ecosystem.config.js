module.exports = {
  apps: [
    {
      name: 'sistema-inmobiliaria',
      script: 'yarn',
      args: 'start',
      cwd: '/root/project-inmobiliaria',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
