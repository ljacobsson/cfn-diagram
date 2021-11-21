#!/usr/bin/env node
const program = require("commander");
require("./commands/draw.io");
require("./commands/html");
require("./commands/asciiart");
require("./commands/browse");
const package = require("./package.json");
program.version(package.version, "-v, --vers", "output the current version");
program.parse(process.argv);
