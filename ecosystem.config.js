module.exports = {
  apps: [
    {
      name: 'sistema-inmobiliaria',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '/root/project-inmobiliaria',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};