chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
      case 'ACCESS_TOKEN':
          console.log('Background 收到 token:', message.token);
          chrome.storage.session.set({ accessToken: message.token });
          sendResponse({ success: true });
          break;

      case 'USER_ID':
          console.log('Background 收到 USER_ID:', message.userId);
          chrome.storage.session.set({ userId: message.userId });
          sendResponse({ success: true });
          break;

      default:
          console.warn('Background 收到未知消息类型:', message.type);
          break;
  }
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      const url = new URL(details.url);
      const businessId= url.searchParams.get('business_id');
      
      if(businessId){
        console.log("businessId:"+businessId);
        chrome.storage.session.set({ businessId: businessId }).then(() => {
          console.log("businessId was set");
        });
        chrome.storage.session.get(["businessId"]).then((result) => {
          console.log("businessId " + result.businessId);
        });
      }
    },
    { urls: ["<all_urls>"] }
  );