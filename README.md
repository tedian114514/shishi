# tw-proxy (Cloudflare Workers 版本)

Bilibili API 代理，从 Vercel Serverless 迁移到 Cloudflare Workers。

## 与原项目的区别

| 特性 | 原版 (Vercel) | 本版本 (Cloudflare) |
|------|--------------|---------------------|
| 运行环境 | Node.js (Vercel Serverless) | Cloudflare Workers |
| HTTP 客户端 | node-fetch | 原生 fetch (全局) |
| 代理支持 | https-proxy-agent | Workers 原生支持（无自定义 TLS 选项）|
| 依赖包 | node-fetch, https-proxy-agent | 无外部依赖 |

## 本地开发

```bash
# 安装 wrangler
npm install -g wrangler

# 或使用 npx
npx wrangler dev
```

## 部署到 Cloudflare Workers

### 1. 注册/登录 Cloudflare
```bash
npx wrangler login
```

### 2. 部署
```bash
npm run deploy
```

### 3. 绑定自定义域名（可选）
在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Triggers 中添加自定义域名。

## 使用方式

部署后，Worker 会提供一个基础 URL（如 `https://tw-proxy.xxx.workers.dev`）。

- **根路径** (`/`)：返回健康检查信息
- **API 代理**：所有其他路径自动代理到 Bilibili API
  - `GET /x/web-interface/zone` → `https://api.bilibili.com/x/web-interface/zone`
  - `GET /x/web-interface/ranking/v2` → `https://api.bilibili.com/x/web-interface/ranking/v2`
  - 以此类推...

### B站漫游配置
将 Worker 的域名填入 Bilibili 漫游设置即可使用。

## 环境变量（可选）

如果需要走代理访问 Bilibili API，可在 `wrangler.toml` 或 Dashboard 中设置：

```toml
[vars]
HTTPS_PROXY = "http://your-proxy:port"
```

**注意**：Cloudflare Workers 不支持自定义 TLS 证书校验，此项目假设 Bilibili API 的证书有效（正常情况下是有效的）。

## 文件结构

```
tw-proxy-cloudflare/
├── worker.js       # Worker 主代码
├── wrangler.toml   # Cloudflare Workers 配置
├── package.json    # 开发依赖
└── README.md       # 说明文档
```
