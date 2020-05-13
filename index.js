const mxGenerator = require("./mxgraph/MxGenerator");
const path = require("path");
const fs = require("fs");

const template = JSON.parse(fs.readFileSync("tests/template.json").toString());

const xml = mxGenerator.renderTemplate(template);

console.log(xml);