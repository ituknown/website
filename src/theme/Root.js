import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';

export default function Root({ children }) {
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState(true);

    useEffect(() => {
        const isDollarPath = location.pathname.startsWith('/dollar');
        const hasCookie = document.cookie.includes("shadow_auth=true");

        if (isDollarPath && !hasCookie) {
            setIsAuthorized(false);
            // 使用 href 强制进行硬跳转，这会确保请求到达 Cloudflare Middleware
            // 增加一个简单的判断，防止在已经是登录页的情况下重复跳转
            window.location.href = '/dollar/';
        } else {
            setIsAuthorized(true);
        }
    }, [location.pathname]);

    // 如果未验证，渲染一个加载状态或空，防止内容闪烁
    if (!isAuthorized) {
        return <div style={{ height: '100vh', background: '#f4f4f7' }} />;
    }

    return <>{children}</>;
}