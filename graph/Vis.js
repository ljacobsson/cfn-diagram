"use strict";
const jsonUtil = require("../resources/JsonUtil");
const icons = require("./ui/icons");
const filterConfig = require("../resources/FilterConfig");
const tempDirectory = require("temp-dir");
const fs = require("fs");
const path = require("path");
const open = require("open");
const ColorHash = require("color-hash");
const { yamlParse, yamlDump } = require("yaml-cfn");
const colorHash = new ColorHash();
let nodes = [];
let edges = [];
let nested = [];
let types = new Set();
let useJson;

function reset() {
  nodes = [];
  edges = [];
  nested = [];
  types = new Set();
}

function makeGraph(template, prefix) {
  const resources = Object.keys(template.Resources);
  try {
    for (const resource of resources) {
      const resObj = template.Resources[resource];
      const type = resObj.Type;
      types.add(type);
      if (resObj.Template) {
        nested.push(resource);
        makeGraph(resObj.Template, resource);
      }
      const dependencies = getDependencies(template, resource);

      addnodes(
        resource,
        dependencies,
        type,
        template.Resources[resource],
        prefix
      );
    }

    for (const sourceVertex of nodes) {
      for (const dependencyNode of sourceVertex.dependencies) {
        for (const dependency of dependencyNode.value) {
          const targets = nodes.filter(
            (p) => p.id === prefix + "." + dependency
          );
          const targetVertex = targets[0];
          if (!targetVertex) {
            continue;
          }
          let from = sourceVertex.id;
          let to = targetVertex.id;
          addEdges(from, to, dependencyNode, sourceVertex, prefix);
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
  }
  return { nodes, edges };
}

function addEdges(from, to, dependencyNode, fromNode, prefix) {
  if (from && to) {
    if (dependencyNode.path.indexOf("Properties.Events") > 0) {
      edges.push({
        to: from,
        from: to,
        label: "Invoke",
      });
    } else {
      const descriptor = pathToDescriptor(dependencyNode.path);
      if (
        edges.filter(
          (p) => p.from === from && p.to === to && p.label === descriptor
        ).length
      ) {
        return;
      }

      edges.push({
        from,
        to,
        label: descriptor,
        color: {
          color: colorHash.hex(descriptor),
        },
      });
    }
  }
}

function addnodes(resource, dependencies, type, resourceObject, prefix) {
  delete resourceObject.Template;
  if (nodes.filter((p) => p.id === resource).length === 0) {
    nodes.push({
      id: `${prefix}.${resource}`,
      dependencies: dependencies,
      prefix: prefix,
      hidden: prefix != "root",
      type: type,
      label: resource,
      shape: "image",
      image: createImage(type),
      title: `<pre>${
        useJson
          ? JSON.stringify(resourceObject, null, 2)
          : yamlDump(resourceObject).replace(/>/g, "").replace(/</g, "")
      }</pre>`,
      resource: resourceObject,
    });
  }
}
function createImage(resourceType) {
  const type = resourceType.split("::")[1].toLowerCase();
  var svg =
    icons.iconMap.get(resourceType) ||
    '<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"    width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g>   <rect x="15" y="15" fill="#FF9900" width="70" height="70"/>   <g>       <path fill="#FFFFFF" d="M39.4,47c0,0.6,0.1,1.1,0.2,1.4c0.1,0.4,0.3,0.7,0.5,1.2c0.1,0.1,0.1,0.3,0.1,0.4c0,0.2-0.1,0.3-0.3,0.5           l-1,0.7c-0.2,0.1-0.3,0.1-0.4,0.1c-0.2,0-0.3-0.1-0.5-0.2c-0.2-0.2-0.4-0.5-0.6-0.8c-0.2-0.3-0.3-0.6-0.5-1           c-1.3,1.5-2.9,2.2-4.8,2.2c-1.4,0-2.4-0.4-3.2-1.2c-0.8-0.8-1.2-1.8-1.2-3.1c0-1.4,0.5-2.5,1.5-3.3c1-0.8,2.3-1.3,4-1.3           c0.5,0,1.1,0,1.7,0.1c0.6,0.1,1.2,0.2,1.9,0.4V42c0-1.2-0.3-2.1-0.8-2.6c-0.5-0.5-1.4-0.8-2.6-0.8c-0.6,0-1.1,0.1-1.7,0.2           c-0.6,0.1-1.2,0.3-1.7,0.6c-0.3,0.1-0.5,0.2-0.6,0.2c-0.1,0-0.2,0-0.3,0c-0.2,0-0.3-0.2-0.3-0.5v-0.8c0-0.3,0-0.5,0.1-0.6           c0.1-0.1,0.2-0.2,0.5-0.3c0.6-0.3,1.2-0.5,2-0.7c0.8-0.2,1.6-0.3,2.5-0.3c1.9,0,3.3,0.4,4.2,1.3c0.9,0.9,1.3,2.2,1.3,4V47z            M32.8,49.5c0.5,0,1.1-0.1,1.7-0.3c0.6-0.2,1.1-0.5,1.5-1c0.3-0.3,0.4-0.6,0.6-1c0.1-0.4,0.2-0.9,0.2-1.4V45           c-0.5-0.1-1-0.2-1.5-0.3c-0.5-0.1-1-0.1-1.5-0.1c-1.1,0-1.9,0.2-2.4,0.7c-0.5,0.4-0.8,1.1-0.8,1.9c0,0.8,0.2,1.3,0.6,1.7           C31.5,49.3,32,49.5,32.8,49.5z M45.8,51.2c-0.3,0-0.5-0.1-0.6-0.2c-0.1-0.1-0.2-0.3-0.3-0.6L41,37.9c-0.1-0.3-0.1-0.5-0.1-0.7           c0-0.3,0.1-0.4,0.4-0.4h1.6c0.3,0,0.5,0.1,0.6,0.2c0.1,0.1,0.2,0.3,0.3,0.6l2.7,10.7l2.5-10.7c0.1-0.3,0.2-0.5,0.3-0.6           c0.1-0.1,0.3-0.2,0.7-0.2h1.3c0.3,0,0.5,0.1,0.7,0.2c0.1,0.1,0.2,0.3,0.3,0.6l2.6,10.9l2.8-10.9c0.1-0.3,0.2-0.5,0.3-0.6           c0.1-0.1,0.3-0.2,0.6-0.2h1.5c0.3,0,0.4,0.1,0.4,0.4c0,0.1,0,0.2,0,0.3c0,0.1-0.1,0.2-0.1,0.4l-3.9,12.5c-0.1,0.3-0.2,0.5-0.3,0.6           c-0.1,0.1-0.3,0.2-0.6,0.2h-1.4c-0.3,0-0.5-0.1-0.7-0.2c-0.1-0.1-0.2-0.3-0.3-0.7L50.7,40l-2.5,10.4c-0.1,0.3-0.2,0.5-0.3,0.7           c-0.1,0.1-0.4,0.2-0.7,0.2H45.8z M66.6,51.7c-0.9,0-1.7-0.1-2.5-0.3c-0.8-0.2-1.4-0.4-1.9-0.7c-0.3-0.2-0.4-0.3-0.5-0.5           c-0.1-0.2-0.1-0.3-0.1-0.5V49c0-0.3,0.1-0.5,0.4-0.5c0.1,0,0.2,0,0.3,0.1c0.1,0,0.2,0.1,0.4,0.2c0.5,0.2,1.1,0.4,1.8,0.6           c0.6,0.1,1.3,0.2,1.9,0.2c1,0,1.8-0.2,2.4-0.5c0.6-0.4,0.8-0.9,0.8-1.5c0-0.5-0.1-0.8-0.4-1.1c-0.3-0.3-0.8-0.6-1.6-0.9l-2.4-0.7           c-1.2-0.4-2.1-0.9-2.6-1.6c-0.5-0.7-0.8-1.5-0.8-2.4c0-0.7,0.1-1.3,0.4-1.8c0.3-0.5,0.7-1,1.2-1.3c0.5-0.4,1-0.6,1.7-0.8           c0.6-0.2,1.3-0.3,2-0.3c0.4,0,0.7,0,1.1,0.1c0.4,0,0.7,0.1,1,0.2c0.3,0.1,0.6,0.2,0.9,0.3c0.3,0.1,0.5,0.2,0.7,0.3           c0.2,0.1,0.4,0.3,0.5,0.4c0.1,0.1,0.1,0.3,0.1,0.5v0.8c0,0.3-0.1,0.5-0.4,0.5c-0.1,0-0.3-0.1-0.6-0.2c-0.9-0.4-2-0.6-3.1-0.6           c-0.9,0-1.6,0.2-2.2,0.5c-0.5,0.3-0.8,0.8-0.8,1.4c0,0.5,0.2,0.8,0.5,1.1c0.3,0.3,0.9,0.6,1.8,0.9l2.3,0.7c1.2,0.4,2,0.9,2.5,1.6           c0.5,0.7,0.8,1.4,0.8,2.3c0,0.7-0.1,1.3-0.4,1.9c-0.3,0.6-0.7,1-1.2,1.4c-0.5,0.4-1.1,0.7-1.8,0.9C68.2,51.6,67.5,51.7,66.6,51.7z           "/>       <g>           <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M69.7,59.5c-5.3,3.9-13.1,6-19.7,6c-9.3,0-17.8-3.5-24.1-9.2               c-0.5-0.5-0.1-1.1,0.5-0.7c6.9,4,15.4,6.4,24.1,6.4c5.9,0,12.4-1.2,18.4-3.8C69.8,57.9,70.6,58.9,69.7,59.5z"/>           <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M71.9,57c-0.7-0.9-4.5-0.4-6.2-0.2c-0.5,0.1-0.6-0.4-0.1-0.7               c3.1-2.1,8.1-1.5,8.6-0.8c0.6,0.7-0.2,5.7-3,8.1c-0.4,0.4-0.9,0.2-0.7-0.3C71.2,61.5,72.6,57.9,71.9,57z"/>       </g>   </g></g></svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
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
    dependency.value = dependency.value.filter((p) => template.Resources[p]);
  }
  return dependencies;
}

function pathToDescriptor(path) {
  if (filterConfig.edgeMode === "Off") {
    return "";
  }
  if (path.startsWith("$.Properties.Environment")) {
    return "Variable";
  }

  if (path.startsWith("$.Properties.Policies")) {
    const split = path.split(".");
    return split[3];
  }
  return path.split(".").slice(-1)[0];
}

function renderTemplate(template, isJson, filePath) {
  useJson = isJson;
  const { nodes, edges } = makeGraph(template, "root");
  const fileContent = `
  
  var nodes = new vis.DataSet(${JSON.stringify(nodes)});
  var edges = new vis.DataSet(${JSON.stringify(edges)});
  var nested = ${JSON.stringify(nested.sort())};
  var types = ${JSON.stringify(Array.from(types).sort())};
  `;
  const uiPath = filePath || path.join(tempDirectory, "cfn-diagram");
  if (!fs.existsSync(uiPath)) {
    fs.mkdirSync(uiPath);
  }
  fs.copyFileSync(
    path.join(__dirname, "ui", "index.html"),
    path.join(uiPath, "index.html")
  );
  fs.copyFileSync(
    path.join(__dirname, "ui", "icons.js"),
    path.join(uiPath, "icons.js")
  );
  fs.writeFileSync(path.join(uiPath, "data.js"), fileContent);
  open(path.join(uiPath, "index.html"));
}

module.exports = {
  renderTemplate,
  reset,
};
