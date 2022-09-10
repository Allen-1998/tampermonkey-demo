// ==UserScript==
// @name         copy selector
// @version      0.1
// @description  获取页面元素最短 selector，效果同 chrome devtools 的 copy selector
// @match        *
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  // style
  const head = document.querySelector("head");
  const style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = `
    * {
      cursor: pointer;
      outline: 1px solid #000 !important;
    }
    .selector-hover {
      background: #00f3;
    }
    .selector-focus {
      background: #0f03;
    }

    .copy-success-message {
      position: fixed;
      top: 0;
      left: 50%;
      transform: translate(-50%, -150%);
      padding: 0 40px;
      border-radius: 4px;
      height: 30px;
      line-height: 30px;
      color: #67c23a;
      background-color: #e1f3d8;
      font-size: 14px !important;
      outline: 1px solid #67c23a66 !important;
      pointer-events: none !important;
      z-index: 2147483647;
    }

    .show-copy-success-message {
      animation: copySuccessMessage 2s;
    }

    @keyframes copySuccessMessage {
      0% {
        transform: translate(-50%, -150%);
      }
      10% {
        transform: translate(-50%, 100%);
      }
      70% {
        transform: translate(-50%, 100%);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -150%);
        opacity: 0;
      }
    }
  `;
  head.append(style);

  const message = document.createElement("div");
  message.setAttribute("class", "copy-success-message");
  message.innerText = "Copy success!";
  const body = document.querySelector("body");
  body.append(message);

  // copy
  function copy(value) {
    const message = document.querySelector(".copy-success-message");
    message.classList.remove("show-copy-success-message");
    navigator.clipboard.writeText(value).then(() => {
      message.classList.add("show-copy-success-message");
    });
  }

  // cssPath
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

  // eventListener
  document.addEventListener("click", (e) => {
    e.preventDefault();
    const el = e.target;
    el.classList.remove("selector-hover");
    const selector = cssPath(el);
    copy(selector);
    const target = document.querySelector(selector);
    target.classList.add("selector-focus");
  });

  let lastHoverSelector;
  document.addEventListener("mousemove", (e) => {
    const el = e.target;
    const hoverSelector = cssPath(el);
    if (lastHoverSelector !== hoverSelector) {
      const oldNode = document.querySelector(lastHoverSelector);
      if (oldNode) {
        oldNode.classList.remove("selector-hover");
      }
      el.classList.add("selector-hover");
      lastHoverSelector = hoverSelector;
    }
  });
})();
