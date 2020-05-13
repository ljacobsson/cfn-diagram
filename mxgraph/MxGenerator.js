"use strict";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const jsonUtil = require("../resources/JsonUtil");

global.window = dom.window;
global.document = window.document;
global.XMLSerializer = window.XMLSerializer;
global.navigator = window.navigator;

var viewerModulePath = "mxgraph";
const mxgraph = require(viewerModulePath)({
});

const { mxGraph, mxCodec, mxUtils } = mxgraph;

function makeGraph(template) {
  const resources = Object.keys(template.Resources);

  const graph = new mxGraph();
  var parent = graph.getDefaultParent();
  const vertices = [];
  graph.getModel().beginUpdate();
  try {
    for (const resource of resources) {
      const dependencies = [];
      jsonUtil.findAllValues(template.Resources[resource], dependencies, "Ref");
      jsonUtil.findAllValues(
        template.Resources[resource],
        dependencies,
        "Fn::GetAtt"
      );
      vertices.push({
        name: resource,
        dependencies: dependencies,
        vertex: graph.insertVertex(
          parent,
          null,
          resource,
          Math.random() * 800,
          Math.random() * 800,
          80,
          30
        ),
      });
    }
    for (const vertex of vertices) {
      for (const dependencyList of vertex.dependencies) {
        for (const dependency of dependencyList.value) {
          const target = vertices.filter((p) => p.name === dependency)[0];
          const x = graph.insertEdge(
            parent,
            null,
            "",
            vertex.vertex,
            target ? target.vertex : null,
            "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
          );
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    graph.getModel().endUpdate();
  }
  return graph;
}

function graphToXML(graph) {
  var encoder = new mxCodec();
  var result = encoder.encode(graph.getModel());
  return mxUtils.getXml(result);
}

function renderTemplate(template) {
  const xml = graphToXML(makeGraph(template));
  return xml;
}

module.exports = {
  renderTemplate,
};
