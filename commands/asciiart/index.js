const program = require("commander");
const mxGenerator = require("../../graph/MxGenerator");
const templateParser = require("../../shared/templateParser");
const filterConfig = require("../../resources/FilterConfig");
const mxGraphToAsciiArt = require("./mxgraph-to-asciiart");
program
  .command("ascii-art")
  .alias("a")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template or cdk.json file",
    "template.yaml or cdk.json"
  )
  .option(
    "--stacks [stacks]",
    "Comma separated list of stack name(s) to include. Defaults to all."
  )
  .option("-co, --cdk-output [outputPath]", "CDK synth output path", `cdk.out`)
  .option("-s, --skip-synth", "Skips CDK synth", false)
  .option(
    "-e, --exclude-types [excludeTypes...]",
    "List of resource types to exclude when using CI mode"
  )
  .description("Generates an ascii-art diagram from a CloudFormation template")
  .action(async (cmd) => {
    const template = templateParser.get(cmd).template;
    filterConfig.resourceNamesToInclude = Object.keys(template.Resources);
    filterConfig.resourceTypesToInclude = Object.keys(template.Resources).map(
      (p) => template.Resources[p].Type
    );
    const xml = await mxGenerator.renderTemplate(template);
    mxGraphToAsciiArt.render(xml);
  });
