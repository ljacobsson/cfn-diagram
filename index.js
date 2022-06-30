#!/usr/bin/env node
import pkg from 'commander';
const { version, parse } = pkg;
import "./commands/draw.io/index.js";
import "./commands/html/index.js";
import "./commands/asciiart/index.js";
import "./commands/browse/index.js";
import "./commands/mermaid/index.js";
const pack = require("./package.json");
version(pack.version, "-v, --vers", "output the current version");
parse(process.argv);
