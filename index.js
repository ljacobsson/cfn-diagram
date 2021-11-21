#!/usr/bin/env node
process.env.AWS_SDK_LOAD_CONFIG = 1;
const program = require("commander");
require("./commands/draw.io");
require("./commands/html");
require("./commands/asciiart");
require("./commands/browse");
const package = require("./package.json");
program.version(package.version, "-v, --vers", "output the current version");
program.parse(process.argv);
