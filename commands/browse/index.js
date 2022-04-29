const { program } = require("commander");
const template = require("../../shared/templateParser");
const Vis = require("../../graph/Vis");
const draw = require("../../graph/MxGenerator");
const { CloudFormationClient, ListStacksCommand, GetTemplateCommand } = require("@aws-sdk/client-cloudformation");
const { fromSSO } = require("@aws-sdk/credential-providers");
const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const YAML = require("yaml-cfn");
const jsonUtil = require("../../resources/JsonUtil");

//require("auth/aws-sdk-sso");

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
        const client = new CloudFormationClient();
        let nextToken = null;
        const stackList = [];

        do {
            const listStacksCommand = new ListStacksCommand({
                NextToken: nextToken,
                StackStatusFilter: ["CREATE_COMPLETE", "UPDATE_COMPLETE"],
            });
            const response = await client.send(listStacksCommand);
            stackList.push(...response.StackSummaries.map((p) => p.StackName));
            nextToken = response.NextToken;
        } while (nextToken);
        while (true) {
            const stack = await prompt({
                name: "stackName",
                type: "list",
                choices: stackList.sort(),
            });
            const getTemplateCommand = new GetTemplateCommand({StackName: stack.stackName});
            const templateBody = (await client.send(getTemplateCommand)).TemplateBody;
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
    fromSSO();
}
