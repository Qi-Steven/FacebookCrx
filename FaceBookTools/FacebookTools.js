document.getElementById("getToken").addEventListener("click",async () => {
  const { accessToken: token } = await chrome.storage.session.get("accessToken");
    document.getElementById("token").value = token || "";
  
});

// ==================== 添加角色 ==================== //
document.getElementById("addRole").addEventListener("click", async () => {
  const { accessToken: token } = await chrome.storage.session.get("accessToken");
  const textarea = document.getElementById("myTextarea");
  const userID = document.getElementById("userID").value.trim();
  const bmID = document.getElementById("bmID").value.trim();
  const resultBox = document.getElementById("resultBox");

  if (!token || !userID || !bmID) {
    resultBox.innerHTML = `<p class="error">❌ Token / UserID / BMID 缺失</p>`;
    return;
  }

  const url = "https://adsmanager-graph.facebook.com/v22.0/?include_headers=false&access_token=" + token;
  const jsonArr = [];
  const lines = textarea.value.split("\n").map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    jsonArr.push({
      relative_url: `act_${line}/userpermissions?role=ADMIN&user=${userID}&business=${bmID}`,
      method: "POST"
    });
  }

  resultBox.innerHTML = `<p>⏳ 正在提交 ${jsonArr.length} 个请求...</p>`;

  try {
    const response = await axios.post(url, { batch: jsonArr });
    const results = response.data;
    let html = `<h3>✅ 请求完成</h3>`;
    results.forEach((res, idx) => {
      const isSuccess = res.code === 200;
      html += `
        <div class="result-item ${isSuccess ? "success" : "error"}">
          <b>请求 ${idx + 1}:</b><br/>
          账户ID: ${lines[idx]}<br/>
          状态: ${isSuccess ? "成功 ✅" : "失败 ❌"}<br/>
        </div>
      `;
    });
    resultBox.innerHTML = html;
  } catch (error) {
    resultBox.innerHTML = `<p class="error">❌ 请求失败: ${error.message}</p>`;
  }
});


// ==================== 批量删除广告系列 ==================== //
document.getElementById("deleteCampaigns").addEventListener("click", async () => {
  const { accessToken: token } = await chrome.storage.session.get("accessToken");
  const textarea = document.getElementById("myTextarea");
  const resultBox = document.getElementById("resultBox");

  if (!token) {
    resultBox.innerHTML = `<p class="error">❌ Token 缺失</p>`;
    return;
  }

  const accountIds = textarea.value.split("\n").map(l => l.trim()).filter(Boolean);
  if (accountIds.length === 0) {
    resultBox.innerHTML = `<p class="error">❌ 没有输入广告账户 ID</p>`;
    return;
  }

  resultBox.innerHTML = `<p>⏳ 正在扫描广告系列...</p>`;

  let totalDeleted = 0;
  let totalFailed = 0;
  let html = "";

  for (const actId of accountIds) {
    try {
      // 1. 获取广告系列 ID
      let campaignIds = [];
      let url = `https://graph.facebook.com/v22.0/act_${actId}/campaigns?fields=id&limit=5000&access_token=${token}`;

      while (url) {
        const res = await axios.get(url);
        const data = res.data;
        if (data?.data?.length) {
          campaignIds.push(...data.data.map(c => c.id));
        }
        url = data?.paging?.next || null;
      }

      html += `<p>📂 账户 ${actId} 共发现 ${campaignIds.length} 个广告系列</p>`;

      if (campaignIds.length === 0) continue;

      // 2. 批量删除广告系列（每批最多 50 个）
      for (let i = 0; i < campaignIds.length; i += 50) {
        const batch = campaignIds.slice(i, i + 50).map(campaignId => ({
          method: "DELETE",
          relative_url: `${campaignId}`
        }));

        const res = await axios.post(
          `https://graph.facebook.com/v22.0/?include_headers=false&access_token=${token}`,
          { batch }
        );

        res.data.forEach(r => {
          if (r.code === 200) totalDeleted++;
          else totalFailed++;
        });
      }

      html += `<p>✅ 账户 ${actId} 删除完成</p>`;
    } catch (err) {
      html += `<p class="error">❌ 账户 ${actId} 删除失败: ${err.message}</p>`;
    }
  }

  resultBox.innerHTML = `
    <h3>执行完成</h3>
    <p>成功删除广告系列：${totalDeleted}</p>
    <p>失败：${totalFailed}</p>
    ${html}
  `;
});


