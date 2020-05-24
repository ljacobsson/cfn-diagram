#!/usr/bin/env node
const mxGenerator = require("./mxgraph/MxGenerator");
const program = require("commander");
const YAML = require("yaml-cfn");
const fs = require("fs");
const path = require("path");
const jsonUtil = require("./resources/JsonUtil");
const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();

const package = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json")));

const actionOption = {
  FilterResourceTypes: "Filter resources by type",
  FilterResourceName: "Filter resources by name",
  ChangeLayout: "Change layout"
}

program.version(package.version, "-v, --vers", "output the current version");
program
  .command("generate")
  .alias("g")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template",
    "template.yml"
  )
  .option("-o, --output-file [outputFile]", "Output file", "template.drawio")
  .description("Generates a draw.io diagram from a CloudFormation template")
  .action(async (cmd) => {
    let templateString = "";
    try {
      templateString = fs.readFileSync(cmd.templateFile);
    } catch {
      console.log(
        `Can't find ${cmd.templateFile}. Specify location with -t flag, for example 'evb-local test-rule -t serverless.template'`
      );
      process.exit(1);
    }
    const parser = jsonUtil.isJson(templateString)
      ? JSON.parse
      : YAML.yamlParse;
    const template = parser(templateString);
    const resources = [...Object.keys(template.Resources)].sort();
    let types = [];
    for (const resource of resources) {
      types.push(template.Resources[resource].Type);
    }
    types = [...new Set(types)].sort();
    let resourceTypes = { answer: types };
    let resourceNames = { answer: resources };
    let actionChoice = {};
    while (true) {
      const xml = mxGenerator.renderTemplate(template, resourceTypes.answer, resourceNames.answer);
      fs.writeFileSync(cmd.outputFile, xml);
      
      actionChoice = await prompt({
        message: "Options",
        choices: [
          actionOption.FilterResourceTypes,
          actionOption.FilterResourceName,
          //actionOption.ChangeLayout
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
        }        
    }
  });

program.parse(process.argv);
