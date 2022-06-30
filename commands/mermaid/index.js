const Vis = require("../../graph/Vis");
const program = require("commander");
const template = require("../../shared/templateParser");
const fs = require("fs");
program
  .command("mermaid")
  .alias("m")
  .option(
    "-t, --template-file [templateFile]",
    "Path to template or cdk.json file",
    "template.yaml or cdk.json"
  )
  .option("-all --render-all", "If set, all nested stacks will be rendered. By default only root template is rendered", false)
  .option(
    "-o, --output-path [outputPath]",
    "Name of output file"
  )
  .option("-co, --cdk-output [cdkOutputPath]", "CDK synth output path", `cdk.out`)
  .option("-s, --skip-synth", "Skips CDK synth", false)
  .description("Generates a mermaid graph from a template")
  .action(async (cmd) => {
    ciMode = cmd.ciMode;
    const templateObj = template.get(cmd);
    const graph = await Vis.makeGraph(
      templateObj.template,
      "root",
      false,
      cmd.renderAll
    );

    const groups = {};
    for (const edge of graph.edges) {
      const owner = edge.from.split(".")[0];
      
      if (edge.to.startsWith(`${owner}.`) && edge.from.startsWith(`${owner}.`)) {
        if (!groups[owner]) {
          groups[owner] = [];
        }
        groups[owner].push(edge);
      } else {
        if (!groups["crossgroup"]) {
          groups["crossgroup"] = [];
        }
        groups["crossgroup"].push(edge);
      }
    }
    const uniqueRelations = [];
    let mermaidString = `\`\`\`mermaid\n\tflowchart TB;\n`;
    for (const groupKey in groups) {
      const group = groups[groupKey];
      if (groupKey !== "crossgroup") {
        mermaidString += `\t\tsubgraph ${groupKey !== "root" ? groupKey : "&nbsp;"}\n`;
      }

      mermaidString += `${group.map(p => {
        const fromResource = graph.nodes.find(n => n.id === p.from);
        const toResource = graph.nodes.find(n => n.id === p.to);

        const from = createShape(fromResource);
        const to = createShape(toResource);
        const relation = `\t\t${from}-->${to}`;
        if (!uniqueRelations.includes(relation)) {
          uniqueRelations.push(relation);
          return relation;
        }
      }).filter(p => p).join("\n")}

  `
      if (groupKey !== "crossgroup") {
        mermaidString += `\tend\n`;
      }

    }

    mermaidString += `\n\`\`\``;
    if (cmd.outputPath) {
      fs.writeFileSync(cmd.outputPath, mermaidString);
      console.log(`Wrote Mermaid diagram to ${cmd.outputPath}`);
    } else {
      console.log(mermaidString)
    }
  });

function createShape(resource, cmd) {
  const label = resource.label.replace(/[^a-z0-9\n]/gmi, "").replace(/\s+/g, "");
  const id = resource.id.replace(/[^a-z0-9\n]/gmi, "").replace(/\s+/g, "");;
  const type = resource.type.replace("AWS::", "");
  switch (resource.type) {
    case "AWS::Serverless::Function":
    case "AWS::Lambda::Function":
      return `${id}[[${label}<br/>${type}]]`;
    case "AWS::Serverless::SimpleTable":
    case "AWS::DynamoDB::Table":
    case "AWS::RDS::DBInstance":
    case "AWS::RDS::DBCluster":
      return `${id}[(${label}<br/>${type})]`;
  }
  return `${id}[${label}<br/>${type}]`;

}