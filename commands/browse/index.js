const program = require("commander");
const template = require("../../shared/templateParser");
const Vis = require("../../graph/Vis");
const draw = require("../../graph/MxGenerator");
const AWS = require("aws-sdk");
const cloudFormation = new AWS.CloudFormation();
const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const YAML = require("yaml-cfn");
const jsonUtil = require("../../resources/JsonUtil");

require("@mhlabs/aws-sdk-sso");
program
  .command("browse")
  .alias("b")
  .option("-o --output [output]", "Output format. draw.io or html")
  .option("--output-file [outputFile]", "Output file. Only used when using draw.io output. Defaults to <stack-name>.drawio")
  .option("-p --profile [profile]", "AWS CLI profile")
  .option("-r --region [region]", "AWS region")
  .description("Browses and generates diagrams from your deployed templates")
  .action(async (cmd) => {
    initAuth(cmd);
    let nextToken = null;
    const stackList = [];
    do {
      const response = await cloudFormation
        .listStacks({
          NextToken: nextToken,
          StackStatusFilter: ["CREATE_COMPLETE", "UPDATE_COMPLETE"],
        })
        .promise();
      stackList.push(...response.StackSummaries.map((p) => p.StackName));
      nextToken = response.NextToken;
    } while (nextToken);
    while (true) {
      const stack = await prompt({
        name: "stackName",
        type: "list",
        choices: stackList.sort(),
      });
      const templateBody = (
        await cloudFormation
          .getTemplate({ StackName: stack.stackName })
          .promise()
      ).TemplateBody;
      const isJson = jsonUtil.isJson(templateBody);
      const parser = isJson ? JSON.parse : YAML.yamlParse;

      const template = parser(templateBody);
      if (cmd.output === "html") {
        await Vis.renderTemplate(
          template,
          template.isJson,
          cmd.outputPath,
          false,
          true
        );
      } else {
        cmd.outputFile = cmd.outputFile || stack.stackName + ".drawio"
        await draw.generate(cmd, template);
      }
    }
  });

function initAuth(cmd) {
  process.env.AWS_PROFILE = cmd.profile || process.env.AWS_PROFILE || "default";
  process.env.AWS_REGION = cmd.region || process.env.AWS_REGION;
  AWS.config.credentialProvider.providers.unshift(
    new AWS.SingleSignOnCredentials()
  );
}
