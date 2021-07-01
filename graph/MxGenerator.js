"use strict";
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const dom = new JSDOM();
const jsonUtil = require("../resources/JsonUtil");
const iconMap = require("../resources/IconMap");
const filterConfig = require("../resources/FilterConfig");
const fs = require("fs");
const inquirer = require("inquirer");
const templateCache = require("../shared/templateCache");
const openInEditor = require("open-in-editor");
const prompt = inquirer.createPromptModule();
const templateHelper = require("../shared/templateParser");
const actionOption = {
    FilterResourceTypes: "Filter resources by type",
    FilterResourceName: "Filter resources by name",
    EdgeLabels: "Edge labels: On",
    Quit: "Quit",
};
const YAML = require("yaml-cfn");
const purposeTag = "mv:purpose";
const groupHeight = 270;
const groupWidth = 120;
const groupIdSuffix = "-purpose-label-text";

global.window = dom.window;
global.document = window.document;
global.XMLSerializer = window.XMLSerializer;
global.navigator = window.navigator;

const mxgraph = require("mxgraph")({});
const {mxGraph, mxCodec, mxUtils, mxConstants, mxHierarchicalEdgeStyle, mxCircleLayout} = mxgraph;

const layouts = [
    {name: "Organic", value: "mxFastOrganicLayout"},
    {name: "Circle", value: "mxCircleLayout"},
    {name: "Compact Tree", value: "mxCompactTreeLayout"},
    {name: "Radial Tree", value: "mxRadialTreeLayout"},
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

function extractServiceName(resource) {
    const type = resource.Type;
    let serviceName = type.substring(type.indexOf("::") + 2);
    serviceName = serviceName.replace(/::/g, " ");
    return serviceName;
}

function extractMetadataPath(resource) {
    let metadataPath = "";
    const metaData = resource.Metadata;
    if (metaData) {
        const path = metaData["aws:cdk:path"];
        metadataPath = path.substring(path.indexOf("/") + 1);
        if (metadataPath.endsWith("/Resource")) {
            metadataPath = metadataPath.replace(/\/Resource$/, "");
        }
        metadataPath = metadataPath.replace(/\//g, " ");
    }
    return metadataPath;
}

function makeGraph(template, prefix = "root") {
    const layout = new mxgraph[currentLayout](graph, mxConstants.DIRECTION_NORTH, true);
    const resources = Object.keys(template.Resources);
    layout.orientation = "west";
    layout.intraCellSpacing = 100;
    layout.interRankCellSpacing = 200;
    layout.interHierarchySpacing = 100;
    layout.parallelEdgeSpacing = 20;
    layout.leftMargin = 200;
    layout.resizeParent = true;
    graph.getModel().beginUpdate();
    try {
        for (const id of resources) {
            const resObj = template.Resources[id];
            let serviceName = extractServiceName(resObj);
            let componentFunction = extractMetadataPath(resObj);
            const type = resObj.Type;
            if (
                (filterConfig.resourceTypesToInclude &&
                    filterConfig.resourceNamesToInclude &&
                    !filterConfig.resourceTypesToInclude.includes(type)) ||
                !filterConfig.resourceNamesToInclude.includes(id)
            ) {
                updateFilters(type, id, serviceName, componentFunction, prefix);
                continue;
            }
            if (resObj.Template) {
                makeGraph(resObj.Template, id);
            }

            const dependencies = getDependencies(template, id);
            addVertices(id, serviceName, componentFunction, dependencies, type, prefix);
        }

        for (const sourceVertex of vertices) {
            for (const dependencyNode of sourceVertex.dependencies) {
                for (const dependency of dependencyNode.value) {
                    const targets = vertices.filter(
                        (p) => p.id === prefix + "." + dependency.split(".").pop()
                    );
                    const targetVertex = targets[0];
                    if (!targetVertex) {
                        continue;
                    }
                    let from = sourceVertex.vertex;
                    let to = targetVertex.vertex;
                    addEdges(from, to, dependencyNode, prefix);
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

function addVertices(resourceId, serviceName, componentFunction, dependencies, type, prefix) {
    if (vertices.filter((p) => p.id === prefix + "." + resourceId).length === 0) {
        if (!serviceName) {
            serviceName = resourceId;
        }
        const groupId = resourceId + groupIdSuffix;
        const groupX = locationCache[resourceId] ? locationCache[resourceId].x : 70;
        const groupY = locationCache[resourceId] ? locationCache[resourceId].y : 0;

        //Pushing the AWS resource
        const vertex = graph.insertVertex(
            parent,
            resourceId,
            serviceName,
            0,
            0,
            50,
            50,
            "group;" + iconMap.getIcon(type)
        );
        graph.insertVertex(
            vertex,
            groupId,
            componentFunction,
            -2.25,
            -0.55,
            groupHeight,
            groupWidth,
            "text;html=1;strokeColor=none;fillColor=none;align=top;verticalAlign=top;whiteSpace=wrap;rounded=0;fontColor=#4D4D4D;fontStyle=3",
            true
        );
        vertices.push({
            id: `${prefix}.${resourceId}`,
            name: serviceName,
            dependencies: dependencies,
            type: type,
            vertex: vertex,
        });

        //Pushing a group for holding the AWS resource's function and the resource itself


    }
}

function getDependencies(template, resourceId) {
    const dependencies = [];
    jsonUtil.findAllValues(template.Resources[resourceId], dependencies, "Ref");
    jsonUtil.findAllValues(template.Resources[resourceId], dependencies, "Fn::Sub");
    jsonUtil.findAllValues(
        template.Resources[resourceId],
        dependencies,
        "Fn::GetAtt"
    );

    jsonUtil.findAllValues(
        template.Resources[resourceId],
        dependencies,
        "Fn::ImportValue"
    );

    for (const dependency of dependencies) {
        dependency.value = dependency.value.filter((p) => {
            const split = p.split(".");
            if (split.length === 2 && templateCache.templates[split[0]]) {
                return templateCache.templates[split[0]].Resources[split[1]];
            }
            return template.Resources[p];
        });
    }

    return dependencies;
}

function updateFilters(type, resourceId, serviceName, componentFunction, prefix) {
    const cells = graph.getModel().cells;
    const keys = Object.keys(cells);
    keys.map(
        (p) =>
            (locationCache[cells[p].value] = cells[p].geometry
                ? {x: cells[p].geometry.x, y: cells[p].geometry.y}
                : null)
    );
    if (vertices.filter((p) => p.type === type).length) {
        const item = vertices.filter((p) => p.id === `${prefix}.${resourceId}`)[0];
        if (item) {
            graph.removeCells([item.vertex], true);
        }
        vertices = vertices.filter((p) => p.id !== `${prefix}.${resourceId}`);
    }
}

function edgeId(to, from) {
    return `${to.id}|${from.id}`; //|${pathToDescriptor(dependencyNode.path)}`;
}

function alignModel(model) {
    const children = model.root.children;
    for (const child_ of children) {
        for (const child of child_.children) {
            if (child.children) {
                const geometry = child.children.find((c) => c.id.endsWith(groupIdSuffix))?.geometry;
                if (geometry) {
                    geometry.x = -2.3;
                    geometry.y = -0.6;
                    geometry.relative = true;
                }
            }
        }
    }
}

function graphToXML(graph) {
    var encoder = new mxCodec();
    let model = graph.getModel();
    //alignModel(model);
    var encodedModel = encoder.encode(model);
    let result = `${mxUtils.getXml(encodedModel)}`;
    //let result = `${mxUtils.getXml(model)}`;
    return `<mxfile host="" modified="2020-05-24T15:21:41.060Z" agent="5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.45.0 Chrome/78.0.3904.130 Electron/7.2.4 Safari/537.36" version="13.1.3" etag="lrwgP8mNOWNbAz78NI_h" pages="2">
            <diagram id="diagramid" name="Diagram">
              ${result}
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

    const resources = iterateResources(template);
    let types = [];
    addTypesToShow(Object.keys(template.Resources), types, template);
    types = [...new Set(types)].sort();
    let resourceTypes = {answer: types};
    let resourceNames = {answer: resources};
    let edgeMode = {answer: "Off"};
    filterConfig.resourceNamesToInclude = resourceNames.answer;
    filterConfig.resourceTypesToInclude = resourceTypes.answer;
    filterConfig.edgeMode = edgeMode.answer;

    let actionChoice = {};
    console.log("Diagram will be written to " + cmd.outputFile);
    let backedUp = false;
    if (fs.existsSync(cmd.outputFile)) {
        fs.copyFileSync(cmd.outputFile, `${cmd.outputFile}.bak`);
        backedUp = true;
    }

    if (ciMode) {
        if (cmd.excludeTypes && Array.isArray(cmd.excludeTypes)) {
            const filteredTypes = filterConfig.resourceTypesToInclude.filter((type) =>
                shouldFilterFromCiTypeList(type, cmd.excludeTypes)
            );
            filterConfig.resourceTypesToInclude = filteredTypes;
        }
        const xml = renderTemplate(template);
        fs.writeFileSync(cmd.outputFile, xml);
        return;
    }

    try {
        const editor = await openInEditor.configure({
            editor: "code",
        });

        await editor.open(cmd.outputFile);
    } catch (err) {
        console.log("Could not find vscode");
    }

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
                actionOption.Quit,
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
            case actionOption.Quit:
                const quit = await prompt({
                    message: "Do you want to keep your diagram?",
                    type: "confirm",
                    name: "answer",
                });
                if (!quit.answer) {
                    fs.unlinkSync(cmd.outputFile);
                    if (backedUp) {
                        fs.renameSync(`${cmd.outputFile}.bak`, cmd.outputFile);
                    }
                }
                process.exit(0);
        }
    }
}

function iterateResources(template) {
    const resources = [];
    for (const resource of Object.keys(template.Resources)) {
        resources.push(resource);
        if (template.Resources[resource].Template) {
            resources.push(
                ...iterateResources(template.Resources[resource].Template, resource)
            );
        }
    }
    return resources;
}

function addTypesToShow(resources, types, template) {
    for (const resource of resources) {
        types.push(template.Resources[resource].Type);
        if (template.Resources[resource].Template) {
            addTypesToShow(
                Object.keys(template.Resources[resource].Template.Resources),
                types,
                template.Resources[resource].Template
            );
        }
    }
}

function shouldFilterFromCiTypeList(type, excludeList) {
    type = type.toLowerCase();
    const isInExcludeList = excludeList.find(
        (exclude) =>
            exclude.toLowerCase() === type ||
            (type.startsWith("external resource") && type.includes(exclude))
    );

    return !isInExcludeList;
}

module.exports = {
    renderTemplate,
    layouts,
    reset,
    generate,
};
