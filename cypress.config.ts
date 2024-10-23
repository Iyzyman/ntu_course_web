import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1440, // Set the width to 1440
    viewportHeight: 824, // Set the height to 824
  },
})
