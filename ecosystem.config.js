module.exports = {
  apps: {
    name: "sipg-tech-server",
    // script: "./node_modules/.bin/ts-node",
    // args: "src/index.ts",
    script: "./dist/index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss.SSS (ZZ)",
    log: true,
    env: {
      TZ: "Asia/Shanghai"
    }
  },
  deploy: {
    production: {
      user: "www-data",
      host: [{ host: "sipglg-eth.codeispoetry.tech", port: "5222" }],
      ref: "origin/master",
      repo: "https://github.com/uicestone/sipg-tech-server",
      path: "/var/www/sipg-tech-server",
      "post-deploy":
        "yarn && yarn build && pm2 startOrRestart ecosystem.config.js"
    },
    testing: {
      user: "www-data",
      host: ["stirad.com"],
      ref: "origin/testing",
      repo: "https://github.com/uicestone/sipg-tech-server",
      path: "/var/www/sipg-tech-server",
      "post-deploy":
        "yarn && yarn build && pm2 startOrRestart ecosystem.config.js"
    }
  }
};
