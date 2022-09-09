// ==UserScript==
// @name         CSDN
// @version      0.1
// @description  csdn辅助脚本
// @match        *://*.csdn.net/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  // 免登录复制
  const heads = document.querySelector('head');
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.innerHTML = `pre,code{user-select:auto !important}.passport-login-container{display: none !important;}`;
  heads.append(style);
  // 移除复制后缀
  document.querySelector('body').addEventListener('copy', (event) => {
      const selection = document.getSelection();
      event.clipboardData.setData('text/plain', selection.toString());
  });
})();