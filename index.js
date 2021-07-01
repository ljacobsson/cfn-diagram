#!/usr/bin/env node
const program = require("commander");
require("./commands/draw.io");
require("./commands/html");
require("./commands/browse");
const packageDescriptor = require("./package.json");
program.version(packageDescriptor.version, "-v, --vers", "output the current version");
program.parse(process.argv);
