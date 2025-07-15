module.exports = {
  apps : [{
    name: 'addonlm',
    script: "pnpm",
    args: ["start"],
     env: {
        PORT: 3002
      },
  }],
  watch: false, 
  max_memory_restart: '500M',
};
