
const { spawn } = require('child_process');

const tasks = [
    {
        label: "Start Backend",
        command: "node",
        args: ["index.js"],
        cwd: "backend"
    },
    {
        label: "Start Frontend",
        command: "npm",
        args: ["run", "dev"],
        cwd: "frontend"
    },
    {
        label: "Start Firebase Emulators",
        command: "firebase",
        args: ["emulators:start"],
        cwd: "frontend"
    }
];

tasks.forEach(task => {
    const proc = spawn(task.command, task.args, {
        cwd: task.cwd,
        shell: true,
        stdio: 'inherit'
    });

    proc.on('close', code => {
        console.log(`Task "${task.label}" exited with code ${code}`);
    });
});
