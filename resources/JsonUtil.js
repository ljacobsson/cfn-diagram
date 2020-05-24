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

module.exports = {
  findAllValues,
  isJson,
};
