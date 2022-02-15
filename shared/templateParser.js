const fs = require("fs");
const path = require("path");
const YAML = require("yaml-cfn");
const jsonUtil = require("../resources/JsonUtil");
const cp = require("child_process");
const templateCache = require("./templateCache");

function get(cmd) {
  let templateString = "";
  try {
    if (cmd.templateFile === "template.yaml or cdk.json") {
      cmd.templateFile = "template.yaml";
    }
    templateString = fs.readFileSync(cmd.templateFile);
  } catch {
    try {
      templateString = fs.readFileSync("cdk.json").toString();
    } catch {
      console.log(
        `Can't find ${cmd.templateFile} or cdk.json. Specify location with -t flag, for example 'cfn-dia html -t mytemplate.yaml'`
      );
      process.exit(1);
    }
  }

  const isJson = jsonUtil.isJson(templateString);
  const parser = isJson ? JSON.parse : YAML.yamlParse;

  let template = parser(templateString);
  if (template.app) {
    template = fromCDK(cmd);
  }
  templateCache.templates["root"] = template;
  if (!template.Resources) return { isJson, template };
  Object.keys(template.Resources)
    .filter((p) => template.Resources[p].Type === "AWS::CloudFormation::Stack")
    .map((p) => {
      const res = template.Resources[p];
      if (
        !res.StackImport &&
        typeof res.Properties.TemplateURL === "string" &&
        !res.Properties.TemplateURL.startsWith("s3://")
      ) {
        templateString = fs.readFileSync(res.Properties.TemplateURL);
        const isJson = jsonUtil.isJson(templateString);
        const parser = isJson ? JSON.parse : YAML.yamlParse;
        const parsedTemplate = parser(templateString);
        template.Resources[p].Template = parsedTemplate;
        templateCache.templates[p] = parsedTemplate;
      }
    });
  Object.keys(template.Resources)
    .filter((p) => template.Resources[p].Type === "AWS::Serverless::Function")
    .map((functionName) => {
      const res = template.Resources[functionName];
      const events = res.Properties.Events;
      if (events) {
        for (const eventName of Object.keys(events)) {
          const event = events[eventName];
          if (["EventBridgeRule", "CloudWatchEvent"].includes(event.Type)) {
            template.Resources[functionName + eventName] = {
              Type: "AWS::Events::Rule",
              Properties: {
                EventBusName: event.Properties.EventBusName || "default",
                EventPattern: event.Properties.Pattern,
                State: "ENABLED",
                Targets: [{ Arn: { "Fn::GetAtt": [functionName, "Arn"] },  Id: "EventId"}],
              },
            };
          }
          if (["Api"].includes(event.Type)) {
            template.Resources[functionName + eventName] = {
              Type: "AWS::ApiGateway::RestApi",
              Properties: {
                Integration: [{ Arn: { "Fn::GetAtt": [functionName, "Arn"] },  Id: "EventId"}],
              },
            };
          }
          if (["HttpApi"].includes(event.Type)) {
            template.Resources[functionName + eventName] = {
              Type: "AWS::ApiGatewayV2::Api",
              Properties: {
                Integration: [{ Arn: { "Fn::GetAtt": [functionName, "Arn"] },  Id: "EventId"}],
              },
            };
          }
        }
      }
    });
  return { isJson, template };
}

function fromCDK(cmd) {
  if (!cmd.skipSynth) {
    cp.execSync("cdk synth -o " + cmd.cdkOutput);
  }
  const manifestFile = fs.readFileSync(path.join(cmd.cdkOutput, "manifest.json"));
  const treeFile = fs.readFileSync(path.join(cmd.cdkOutput, "tree.json"));
  const manifest = JSON.parse(manifestFile);
  const tree = JSON.parse(treeFile);
  const includeStacks = cmd.stacks ? cmd.stacks.split(",").map(p=>p.trim()) : null;
  let stacks = Object.keys(manifest.artifacts).filter((p) => p !== "Tree" && (!includeStacks || includeStacks.includes(p)));
  const parentStack = Object.keys(tree.tree.children).filter((p) => p !== "Tree" && !p.includes(".assets") && (!includeStacks || includeStacks.includes(p)))[0];
  const template = fs.readFileSync(
    path.join(cmd.cdkOutput, `${parentStack}.template.json`)
  );
  const parsedTemplate = JSON.parse(template);
  templateCache.templates[parentStack] = parsedTemplate;
  templateCache.rootTemplate = parentStack;
  stacks = stacks.filter(p => p != parentStack);
  for (const stack of stacks) {
    const childTemplate = fs.readFileSync(
      path.join(cmd.cdkOutput, `${stack}.template.json`)
    );
    const parsedChildTemplate = JSON.parse(childTemplate);
    parsedTemplate.Resources[stack] = {
      Type: "AWS::CloudFormation::Stack",
      Template: parsedChildTemplate,
      StackImport: true,
    };
    templateCache.templates[stack] = parsedChildTemplate;
  }
  return parsedTemplate;
}

module.exports = {
  get,
};
