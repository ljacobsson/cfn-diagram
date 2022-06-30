import { readFileSync } from "fs";
import { join } from "path";
import { yamlParse } from "yaml-cfn";
import jsonUtil from "../resources/JsonUtil.js";
import { execSync } from "child_process";
import templateCache from "./templateCache.js";
export let isJson;
export function get(cmd) {
  let templateString = "";
  try {
    if (cmd.templateFile === "template.yaml or cdk.json") {
      cmd.templateFile = "template.yaml";
    }
    templateString = readFileSync(cmd.templateFile);
  } catch {
    try {
      templateString = readFileSync("cdk.json").toString();
    } catch {
      console.log(
        `Can't find ${cmd.templateFile} or cdk.json. Specify location with -t flag, for example 'cfn-dia html -t mytemplate.yaml'`
      );
      process.exit(1);
    }
  }

  isJson = jsonUtil.isJson(templateString);
  const parser = isJson ? JSON.parse : yamlParse;

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
        templateString = readFileSync(res.Properties.TemplateURL);
        const isJson = jsonUtil.isJson(templateString);
        const parser = isJson ? JSON.parse : yamlParse;
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
    execSync("cdk synth -o " + cmd.cdkOutput);
  }
  const manifestFile = readFileSync(join(cmd.cdkOutput, "manifest.json"));
  const treeFile = readFileSync(join(cmd.cdkOutput, "tree.json"));
  const manifest = JSON.parse(manifestFile);
  const tree = JSON.parse(treeFile);
  const includeStacks = cmd.stacks ? cmd.stacks.split(",").map(p=>p.trim()) : null;
  let stacks = Object.keys(manifest.artifacts).filter((p) => p !== "Tree" && (!includeStacks || includeStacks.includes(p)));
  const parentStack = Object.keys(tree.tree.children).filter((p) => p !== "Tree" && !p.includes(".assets") && (!includeStacks || includeStacks.includes(p)))[0];
  const template = readFileSync(
    join(cmd.cdkOutput, `${parentStack}.template.json`)
  );
  const parsedTemplate = JSON.parse(template);
  templateCache.templates[parentStack] = parsedTemplate;
  templateCache.rootTemplate = parentStack;
  stacks = stacks.filter(p => p != parentStack);
  for (const stack of stacks.filter(p => !p.endsWith(".assets"))) {
    const childTemplate = readFileSync(
      join(cmd.cdkOutput, `${stack}.template.json`)
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

export default {
  get,
};
