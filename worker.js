// tw-proxy Cloudflare Workers 版本
// 原项目: https://github.com/tedian114514/tw-proxy

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 核心拦截器：如果直接访问根目录，直接返回成功提示
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({
        status: 'success',
        message: '解析服务器运行正常！请将此域名填入B站漫游，或者在网址后面加上 /x/web-interface/zone 进行测试。'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const targetUrl = `https://api.bilibili.com${url.pathname}${url.search}`;

    try {
      // 构建请求头，保留原始请求头（但排除 host 等会被覆盖的）
      const headers = new Headers(request.headers);
      headers.set('host', 'api.bilibili.com');
      // 移除 hop-by-hop 头
      for (const skip of ['connection', 'keep-alive', 'transfer-encoding', 'upgrade']) {
        headers.delete(skip);
      }

      const fetchOptions = {
        method: request.method,
        headers: headers,
        redirect: 'manual',
      };

      // 如果有请求体（POST/PUT 等），传递 body
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = request.body;
      }

      const response = await fetch(targetUrl, fetchOptions);

      // 构建响应头，过滤掉不适合转发的头
      const responseHeaders = new Headers();
      for (const [key, value] of response.headers) {
        const lowerKey = key.toLowerCase();
        if (['transfer-encoding', 'content-encoding', 'connection'].includes(lowerKey)) {
          continue;
        }
        responseHeaders.set(key, value);
      }
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      console.error('Fetch error:', err);
      return new Response(JSON.stringify({
        error: '解析服务器代理失败',
        message: err.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
