function findAllKeys(obj, keyArray, keyName, path) {
  path = path || "$";
  for (const prop of Object.keys(obj)) {
    if (prop === keyName) {
      let value = obj[prop];
      if (Array.isArray(value)) {
        value = obj[prop][instrisicFunctionIndex(prop)];
      }

      if (!Array.isArray(value)) {
        value = [value];
      }
      if (!value[0].startsWith("AWS::")) {
        keyArray.push({
          key: prop,
          value: value,
          path: path,
        });
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
        findAllKeys(child, keyArray, keyName, `${path}.${prop}`)
      );
    } else {
      findAllKeys(obj[prop], keyArray, keyName, `${path}.${prop}`);
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
  findAllValues: findAllKeys,
  isJson,
};
