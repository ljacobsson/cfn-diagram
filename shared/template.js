const fs = require("fs");
const YAML = require("yaml-cfn");
const jsonUtil = require("../resources/JsonUtil");

function get(cmd) {
  let templateString = "";
  try {
    templateString = fs.readFileSync(cmd.templateFile);
  } catch {
    console.log(
      `Can't find ${cmd.templateFile}. Specify location with -t flag, for example 'cfn-dia html -t mytemplate.yaml'`
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


module.exports = {
    get
}