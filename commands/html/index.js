const program = require("commander");
const template = require("../../shared/template");
const path = require("path");
const tempDirectory = require("temp-dir");
const Vis = require("../../graph/Vis");
const YAML = require("yaml-cfn");

program
  .command("html")
  .alias("h")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yaml"
  )
  .option(
    "-c, --ci-mode",
    "Disable interactivity",
    false
  )
  .option(
    "-o, --output-path [outputPath]",
    "Output file",
    `${path.join(tempDirectory, "cfn-diagram")}`
  )
  .description("Generates a vis.js diagram from a CloudFormation template")
  .action(async (cmd) => {
    ciMode = cmd.ciMode;
    const templateObj = template.get(cmd);
    await Vis.renderTemplate(templateObj.template, template.isJson, cmd.outputPath, ciMode);
  });
