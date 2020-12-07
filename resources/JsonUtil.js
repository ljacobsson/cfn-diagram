function createPseudoResources(template, current) {
  current = current || template.Resources;
  for (var k in current) {
    if (current[k]["Fn::Join"]) {
      const joinList = current[k]["Fn::Join"][1]    
      current[k] = (Array.isArray(joinList) ? joinList : [joinList]).join(current[k]["Fn::Join"][0]);
    }
    if (typeof current[k] === "object" && current[k] !== null) {
      createPseudoResources(template, current[k]);
    } else if (typeof current[k] === "string" && current[k].startsWith("arn:")) {
      current[k] = current[k].replace(/\$\{AWS\:\:(.+?)\}/g, "").toLowerCase();
      if (!current[k]) {
        return;
      }
      const split = current[k].split(":");
      const service = split[2];
      const resourceType = split[5] ? split[5].split("/")[0].replace(/[\W_]+/g,""): "";
      const name = `${split[2]} ${split[3]} ${split[4]}\n${split.slice(-1)[0]}`
      template.Resources[name] = {
        Type: `AWS::${service}::${resourceType}`,
      };
      current[k] = {
        Ref: name,
      };
    }
  }
}

function findAllValues(obj, keyArray, keyName, path) {
  path = path || "$";
  for (const prop of Object.keys(obj)) {
    if (prop === keyName) {
      let values = obj[prop];
      if (Array.isArray(values)) {
        values = obj[prop][instrisicFunctionIndex(prop)];
      }

      if (!Array.isArray(values)) {
        values = [values];
      }

      if (prop === "Fn::Sub") {
        const pattern = /\$\{(.+?)\}/g;
        let match;
        const multiValue = [];
        while ((match = pattern.exec(values[0])) != null) {
          multiValue.push([match[1].split(".")[0]]);
        }
        values = multiValue.map((p) => p[0]);
      }

      values = [values];

      for (const v of values) {
        const item = {
          key: prop,
          value: v.filter((p) => !p.startsWith("AWS::")),
          path: path,
        };
        if (item.value.length) {
          keyArray.push(item);
        }
      }
    }
    if (
      !obj[prop] ||
      typeof obj[prop] !== "object" ||
      typeof obj[prop] === "string" ||
      obj[prop] instanceof String
    ) {
      continue;
    }

    if (Array.isArray(obj[prop])) {
      obj[prop].forEach((child, i) =>
        findAllValues(child, keyArray, keyName, `${path}.${prop}`)
      );
    } else {
      findAllValues(obj[prop], keyArray, keyName, `${path}.${prop}`);
    }
  }
}

function instrisicFunctionIndex(prop) {
  switch (prop) {
    case "Fn::GetAtt":
      return 0;
    case "Fn::Join":
      return 1;
  }
  return 0;
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function pathToDescriptor(path, filterConfig) {
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

  if (
    path.startsWith(
      "$.Properties.EventInvokeConfig.DestinationConfig.OnFailure"
    )
  ) {
    return "OnFailure";
  }

  if (
    path.startsWith(
      "$.Properties.EventInvokeConfig.DestinationConfig.OnSuccess"
    )
  ) {
    return "OnSuccess";
  }

  return path.split(".").slice(-1)[0];
}

module.exports = {
  createPseudoResources,
  findAllValues,
  isJson,
  pathToDescriptor,
};
