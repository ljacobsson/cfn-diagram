const program = require("commander");
const mxGenerator = require("../../graph/MxGenerator");

let ciMode = false;

program
  .command("draw.io")
  .alias("d")
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
  .option("-o, --output-file [outputFile]", "Output file", "template.drawio")
  .description("Generates a draw.io diagram from a CloudFormation template")
  .action(async (cmd) => {
    await mxGenerator.generate(cmd);
  });


