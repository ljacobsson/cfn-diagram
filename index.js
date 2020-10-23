#!/usr/bin/env node
const mxGenerator = require("./graph/MxGenerator");
const program = require("commander");
const YAML = require("yaml-cfn");
const fs = require("fs");
const path = require("path");
const jsonUtil = require("./resources/JsonUtil");
const filterConfig = require("./resources/FilterConfig");
const inquirer = require("inquirer");
const tempDirectory = require("temp-dir");
const Vis = require("./graph/Vis");
const prompt = inquirer.createPromptModule();

const package = require("./package.json");

const actionOption = {
  FilterResourceTypes: "Filter resources by type",
  FilterResourceName: "Filter resources by name",
  EdgeLabels: "Edge labels: On",
};

program.version(package.version, "-v, --vers", "output the current version");

program
  .command("draw.io")
  .alias("d")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yaml"
  )
  .option("-o, --output-file [outputFile]", "Output file", "template.drawio")
  .description("Generates a draw.io diagram from a CloudFormation template")
  .action(async (cmd) => {
    await generate(cmd);
  });
program
  .command("html")
  .alias("h")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yaml"
  )
  .option(
    "-o, --output-path [outputPath]",
    "Output file",
    `${path.join(tempDirectory, "cfn-diagram")}`
  )
  .description("Generates a vis.js diagram from a CloudFormation template")
  .action(async (cmd) => {
    const template = getTemplate(cmd);
    await Vis.renderTemplate(template.template, template.isJson, cmd.outputPath, "html");
  });
program
  .command("image")
  .alias("i")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yaml"
  )
  .option(
    "-o, --output-path [outputPath]",
    "Output path",
    `./`
  )
  .description("Generates a vis.js diagram from a CloudFormation template")
  .action(async (cmd) => {
    const template = getTemplate(cmd);
    await Vis.renderTemplate(template.template, template.isJson, `${path.join(tempDirectory, "cfn-diagram")}`, "image", cmd.outputPath);
  });
program
  .command("generate")
  .alias("g")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yaml"
  )
  .option("-o, --output-file [outputFile]", "Output file", "template.drawio")
  .description("[Deprected] Same as draw.io. Kept for backward compatability")
  .action(async (cmd) => {
    await generate(cmd);
  });

program.parse(process.argv);
async function generate(cmd) {
  const template = getTemplate(cmd).template;
  const resources = [...Object.keys(template.Resources)].sort();
  let types = [];
  for (const resource of resources) {
    types.push(template.Resources[resource].Type);
  }
  types = [...new Set(types)].sort();
  let resourceTypes = { answer: types };
  let resourceNames = { answer: resources };
  let edgeMode = { answer: "On" };
  let actionChoice = {};
  console.log("Writing diagram to ./template.drawio");
  console.log("Press CTRL+C to exit");
  while (true) {
    filterConfig.resourceNamesToInclude = resourceNames.answer;
    filterConfig.resourceTypesToInclude = resourceTypes.answer;
    filterConfig.edgeMode = edgeMode.answer;

    const xml = mxGenerator.renderTemplate(template);
    fs.writeFileSync(cmd.outputFile, xml);

    actionChoice = await prompt({
      message: "Options",
      choices: [
        actionOption.FilterResourceTypes,
        actionOption.FilterResourceName,
        actionOption.EdgeLabels,
      ],
      type: "list",
      name: "answer",
    });

    switch (actionChoice.answer) {
      case actionOption.FilterResourceTypes:
        resourceTypes = await prompt({
          message: "Select resource types to include",
          choices: types,
          default: resourceTypes.answer,
          type: "checkbox",
          name: "answer",
        });
        break;
      case actionOption.FilterResourceName:
        resourceNames = await prompt({
          message: "Select resources to include",
          choices: resources,
          default: resourceNames.answer,
          type: "checkbox",
          name: "answer",
        });
        break;
      case actionOption.EdgeLabels:
        edgeMode = await prompt({
          message: "Toggle edge labels",
          choices: ["On", "Off"],
          default: resourceNames.answer,
          type: "list",
          name: "answer",
        });
        actionOption.EdgeLabels = `Edge labels: ${edgeMode.answer}`;
        break;
    }
  }
}
function getTemplate(cmd) {
  let templateString = "";
  try {
    templateString = fs.readFileSync(cmd.templateFile);
  } catch {
    console.log(
      `Can't find ${cmd.templateFile}. Specify location with -t flag, for example 'evb-local test-rule -t serverless.template'`
    );
    process.exit(1);
  }

  const isJson = jsonUtil.isJson(templateString);
  const parser = isJson ? JSON.parse : YAML.yamlParse;

  const template = parser(templateString);
  Object.keys(template.Resources)
    .filter((p) => template.Resources[p].Type === "AWS::CloudFormation::Stack")
    .map((p) => {
      const res = template.Resources[p];
      if (typeof res.Properties.TemplateURL === "string" && !res.Properties.TemplateURL.startsWith("s3://")) {
        templateString = fs.readFileSync(res.Properties.TemplateURL);
        const isJson = jsonUtil.isJson(templateString);
        const parser = isJson ? JSON.parse : YAML.yamlParse;
        template.Resources[p].Template = parser(templateString);
      }
    });
  return { isJson, template };
}
