(function() {
    function tryGetData() {
        const token = window.__accessToken || null;
        let userId = null;

        // 获取 USER_ID
        try {
            const req = window.require || require;
            if (typeof req === 'function') {
                const data = req('CurrentUserInitialData');
                if (data && data.USER_ID) {
                    userId = data.USER_ID;
                }
            }
        } catch (err) {}

        // 分开发送
        if (token) {
            window.postMessage({
                type: 'ACCESS_TOKEN',
                token: token
            }, '*');
        }

        if (userId) {
            window.postMessage({
                type: 'USER_ID',
                userId: userId
            }, '*');
        }

        // 如果两个都拿到了，就算成功
        return true;
    }

    // 最多尝试 10 秒
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (tryGetData() || attempts > 20) {
            clearInterval(interval);
        }
    }, 500);
})();
