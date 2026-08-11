module.exports = {
  apps: [
    {
      name: "checklist-hito6",
      script: "./node_modules/vinext/dist/cli.js",
      args: "start --hostname 0.0.0.0 --port 80",
      env: {
        NODE_ENV: "production",
        PORT: "80",
      },
    },
  ],
};

