function copy(value) {
  const message = document.querySelector(".copy-success-message");
  message.classList.remove("show-copy-success-message");
  navigator.clipboard.writeText(value).then(() => {
    message.classList.add("show-copy-success-message");
  });
}
