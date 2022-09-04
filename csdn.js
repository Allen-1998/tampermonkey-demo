// ==UserScript==
// @name         CSDN
// @version      0.1
// @description  csdn辅助脚本
// @match        *://*.csdn.net/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  // 免登录复制
  document.designMode = "on";
  // 移除复制后缀
  document.querySelector("body").addEventListener("copy", (event) => {
    const selection = document.getSelection();
    event.clipboardData.setData("text/plain", selection.toString());
  });
})();