// ==================== 批量获取广告账户 SpendCap (Batch) ==================== //
document.getElementById("getSpendCap").addEventListener("click", async () => {
  const { accessToken: token } = await chrome.storage.session.get("accessToken");
  const textarea = document.getElementById("myTextarea");
  const resultBox = document.getElementById("resultBox");

  if (!token) {
    resultBox.innerHTML = `<p class="error">❌ Token 缺失</p>`;
    return;
  }

  const accountIds = textarea.value.split("\n").map(l => l.trim()).filter(Boolean);
  if (accountIds.length === 0) {
    resultBox.innerHTML = `<p class="error">❌ 没有输入广告账户 ID</p>`;
    return;
  }

  resultBox.innerHTML = `<p>⏳ 正在批量获取账户 SpendCap...</p>`;

  let results = [];

  // 每 50 个账户为一批
  for (let i = 0; i < accountIds.length; i += 50) {
    const batchIds = accountIds.slice(i, i + 50);

    const batch = batchIds.map(id => ({
      method: "GET",
      relative_url: `act_${id}?fields=spend_cap`
    }));

    try {
      const res = await axios.post(
        `https://graph.facebook.com/v22.0/?include_headers=false&access_token=${token}`,
        { batch }
      );

      res.data.forEach((item, idx) => {
        if (item.code === 200) {
          const body = JSON.parse(item.body);
          let spendCap = body.spend_cap;

          // 转换: 如果有值则 /100 并保留两位小数
          if (spendCap && !isNaN(spendCap)) {
            spendCap = (parseInt(spendCap, 10) / 100).toFixed(2);
          } else {
            spendCap = "未设置";
          }

          results.push({
            account_id: batchIds[idx],
            spend_cap: spendCap
          });
        } else {
          results.push({
            account_id: batchIds[idx],
            spend_cap: "❌ 获取失败"
          });
        }
      });
    } catch (err) {
      batchIds.forEach(id => {
        results.push({
          account_id: id,
          spend_cap: "❌ 批处理失败: " + err.message
        });
      });
    }
  }

  // 显示表格
  let html = "<h3>账户 SpendCap 信息</h3><table border='1' cellpadding='5'><tr><th>账户ID</th><th>SpendCap</th></tr>";
  results.forEach(r => {
    html += `<tr><td>${r.account_id}</td><td>${r.spend_cap}</td></tr>`;
  });
  html += "</table>";
  resultBox.innerHTML = html;

  // 导出 Excel
  exportToExcel(results);
});

// ==================== 导出 Excel ==================== //
function exportToExcel(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SpendCap");

  XLSX.writeFile(wb, "AdAccounts_SpendCap.xlsx");
}


// ==================== 导出广告账户状态 (Batch) ==================== //
document.getElementById("exportAccounts").addEventListener("click", async () => {
  const textarea = document.getElementById("myTextarea");
  const resultBox = document.getElementById("resultBox");
  const accountIds = textarea.value.split("\n").map(id => id.trim()).filter(Boolean);

  if (accountIds.length === 0) {
    resultBox.innerHTML = `<p class="error">❌ 请输入至少一个广告账户ID！</p>`;
    return;
  }

  // 取 token
  const { accessToken: token } = await chrome.storage.session.get("accessToken");
  if (!token) {
    resultBox.innerHTML = `<p class="error">❌ 未找到 Token，请先登录并存储 token！</p>`;
    return;
  }

  resultBox.innerHTML = `<p>⏳ 正在批量检查广告账户状态...</p>`;

  const rows = [["Account ID", "是否有广告在跑", "错误信息"]];
  let html = "<h3>广告账户状态</h3><table border='1' cellpadding='5'><tr><th>Account ID</th><th>是否有广告在跑</th><th>错误信息</th></tr>";

  // 分批处理（<=50个）
  for (let i = 0; i < accountIds.length; i += 50) {
    const batchIds = accountIds.slice(i, i + 50);
    const batch = batchIds.map(id => ({
      method: "GET",
      relative_url: `act_${id}/ads?fields=id,effective_status&limit=10`
    }));

    try {
      const res = await fetch(`https://graph.facebook.com/v22.0`, {
        method: "POST",
        body: new URLSearchParams({
          access_token: token,
          batch: JSON.stringify(batch)
        })
      });

      const data = await res.json();

      data.forEach((item, index) => {
        const accountId = batchIds[index];
        if (!item.body) {
          rows.push([accountId, "❌ 未返回数据", ""]);
          html += `<tr><td>${accountId}</td><td>❌ 未返回数据</td><td></td></tr>`;
          return;
        }

        let body;
        try {
          body = JSON.parse(item.body);
        } catch (e) {
          rows.push([accountId, "❌ JSON解析失败", e.message]);
          html += `<tr><td>${accountId}</td><td>❌ JSON解析失败</td><td>${e.message}</td></tr>`;
          return;
        }

        if (body.error) {
          rows.push([accountId, "❌ 错误", body.error.message]);
          html += `<tr><td>${accountId}</td><td>❌ 错误</td><td>${body.error.message}</td></tr>`;
        } else if (body.data && body.data.length > 0) {
          const hasActive = body.data.some(ad => ad.effective_status === "ACTIVE");
          rows.push([accountId, hasActive ? "✅ 有广告在跑" : "❌ 无广告", ""]);
          html += `<tr><td>${accountId}</td><td>${hasActive ? "✅ 有广告在跑" : "❌ 无广告"}</td><td></td></tr>`;
        } else {
          rows.push([accountId, "❌ 无广告", ""]);
          html += `<tr><td>${accountId}</td><td>❌ 无广告</td><td></td></tr>`;
        }
      });

    } catch (err) {
      batchIds.forEach(id => {
        rows.push([id, "❌ 请求失败", err.message]);
        html += `<tr><td>${id}</td><td>❌ 请求失败</td><td>${err.message}</td></tr>`;
      });
    }
  }

  html += "</table>";
  resultBox.innerHTML = html + `<p>✅ 检查完成，Excel 已导出。</p>`;

  // 导出 Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "AdAccounts");
  XLSX.writeFile(wb, "ad_accounts_status.xlsx");
});
