#!/usr/bin/env node
const mxGenerator = require("./mxgraph/MxGenerator");
const program = require("commander");
const YAML = require("yaml-cfn");
const fs = require("fs");
const jsonUtil = require("./resources/JsonUtil");
const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();

program.version("1.0.3", "-v, --vers", "output the current version");
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
    const resources = Object.keys(template.Resources);
    let types = [];
    for (const resource of resources) {
      types.push(template.Resources[resource].Type);
    }
    types = [...new Set(types)].sort((a, b) => a > b);
    let resourceTypes = { answer: types };
    const filterResources = "Filter resources";
    while (true) {
      let layoutChoice = {};
      while (layoutChoice.answer !== filterResources) {
        const xml = mxGenerator.renderTemplate(template, resourceTypes.answer, layoutChoice.answer);
        fs.writeFileSync(cmd.outputFile, xml);
        layoutChoice = await prompt({
            message: "Select layout",
            choices: [{name: filterResources, value: filterResources}, ...mxGenerator.layouts],
            type: "list",
            name: "answer",
          });
    
      }
      resourceTypes = await prompt({
        message: "Select resource types to include in diagram",
        choices: types,
        type: "checkbox",
        name: "answer",
      });
    }
  });

program.parse(process.argv);
