chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const accessToken = url.searchParams.get('access_token');
    const businessId= url.searchParams.get('business_id');
    
    if(businessId){
      console.log("businessId:"+businessId);
      chrome.storage.session.set({ business_id: businessId }).then(() => {
        console.log("business_id was set");
      });
      chrome.storage.session.get(["business_id"]).then((result) => {
        console.log("business_id " + result.business_id);
      });
    }
    if (accessToken) {
      console.log(`Intercepted request with 'name' parameter: ${accessToken}`);
      chrome.storage.session.set({ access_token: accessToken }).then(() => {
        console.log("Value was set");
      });
      // chrome.storage.session.set({ "access_token": accessToken }, () => {
      //   console.log(`Saved 'name' parameter for request ID ${details.requestId}: ${accessToken}`);
      // });
      chrome.storage.session.get(["access_token"]).then((result) => {
        console.log("access_token " + result.access_token);

        // 查找符合条件的目标标签页
        chrome.tabs.query({ url: "http://localhost:5173/*" }, function(tabs) {
          tabs.forEach(tab => {
              // 如果页面已经加载完成，则直接发送消息
              if (tab.status === 'complete') {
                  chrome.tabs.sendMessage(tab.id, { type: "ACCESS_TOKEN", token: accessToken });
              }
          });
      });


      });


    }
  },
  { urls: ["<all_urls>"] }
);



function sendAccessTokenToTab(tabId, changeInfo, tab) {
  // 检查页面是否加载完成
  if (changeInfo.status === 'complete' && tab.url.includes('http://localhost:5173/')) {
      chrome.storage.session.get(['access_token'], function(result) {
          const accessToken = result.access_token;
          if (accessToken) {
              console.log(`Sending access token to tab ${tabId}`);
              chrome.tabs.sendMessage(tabId, { type: "ACCESS_TOKEN", token: accessToken });
          }
      });
  }
}

// 监听所有标签页的更新状态
chrome.tabs.onUpdated.addListener(sendAccessTokenToTab);





// Optional: Log stored 'name' parameters when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get(null, (data) => {
    console.log("Stored 'name' parameters:", data);
    alert("Stored 'name' parameters:\n" + JSON.stringify(data, null, 2));
  });
});