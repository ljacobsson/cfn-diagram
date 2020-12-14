"use strict";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const jsonUtil = require("../resources/JsonUtil");
const iconMap = require("../resources/IconMap");
const filterConfig = require("../resources/FilterConfig");
const fs = require("fs");
const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const templateHelper = require("../shared/template");
const actionOption = {
  FilterResourceTypes: "Filter resources by type",
  FilterResourceName: "Filter resources by name",
  EdgeLabels: "Edge labels: On",
};
const YAML = require("yaml-cfn");


global.window = dom.window;
global.document = window.document;
global.XMLSerializer = window.XMLSerializer;
global.navigator = window.navigator;

const mxgraph = require("mxgraph")({});
const { mxGraph, mxCodec, mxUtils } = mxgraph;

const layouts = [
  { name: "Organic", value: "mxFastOrganicLayout" },
  { name: "Circle", value: "mxCircleLayout" },
  { name: "Compact Tree", value: "mxCompactTreeLayout" },
  { name: "Radial Tree", value: "mxRadialTreeLayout" },
];

let currentLayout = "mxHierarchicalLayout";

let vertices = [];
let forceLayoutRender = true;
let locationCache = {};
let graph = new mxGraph();
let parent = graph.getDefaultParent();

function reset() {
  graph = new mxGraph();
  parent = graph.getDefaultParent();
  vertices = [];
  locationCache = {};
}

