document.getElementById("refreshButton").addEventListener("click", () => {
  chrome.storage.session.get(["accessToken", "businessId"]).then((result) => {
    console.log("accessToken " + result.accessToken);
    const baseUrl =
      "https://adsmanager-graph.facebook.com/v22.0?include_headers=false&access_token=" +
      result.accessToken;
    const url =
      "https://graph.facebook.com/v22.0/" +
      result.businessId +
      "/client_ad_accounts";
    const bmNameUrl =
      "https://graph.facebook.com/v22.0/" +
      result.businessId +
      "?access_token=" +
      result.accessToken;
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

    axios.post(
        baseUrl,
        {
          batch: `[{"relative_url":"${result.businessId}/client_ad_accounts?fields=account_id,account_status,name,id,business&limit=9999","method":"GET"}]`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      )
      .then((response) => {
        console.log(response.data);
        const parsedBody = JSON.parse(response.data[0].body);
        // 处理业务数据，使其成为一维数据
        const formattedData = parsedBody.data.map((item) => ({
          account_id: item.account_id,
          account_status: item.account_status,
          name: item.name,
          id: item.id,
          business_id: item.business ? item.business.id : null,
          business_name: item.business ? item.business.name : null,
          // spend: item.insights?.data[0]?.spend ?? null,
          // amount_spent: item.amount_spent,
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

  });
});




document.getElementById("openFacebookTools").addEventListener("click", () => {
  chrome.tabs.create({
    url: "FacebookTools.html",
  });
});
// document.getElementById("openExport").addEventListener("click", () => {
//   chrome.tabs.create({ url: "export.html" });
// });
