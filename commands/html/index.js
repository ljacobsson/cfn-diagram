const program = require("commander");
const template = require("../../shared/templateParser");
const path = require("path");
const tempDirectory = require("temp-dir");
const Vis = require("../../graph/Vis");
const YAML = require("yaml-cfn");

program
  .command("html")
  .alias("h")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template or cdk.json file",
    "template.yaml or cdk.json"
  )
  .option("--stacks [stacks]", "Comma separated list of stack name(s) to include. Defaults to all.")
  .option("-all --render-all", "If set, all nested stacks will be rendered. By default only root template is rendered", false)
  .option("-c, --ci-mode", "Disable terminal/console interactivity", false)
  .option(
    "-o, --output-path [outputPath]",
    "Name of output file",
    `${path.join(tempDirectory, "cfn-diagram")}`
  )
  .option("-co, --cdk-output [outputPath]", "CDK synth output path", `cdk.out`)
  .option("-s, --skip-synth", "Skips CDK synth", false)
  .option("-sa, --standalone", "Creates a self-contained standalone index.html", false)
  .description("Generates a vis.js diagram from a CloudFormation template")
  .action(async (cmd) => {
    ciMode = cmd.ciMode;
    const templateObj = template.get(cmd);
    await Vis.renderTemplate(
      templateObj.template,
      template.isJson,
      cmd.outputPath,
      ciMode,
      false,
      cmd.standalone,
      cmd.renderAll
    );
  });
