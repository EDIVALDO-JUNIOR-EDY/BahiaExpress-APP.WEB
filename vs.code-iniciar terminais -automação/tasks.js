
// tasks.js
// Simulated task definitions for starting backend, frontend, and Firebase emulators
// This structure mimics VS Code's tasks.json but in JavaScript format

const tasks = [
  {
    label: "Start Backend",
    command: "node index.js",
    cwd: "./backend",
    description: "Starts the backend server"
  },
  {
    label: "Start Frontend",
    command: "npm run dev",
    cwd: "./frontend",
    description: "Starts the frontend development server"
  },
  {
    label: "Start Firebase Emulators",
    command: "firebase emulators:start",
    cwd: "./frontend",
    description: "Starts Firebase emulators for local development"
  },
  {
    label: "Start BahiaExpress",
    type: "composite",
    dependsOn: [
      "Start Backend",
      "Start Frontend",
      "Start Firebase Emulators"
    ],
    description: "Starts all services for BahiaExpress development environment"
  }
];

// Export the tasks array for potential integration with custom tooling
module.exports = tasks;
