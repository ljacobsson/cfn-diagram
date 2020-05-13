const path = require("path");
const fs = require("fs");

const serverlessFunction = require("../../resources/ServerlessFunction");
const templateStr = fs.readFileSync(path.join(__dirname, "..", "template.json"));
const template = JSON.parse(templateStr.toString());

test("Identify AWS::Serverless::Function resources", async () => {

  const functions = serverlessFunction.getResources(template);
  expect(functions.length).toBe(2);
});

test("Identify resources in policy templates", async () => {
    const dependencies = serverlessFunction.getDependencies(template, "Function2");
  });
  