function makeGraph(template) {
  const layout = new mxgraph[currentLayout](graph, true, 500);
  const resources = Object.keys(template.Resources);
  layout.orientation = "west";
  layout.intraCellSpacing = 50;
  layout.interRankCellSpacing = 200;
  layout.interHierarchySpacing = 100;
  layout.parallelEdgeSpacing = 20;
  layout.leftMargin = 200;
  layout.resizeParent = true;
  graph.getModel().beginUpdate();
  try {
    for (const resource of resources) {
      const type = template.Resources[resource].Type;
      if (
        ((filterConfig.resourceTypesToInclude &&
          filterConfig.resourceNamesToInclude) &&
          (!filterConfig.resourceTypesToInclude.includes(type)) ||
        !filterConfig.resourceNamesToInclude.includes(resource))
      ) {
        updateFilters(type, resource);
        continue;
      }

      const dependencies = getDependencies(template, resource);
      addVertices(resource, dependencies, type);
    }

    for (const sourceVertex of vertices) {
      for (const dependencyNode of sourceVertex.dependencies) {
        for (const dependency of dependencyNode.value) {
          const targets = vertices.filter((p) => p.name === dependency);
          const targetVertex = targets[0];
          if (!targetVertex) {
            continue;
          }
          let from = sourceVertex.vertex;
          let to = targetVertex.vertex;
          addEdges(from, to, dependencyNode);
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    layout.execute(parent);
    forceLayoutRender = false;
    graph.getModel().endUpdate();
  }
  return graph;
}

function addEdges(from, to, dependencyNode) {
  if (from && to) {
    const existingEdges = Object.keys(graph.getModel().cells).filter(
      (c) => c === edgeId(to, from)
    );

    if (existingEdges.length > 0) {
      const existingEdge = graph.model.cells[existingEdges[0]];
      if (filterConfig.edgeMode === "Off") {
        existingEdge.value = "";
      } else if (
        !existingEdge.value.includes(
          jsonUtil.pathToDescriptor(dependencyNode.path, filterConfig)
        )
      ) {
        existingEdge.value += `\n${jsonUtil.pathToDescriptor(
          dependencyNode.path,
          filterConfig
        )}`;
      }
      return;
    }
    if (dependencyNode.path.indexOf("Properties.Events") > 0) {
      graph.insertEdge(
        parent,
        edgeId(to, from),
        "Invoke",
        to,
        from,
        "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fillColor=#1ba1e2;strokeColor=#006EAF;labelBackgroundColor=none;fontColor=#7EA6E0;"
      );
    } else {
      graph.insertEdge(
        parent,
        edgeId(to, from),
        jsonUtil.pathToDescriptor(dependencyNode.path, filterConfig),
        from,
        to,
        "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;labelBackgroundColor=none;fontColor=#EA6B66;"
      );
    }
  }
}

function addVertices(resource, dependencies, type) {
  if (vertices.filter((p) => p.name === resource).length === 0) {
    vertices.push({
      name: resource,
      dependencies: dependencies,
      type: type,
      vertex: graph.insertVertex(
        parent,
        null,
        resource,
        locationCache[resource] ? locationCache[resource].x : 70,
        locationCache[resource] ? locationCache[resource].y : 0,
        50,
        50,
        iconMap.getIcon(type)
      ),
    });
  }
}

function getDependencies(template, resource) {
  const dependencies = [];
  jsonUtil.findAllValues(template.Resources[resource], dependencies, "Ref");
  jsonUtil.findAllValues(template.Resources[resource], dependencies, "Fn::Sub");
  jsonUtil.findAllValues(
    template.Resources[resource],
    dependencies,
    "Fn::GetAtt"
  );
  for (const dependency of dependencies) {
    dependency.value = dependency.value.filter(
      (p) =>
        template.Resources[p] &&
        filterConfig.resourceTypesToInclude.includes(template.Resources[p].Type)
    );
  }
  return dependencies;
}

function updateFilters(type, resource) {
  const cells = graph.getModel().cells;
  const keys = Object.keys(cells);
  keys.map(
    (p) =>
      (locationCache[cells[p].value] = cells[p].geometry
        ? { x: cells[p].geometry.x, y: cells[p].geometry.y }
        : null)
  );
  if (vertices.filter((p) => p.type === type).length) {
    const item = vertices.filter((p) => p.name === resource)[0];
    if (item) {
      graph.removeCells([item.vertex], true);
    }
    vertices = vertices.filter((p) => p.name != resource);
  }
}

function edgeId(to, from) {
  return `${to.value}|${from.value}`; //|${pathToDescriptor(dependencyNode.path)}`;
}

function graphToXML(graph) {
  var encoder = new mxCodec();
  var result = encoder.encode(graph.getModel());
  return `<mxfile host="" modified="2020-05-24T15:21:41.060Z" agent="5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.45.0 Chrome/78.0.3904.130 Electron/7.2.4 Safari/537.36" version="13.1.3" etag="lrwgP8mNOWNbAz78NI_h" pages="2">
            <diagram id="diagramid" name="Diagram">
              ${mxUtils.getXml(result)}
            </diagram>
          </mxfile>`;
}

function renderTemplate(template) {
  const xml = graphToXML(makeGraph(template));
  return xml;
}

async function generate(cmd, template) {
  const ciMode = cmd.ciMode;

  template = template || templateHelper.get(cmd).template;
  jsonUtil.createPseudoResources(template);

  const resources = [...Object.keys(template.Resources)].sort();
  let types = [];
  for (const resource of resources) {
    types.push(template.Resources[resource].Type);
  }
  types = [...new Set(types)].sort();
  let resourceTypes = { answer: types };
  let resourceNames = { answer: resources };
  let edgeMode = { answer: "On" };
  let actionChoice = {};
  console.log("Writing diagram to ./template.drawio");

  if (ciMode) {
    return;
  }

  console.log("Press CTRL+C to exit");
  while (true) {
    filterConfig.resourceNamesToInclude = resourceNames.answer;
    filterConfig.resourceTypesToInclude = resourceTypes.answer;
    
    filterConfig.edgeMode = edgeMode.answer;

    const xml = renderTemplate(template);
    fs.writeFileSync(cmd.outputFile, xml);

    actionChoice = await prompt({
      message: "Options",
      choices: [
        actionOption.FilterResourceTypes,
        actionOption.FilterResourceName,
        actionOption.EdgeLabels,
      ],
      type: "list",
      name: "answer",
    });

    switch (actionChoice.answer) {
      case actionOption.FilterResourceTypes:
        resourceTypes = await prompt({
          message: "Select resource types to include",
          choices: types,
          default: resourceTypes.answer,
          type: "checkbox",
          name: "answer",
        });
        break;
      case actionOption.FilterResourceName:
        resourceNames = await prompt({
          message: "Select resources to include",
          choices: resources,
          default: resourceNames.answer,
          type: "checkbox",
          name: "answer",
        });
        break;
      case actionOption.EdgeLabels:
        edgeMode = await prompt({
          message: "Toggle edge labels",
          choices: ["On", "Off"],
          default: resourceNames.answer,
          type: "list",
          name: "answer",
        });
        actionOption.EdgeLabels = `Edge labels: ${edgeMode.answer}`;
        break;
    }
  }
}


module.exports = {
  renderTemplate,
  layouts,
  reset,
  generate
};
