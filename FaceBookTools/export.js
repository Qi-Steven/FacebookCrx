document.getElementById("exportBtn").addEventListener("click", async () => {
  // 1. 从 textarea 获取账号ID，每行一个
  const inputText = document.getElementById("accountIds").value.trim();
  const accountIds = inputText.split("\n").map(id => id.trim()).filter(id => id);

  if (accountIds.length === 0) {
    alert("请输入至少一个广告账户ID！");
    return;
  }

  // 2. 取 token
  const { accessToken } = await chrome.storage.session.get("accessToken");
  if (!accessToken) {
    alert("未找到 accessToken，请先登录并存储 token！");
    return;
  }

  // 3. 结果表格
  const rows = [["Account ID", "是否有广告在跑", "错误信息"]];

  // 4. 分批处理（<=50个）
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
          access_token: accessToken,
          batch: JSON.stringify(batch)
        })
      });

      const data = await res.json();

      // 解析 batch 响应
      data.forEach((item, index) => {
        const accountId = batchIds[index];
        if (!item.body) {
          rows.push([accountId, "❌ 未返回数据", ""]);
          return;
        }

        let body;
        try {
          body = JSON.parse(item.body);
        } catch (e) {
          rows.push([accountId, "❌ JSON解析失败", e.message]);
          return;
        }

        if (body.error) {
          rows.push([accountId, "❌ 错误", body.error.message]);
        } else if (body.data && body.data.length > 0) {
          const hasActive = body.data.some(ad => ad.effective_status === "ACTIVE");
          rows.push([accountId, hasActive ? "✅ 有广告在跑" : "❌ 无广告", ""]);
        } else {
          rows.push([accountId, "❌ 无广告", ""]);
        }
      });

    } catch (err) {
      batchIds.forEach(id => rows.push([id, "❌ 请求失败", err.message]));
    }
  }

  // 5. 导出 Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "AdAccounts");
  XLSX.writeFile(wb, "ad_accounts_status.xlsx");

  alert("导出完成！");
});
