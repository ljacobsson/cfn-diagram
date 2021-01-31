const path = require("path");
const fs = require("fs");

const templateStr = fs.readFileSync(path.join(__dirname, "..", "template.json"));
const template = JSON.parse(templateStr.toString());

const jsonUtil = require("../../resources/JsonUtil");

test("Find Ref", async () => {
  const values = [];
  jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Ref");
  expect(values.length).toBe(2);
});

test("Find Fn::GetAtt", async () => {
  const values = [];
  jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Fn::GetAtt");
  console.log(values);
  expect(values.length).toBe(2);
});

test("Find Fn::Sub", async () => {
  const values = [];
  jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Fn::Sub");
  expect(values.length).toBe(1);
});

// test("Find Ref in nested Join", async () => {
//   const values = [];
//   jsonUtil.findAllValues(template.Resources.Function2.Properties, values, "Fn::Sub");
//   expect(values.length).toBe(1);
// });
