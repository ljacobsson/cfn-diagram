import command from "commander";
import { renderTemplate } from "../../graph/Vis.js";
import { generate } from "../../graph/MxGenerator.js";
import awsPkg from 'aws-sdk';
const { CloudFormation, config, SingleSignOnCredentials } = awsPkg;
const cloudFormation = new CloudFormation();
import inquirer from "inquirer";
const prompt = inquirer.createPromptModule();
import { yamlParse } from "yaml-cfn";
import { isJson as _isJson } from "../../resources/JsonUtil.js";

import "@mhlabs/aws-sdk-sso";
command("browse")
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
      const isJson = _isJson(templateBody);
      const parser = isJson ? JSON.parse : yamlParse;

      const template = parser(templateBody);
      if (cmd.output === "html") {
        await renderTemplate(
          template,
          template.isJson,
          cmd.outputPath,
          false,
          true
        );
      } else {
        cmd.outputFile = cmd.outputFile || stack.stackName + ".drawio"
        await generate(cmd, template);
      }
    }
  });

function initAuth(cmd) {
  process.env.AWS_PROFILE = cmd.profile || process.env.AWS_PROFILE || "default";
  process.env.AWS_REGION = cmd.region || process.env.AWS_REGION;
  config.credentialProvider.providers.unshift(
    new SingleSignOnCredentials()
  );
}
