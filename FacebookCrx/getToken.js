document.getElementById("getToken").addEventListener("click", () => {
  chrome.storage.session.get(["access_token"]).then((result) => {
    document.getElementById("token").value = result.access_token;
  });
});
// document.getElementById("addRole").addEventListener("click", async () => {
//   chrome.storage.session.get(["access_token"]).then( async(result) => {
//     const token = result.access_token;
//     // 获取文本框元素
//     const textarea = document.getElementById("myTextarea");
//     const userID = document.getElementById("userID").value;
//     const bmID = document.getElementById("bmID").value;
//     console.log(userID);
//     console.log(bmID);
//     // 获取文本内容并按行分割
//     const lines = textarea.value.split("\n");
//     for(const line of lines){
//       let id = line;
//       axios
//         .post(`https://graph.facebook.com/v22.0/${id}/userpermissions`, {
//           user: userID,
//           role: "ADMIN",
//           business: bmID,
//           access_token: token,
//         })
//         .then(function (response) {
//           console.log(response);
//         });
//         await delay(500);
//     }
    
//   });
// });
document.getElementById("addRole").addEventListener("click", () => {
  chrome.storage.session.get(["access_token"]).then( result => {
    const token = result.access_token;
    // 获取文本框元素
    const textarea = document.getElementById("myTextarea");
    const userID = document.getElementById("userID").value;
    const bmID = document.getElementById("bmID").value;
    console.log(userID);
    console.log(bmID);
    const url="https://adsmanager-graph.facebook.com/v22.0/?include_headers=false&access_token="+token;
    const jsonArr=[];
    // 获取文本内容并按行分割
    const lines = textarea.value.split("\n");
    for(const line of lines){
      var jsonObj={"relative_url":line+"/userpermissions?role=ADMIN&user="+userID+"&business="+bmID,"method":"POST"};
      jsonArr.push(jsonObj)
    }
    console.log(jsonArr);
    axios.post(url, {
          batch:jsonArr
        })
        .then(function (response) {
          console.log(response);
        });
    
  });
});

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

