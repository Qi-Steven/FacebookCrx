// function getCurrentAdAccountId() {
//     const url = new URL(location.href);
//     return url.searchParams.get("asset_id"); // 直接取 asset_id
// }

// async function updateAdAccountName(accountId, newName, token) {
//     const url = `https://graph.facebook.com/v19.0/act_${accountId}`;
//     const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: newName, access_token: token })
//     });
//     const data = await res.json();
//     if (data.error) throw new Error(data.error.message);
//     return data.success;
// }

// function injectFloatingCard() {
//     if (document.getElementById("my-floating-card")) return;

//     const card = document.createElement("div");
//     card.id = "my-floating-card";
//     card.innerHTML = `
//       <div class="floating-card">
//         <h2>修改账户名称</h2>
//         <input type="text" id="new-account-name" placeholder="输入新名称" style="width:180px;margin-bottom:8px;">
//         <button id="update-account-name">修改名称</button>
//       </div>
//     `;
//     document.body.appendChild(card);

//     document.getElementById("update-account-name").addEventListener("click", async () => {
//         const accountId = getCurrentAdAccountId();
//         if (!accountId) return alert("未找到广告账户ID");
    
//         const newName = document.getElementById("new-account-name").value.trim();
//         if (!newName) return alert("请输入新名称");
    
//         try {
//             // 🔑 让 background 取 storage，然后回传
//             chrome.runtime.sendMessage({ type: "GET_TOKEN" }, async (response) => {
//                 const accessToken = response?.accessToken;
//                 if (!accessToken) return alert("未找到 Access Token");
    
//                 try {
//                     await updateAdAccountName(accountId, newName, accessToken);
//                     alert("账户名称修改成功！");
//                 } catch (err) {
//                     console.error(err);
//                     alert("修改失败: " + err.message);
//                 }
//             });
//         } catch (err) {
//             console.error(err);
//             alert("读取 Token 出错: " + err.message);
//         }
//     });    
// }

// // 监听 URL 变化（SPA）
// let lastUrl = location.href;
// new MutationObserver(() => {
//     const currentUrl = location.href;
//     if (currentUrl !== lastUrl) {
//         lastUrl = currentUrl;
//         if (currentUrl.includes("/billing_hub/accounts/details")) {
//             injectFloatingCard();
//         }
//     }
// }).observe(document, { subtree: true, childList: true });

// // 页面初次加载
// if (location.href.includes("/billing_hub/accounts/details")) {
//     injectFloatingCard();
// }


const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
    this.remove();
};

// 监听 inject.js 发出来的消息
window.addEventListener('message', function(event) {
    if (event.source !== window) return;

    switch (event.data.type) {
        case 'ACCESS_TOKEN':
            console.log('Access Token:', event.data.token);
            chrome.runtime.sendMessage({
                type: 'ACCESS_TOKEN',
                token: event.data.token
            });
            break;

        case 'USER_ID':
            console.log('USER_ID:', event.data.userId);
            chrome.runtime.sendMessage({
                type: 'USER_ID',
                userId: event.data.userId
            });
            break;

        default:
            // 其他消息忽略
            break;
    }
});
