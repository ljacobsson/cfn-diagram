const path = require("path");
const fs = require("fs");

const templateStr = fs.readFileSync(path.join(__dirname, "..", "template.json"));
const template = JSON.parse(templateStr.toString());

const jsonUtil = require("../../resources/JsonUtil");

test("Find Ref", async () => {
  const values = [];
  jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Ref");
  console.log(values);
});

test("Find Fn::GetAtt", async () => {
  const values = [];
  jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Fn::GetAtt");
  console.log(values);
});
