// ==UserScript==
// @name         掘金
// @version      0.1
// @description  掘金辅助脚本
// @match        *://juejin.cn/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  "use strict";
  const storageKey = "last_sign_timestamp";
  // 获取上一次签到的日子
  const lastSignNumberOfDays = localStorage.getItem(storageKey);
  // 计算现在所在的日子
  const currentNumberOfDays = String(new Date().getDate());
  // 如果今天已经请求过，不再请求
  if (currentNumberOfDays !== lastSignNumberOfDays) {
    GM_xmlhttpRequest({
      url: "https://api.juejin.cn/growth_api/v1/check_in",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": navigator.userAgent,
      },
      responseType: "json",
      onload(response) {
        if (response.status === 200) {
          const data = response.response;
          if (data.data === "success") {
            // alert("签到成功");
          } else {
            alert(data.err_msg);
          }
          // 更新最近一次签到的日子
          localStorage.setItem(storageKey, currentNumberOfDays);
        }
      },
    });
  }

  // 移除复制后缀
  document.querySelector("body").addEventListener("copy", (event) => {
    const selection = document.getSelection();
    event.clipboardData.setData("text/plain", selection.toString());
  });
})();
