chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "ACCESS_TOKEN") {
      const token = message.token;
  
      // // 创建一个 div 显示 token
      // const tokenDisplay = document.createElement("div");
      // tokenDisplay.style.position = "fixed";
      // tokenDisplay.style.top = "10px";
      // tokenDisplay.style.right = "10px";
      // tokenDisplay.style.backgroundColor = "#fff";
      // tokenDisplay.style.border = "1px solid #ccc";
      // tokenDisplay.style.padding = "10px";
      // tokenDisplay.style.zIndex = "9999";
      // tokenDisplay.innerText = "Access Token: " + token;
      
       // 把 token 挂载到 window 上，供网页 JS 使用
       window.sessionStorage.setItem('access_token', token);
      // document.body.appendChild(tokenDisplay);
    }
  });