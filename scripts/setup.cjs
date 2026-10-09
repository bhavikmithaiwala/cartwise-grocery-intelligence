const fs = require("node:fs");
if (!fs.existsSync("backend/.env"))
  fs.copyFileSync("backend/.env.example", "backend/.env");
console.log("Environment ready; existing configuration preserved.");
