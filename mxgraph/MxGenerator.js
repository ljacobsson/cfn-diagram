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

function makeGraph(template, resourceTypesToInclude, layoutChoice) {
  const resources = Object.keys(template.Resources);

  const graph = new mxGraph();
  const layout = new mxgraph[layoutChoice || "mxFastOrganicLayout"](graph);
  layout.radius = 300;
  layout.forceConstant = 120;
  const parent = graph.getDefaultParent();
  const vertices = [];
  graph.getModel().beginUpdate();
  try {
    for (const resource of resources) {
      const type = template.Resources[resource].Type;
      if (!resourceTypesToInclude.includes(type)) {
        continue;
      }
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

      vertices.push({
        name: resource,
        dependencies: dependencies,
        vertex: graph.insertVertex(
          parent,
          null,
          resource,
          70,
          1,
          50,
          50,
          iconMap.getIcon(type)
        ),
      });
    }

    for (const vertex of vertices) {
      for (const dependencyNode of vertex.dependencies) {
        for (const dependency of dependencyNode.value) {
          const target = vertices.filter((p) => p.name === dependency)[0];
          let from = vertex.vertex;
          let to = target.vertex;

          if (from && to) {
            if (dependencyNode.path.indexOf("Properties.Events") > 0) {
              graph.insertEdge(
                parent,
                null,
                "Event",
                to,
                from,
                "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fillColor=#1ba1e2;strokeColor=#006EAF;labelBackgroundColor=none;fontColor=#7EA6E0;"
              );
            } else {
              const edges = graph.getEdges(from);
              const existing = edges.filter((p) => p.target.value === to.value);
              if (existing.length > 0) {
                const edgeValue = pathToDescriptor(dependencyNode.path);
                if (edgeValue !== null) {
                  existing[0].setValue(
                    `${
                      existing[0].getValue()
                        ? existing[0].getValue() + "\n"
                        : ""
                    }${edgeValue}`
                  );
                }
              } else {
                graph.insertEdge(
                  parent,
                  null,
                  pathToDescriptor(dependencyNode.path),
                  from,
                  to,
                  "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;labelBackgroundColor=none;fontColor=#EA6B66;"
                );
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    graph.getModel().endUpdate();
  }

  layout.execute(parent);
  return graph;
}

function pathToDescriptor(path) {
  if (path.startsWith("$.Properties.Environment")) {
    //return "Variable";
  }

  if (path.startsWith("$.Properties.Policies")) {
    const split = path.split(".");
    return split[3];
  }
  return null;
}

function graphToXML(graph) {
  var encoder = new mxCodec();
  var result = encoder.encode(graph.getModel());
  return mxUtils.getXml(result);
}

function renderTemplate(template, resources, layout) {
  const xml = graphToXML(makeGraph(template, resources, layout));
  return xml;
}

module.exports = {
  renderTemplate,
  layouts,
};
