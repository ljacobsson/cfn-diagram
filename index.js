#!/usr/bin/env node
const program = require("commander");
require("./commands/draw.io");
require("./commands/html");
require("./commands/asciiart");
require("./commands/browse");
require("./commands/mermaid");
const packag = require("./package.json");
program.version(packag.version, "-v, --vers", "output the current version");
program.parse(process.argv);
