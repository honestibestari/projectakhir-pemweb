const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://meihuaofficial.vercel.app",
    env: {
      adminEmail: "admin@nn.com",
      adminPassword: "123456",
      customerEmail: "nana@gmail.com",
      customerPassword: "123456"
    },

    setupNodeEvents(on, config) {},

    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
  }
});
