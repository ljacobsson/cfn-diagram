import command from "commander";
import { reset, renderTemplate } from "../../graph/MxGenerator.js";
import { get } from "../../shared/templateParser.js";
import { resourceNamesToInclude, resourceTypesToInclude } from "../../resources/FilterConfig.js";
import { render as _render } from "./mxgraph-to-asciiart.js";
import { watchFile } from "fs";
command("ascii-art")
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
    "-w, --watch",
    "Watch for changes in template and rerender diagram on change",
    false
  )
  .option(
    "-e, --exclude-types [excludeTypes...]",
    "List of resource types to exclude when using CI mode"
  )
  .description("Generates an ascii-art diagram from a CloudFormation template")
  .action(async (cmd) => {
    const xml = await render(cmd);
    if (cmd.watch) {
      watchFile(cmd.templateFile, (a, b) => {
        render(cmd);
      });
    }
  });
async function render(cmd) {
  try {
    const template = get(cmd).template;

    if (!template.Resources) {
      console.log("Can't find resources");
      return;
    }
    resourceNamesToInclude = Object.keys(template.Resources);
    resourceTypesToInclude = Object.keys(template.Resources).map(
      (p) => template.Resources[p].Type
    );
    reset();
    const xml = await renderTemplate(template);
    _render(xml);
    return xml;
  } catch (err) {
    console.log(err.message);
  }
}
