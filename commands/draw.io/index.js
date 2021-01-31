const program = require("commander");
const mxGenerator = require("../../graph/MxGenerator");

let ciMode = false;

program
  .command("draw.io")
  .alias("d")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template or cdk.json file",
    "template.yaml or cdk.json"
  )
  .option(
    "-c, --ci-mode",
    "Disable interactivity",
    false
  )
  .option("-o, --output-file [outputFile]", "Output file", "template.drawio")
  .option(
    "-co, --cdk-output [outputPath]",
    "CDK synth output path",
    `cdk.out`
  )
  .description("Generates a draw.io diagram from a CloudFormation template")
  .action(async (cmd) => {
    await mxGenerator.generate(cmd);
  });


