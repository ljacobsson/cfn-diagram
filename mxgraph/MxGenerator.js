"use strict";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const jsonUtil = require("../resources/JsonUtil");
const iconMap = require("../resources/IconMap");
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

const graph = new mxGraph();

let currentLayout = "mxHierarchicalLayout";

let vertices = [];
let forceLayoutRender = true;
let locationCache = {};
const parent = graph.getDefaultParent();
function makeGraph(template, resourceTypesToInclude, resourceNamesToInclude) {
  let layout = new mxgraph[currentLayout](graph, true, 500);
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
        !resourceTypesToInclude.includes(type) ||
        !resourceNamesToInclude.includes(resource)
      ) {
        updateFilters(type, resource);
        continue;
      }

      const dependencies = getDependencies(
        template,
        resource,
        resourceTypesToInclude
      );

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
    const existingEdges = Object.keys(graph.model.cells).filter(
      (c) => c === edgeId(to, from)
    );
    if (existingEdges.length > 0) {
      const existingEdge = graph.model.cells[existingEdges[0]];
      if (!existingEdge.value.includes(pathToDescriptor(dependencyNode.path))) {
        existingEdge.value += `\n${pathToDescriptor(dependencyNode.path)}`;
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
        pathToDescriptor(dependencyNode.path),
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

function getDependencies(template, resource, resourceTypesToInclude) {
  const dependencies = [];
  jsonUtil.findAllValues(template.Resources[resource], dependencies, "Ref");
  jsonUtil.findAllValues(
    template.Resources[resource],
    dependencies,
    "Fn::GetAtt"
  );
  for (const dependency of dependencies) {
    dependency.value = dependency.value.filter(
      (p) =>
        template.Resources[p] &&
        resourceTypesToInclude.includes(template.Resources[p].Type)
    );
  }
  return dependencies;
}

function updateFilters(type, resource) {
  const cells = graph.model.cells;
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

function pathToDescriptor(path) {
  if (path.startsWith("$.Properties.Environment")) {
    return path.split(".").slice(-1)[0];
  }

  if (path.startsWith("$.Properties.Policies")) {
    const split = path.split(".");
    return split[3];
  }
  return "";
}

function graphToXML(graph) {
  var encoder = new mxCodec();
  var result = encoder.encode(graph.getModel());
  return mxUtils.getXml(result);
}

function renderTemplate(template, resourceTypes, resourceNames) {
  const xml = graphToXML(makeGraph(template, resourceTypes, resourceNames));
  return xml;
}

module.exports = {
  renderTemplate,
  layouts,
};
