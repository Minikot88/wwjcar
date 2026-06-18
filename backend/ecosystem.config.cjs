module.exports = {
  apps: [
    {
      name: 'wwjcar-api',
      script: './src/server.js',
      cwd: '/home/ubuntu/infra/projects/wwjcar/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '512M',
      time: true,
      error_file: '/home/ubuntu/infra/projects/wwjcar/logs/api-error.log',
      out_file: '/home/ubuntu/infra/projects/wwjcar/logs/api-out.log'
    }
  ]
};
