module.exports = {
  apps: [
    {
      name: 'jgap-farm-management',
      script: 'npm',
      args: 'run dev:sandbox',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
