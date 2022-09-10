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
        20% {
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
