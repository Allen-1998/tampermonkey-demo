function cssPath(node, optimized = true) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const steps = [];
  let contextNode = node;
  while (contextNode) {
    const step = cssPathStep(
      contextNode,
      Boolean(optimized),
      contextNode === node
    );
    if (!step) {
      break;
    }
    steps.unshift(step);
    if (step.optimized) {
      break;
    }
    contextNode = contextNode.parentNode;
  }

  return steps.join(" > ");
}

function cssPathStep(node, optimized, isTargetNode) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const id = node.getAttribute("id");
  if (optimized) {
    if (id) {
      return new Step(idSelector(id), true);
    }
    const nodeNameLower = node.nodeName.toLowerCase();
    if (
      nodeNameLower === "body" ||
      nodeNameLower === "head" ||
      nodeNameLower === "html"
    ) {
      return new Step(node.nodeName.toLowerCase(), true);
    }
  }
  const nodeName = node.nodeName.toLowerCase();

  if (id) {
    return new Step(nodeName + idSelector(id), true);
  }
  const parent = node.parentNode;
  if (!parent || parent.nodeType === Node.DOCUMENT_NODE) {
    return new Step(nodeName, true);
  }

  function prefixedElementClassNames(node) {
    const classAttribute = node.getAttribute("class");
    if (!classAttribute) {
      return [];
    }

    return classAttribute
      .split(/\s+/g)
      .filter(Boolean)
      .map(function (name) {
        return "$" + name;
      });
  }

  function idSelector(id) {
    return "#" + CSS.escape(id);
  }

  const prefixedOwnClassNamesArray = prefixedElementClassNames(node);
  let needsClassNames = false;
  let needsNthChild = false;
  let ownIndex = -1;
  let elementIndex = -1;
  const siblings = parent.children;
  for (
    let i = 0;
    siblings && (ownIndex === -1 || !needsNthChild) && i < siblings.length;
    ++i
  ) {
    const sibling = siblings[i];
    if (sibling.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }
    elementIndex += 1;
    if (sibling === node) {
      ownIndex = elementIndex;
      continue;
    }
    if (needsNthChild) {
      continue;
    }
    if (sibling.nodeName.toLowerCase() !== nodeName) {
      continue;
    }

    needsClassNames = true;
    const ownClassNames = new Set(prefixedOwnClassNamesArray);
    if (!ownClassNames.size) {
      needsNthChild = true;
      continue;
    }
    const siblingClassNamesArray = prefixedElementClassNames(sibling);
    for (let j = 0; j < siblingClassNamesArray.length; ++j) {
      const siblingClass = siblingClassNamesArray[j];
      if (!ownClassNames.has(siblingClass)) {
        continue;
      }
      ownClassNames.delete(siblingClass);
      if (!ownClassNames.size) {
        needsNthChild = true;
        break;
      }
    }
  }

  let result = nodeName;
  if (
    isTargetNode &&
    nodeName.toLowerCase() === "input" &&
    node.getAttribute("type") &&
    !node.getAttribute("id") &&
    !node.getAttribute("class")
  ) {
    result += "[type=" + CSS.escape(node.getAttribute("type") || "") + "]";
  }
  if (needsNthChild) {
    result += ":nth-child(" + (ownIndex + 1) + ")";
  } else if (needsClassNames) {
    for (const prefixedName of prefixedOwnClassNamesArray) {
      result += "." + CSS.escape(prefixedName.slice(1));
    }
  }

  return new Step(result, false);
}

class Step {
  value;
  optimized;
  constructor(value, optimized) {
    this.value = value;
    this.optimized = optimized || false;
  }

  toString() {
    return this.value;
  }
}
