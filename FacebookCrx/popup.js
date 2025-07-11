let access_token;
document.getElementById("refreshButton").addEventListener("click", () => {
  chrome.storage.session.get(["access_token", "business_id"]).then((result) => {
    // const script = document.createElement("script");
    // script.src = chrome.runtime.getURL("xlsx.full.min.js");
    // document.head.appendChild(script);
    console.log("access_token " + result.access_token);
    // const url =
    //   "https://graph.facebook.com/v22.0/" +
    //   result.business_id +
    //   "/client_ad_accounts?fields=account_id,account_status,name,id,insights{spend}&limit=10&access_token=" +
    //   result.access_token;
      const url =
      "https://graph.facebook.com/v22.0/" +
      result.business_id +
      "/client_ad_accounts";
    const bmNameUrl =
      "https://graph.facebook.com/v22.0/" +
      result.business_id +
      "?access_token=" +
      result.access_token;
    // const url =
    //   "https://graph.facebook.com/v22.0/me/adaccounts?fields=account_id,account_status,name,id,amount_spent&limit=9999&access_token=" +
    //   result.access_token;
    let bmName = "default";
    fetch(bmNameUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        bmName = responseData.name;
        // console.log(responseData.name);
      });
      axios.get(url, {
        headers: {
            "Content-Type": "application/json",
        },
        timeout: 60000,
        params: {
            "fields": "account_id,account_status,name,id,business",
            "limit": 9999,
            "access_token": result.access_token
        }
    })
    .then((response) => {
        console.log(response.data);
    
        // 处理业务数据，使其成为一维数据
        const formattedData = response.data.data.map(item => ({
            account_id: item.account_id,
            account_status: item.account_status,
            name: item.name,
            id: item.id,
            business_id: item.business ? item.business.id : null,
            business_name: item.business ? item.business.name : null
        }));
    
        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(formattedData);
    
        // 创建并添加工作簿
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
        // 导出Excel文件
        XLSX.writeFile(wb, bmName + ".xlsx");
    })
    .catch((error) => {
        console.error("There was an error fetching the data!", error);
    });

    // // 假设 bmName 是你已经定义好的变量
    // axios.get(url, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     timeout: 60000,
    //     params:{
    //       "fields":"account_id,account_status,name,id",
    //       "limit":9999,
    //       "access_token":result.access_token
    //     }
    //   })
    //   .then((response) => {
    //     console.log(response.data);

    //     // Create a worksheet from the JSON data
    //     const ws = XLSX.utils.json_to_sheet(response.data.data);

    //     // Create a workbook and append the worksheet
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    //     // Export the workbook as an Excel file
    //     XLSX.writeFile(wb, bmName + ".xlsx");
    //   })
    //   .catch((error) => {
    //     console.error("There was an error fetching the data!", error);
    //   });

    // fetch(url, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((response) => {
    //     return response.json();
    //   })
    //   .then((responseData) => {
    //     console.log(responseData.data);
    //     // Create a worksheet from the JSON data
    //     const ws = XLSX.utils.json_to_sheet(responseData.data);

    //     // Create a workbook and append the worksheet
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    //     // Export the workbook as an Excel file
    //     XLSX.writeFile(wb, bmName+".xlsx");
    //     // const csvData = jsonToCsv(responseData.data);
    //     // const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    //     // const url = URL.createObjectURL(blob);
    //     // const link = document.createElement("a");
    //     // link.setAttribute("href", url);
    //     // link.setAttribute("download", "tables.csv");
    //     // document.body.appendChild(link);
    //     // link.click();
    //   });
  });
});

document.getElementById("openGetToken").addEventListener("click", () => {
  chrome.tabs.create({
    url: "getToken.html",
  });
});


// document.getElementById("addRole").addEventListener("click", () => {
//   chrome.storage.session.get(["access_token", "business_id"]).then((result) => {
//     // https://graph.facebook.com/v22.0/act_2445331979199882/userpermissions?user=61574732943692&role=ADMIN&business=1735909097003995&access_token=
//     // const url="https://graph.facebook.com/v22.0/act_2445331979199882/userpermissions";
//     const id='act_2445331979199882'
//     axios.post(`https://graph.facebook.com/v22.0/${id}/userpermissions`,{
//       'user':'61574732943692',
//       'role':'ADMIN',
//       'business':'1735909097003995',
//       'access_token':result.access_token
//     }).then(function(response){
//       console.log(response)
//     })
//   })
// });


// Initial load
// window.onload = () => {
//   // document.getElementById("refreshButton").click();

// };

// // function jsonToCsv(jsonArray) {
// //     // 首先提取头部（keys）
// //     const headers = Object.keys(jsonArray[0]).join(',') + '\n';

// //     // 然后处理每一行数据
// //     const rows = jsonArray.map(row => {
// //         return Object.values(row).map(value => {
// //             // 如果值包含逗号，需要用双引号包裹起来
// //             if (typeof value === 'string' && value.includes(',')) {
// //                 return `"${value}"`;
// //             }
// //             return value;
// //         }).join(',');
// //     }).join('\n');

// //     return headers + rows;
// // }
