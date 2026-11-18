# 🏠 家庭点菜系统

家里人各自在手机上勾菜 → 汇总排行 → 转盘抽今晚吃什么 → 自动生成买菜清单。

- 前端：Vite + Vue3 + Vant 4（移动端优先，大按钮）
- 后端：Vercel Serverless Functions（`/api/*`，免运维）
- 数据：Upstash Redis 免费层（10 万命令/天，无需信用卡）

## 页面

| 页 | 功能 |
|---|---|
| 点菜 | 选自己名字 → 按分类勾菜（显示实时票数）→ 提交 |
| 汇总 | 今日全家的菜按得票排序 + 每人点了什么 + 清空今日 |
| 转盘 | 从菜品库随机抽一道，转 4 秒出结果 |
| 买菜 | 今日点中菜品的食材并集清单，可划掉 |
| 管理 | PIN 门 → 改家人名单 / 增删改菜品（含食材表） |

## 部署（手把手，全程 ~15 分钟）

### 1. 推到 GitHub

```bash
cd family-menu
git init && git add - . && git commit -m "家庭点菜 v1"
# GitHub 建一个私有仓库 family-menu，然后：
git remote add origin https://github.com/你的用户名/family-menu.git
git push -u origin main
```

### 2. Vercel 导入

1. 打开 https://vercel.com （你已有账号）→ **Add New → Project**
2. Import 刚才的 `family-menu` 仓库
3. Framework 会自动识别为 **Vite**（Build: `npm run build`，Output: `dist`），不用改
4. **先别点 Deploy**，去下一步拿环境变量

### 3. Upstash 免费数据库（存数据）

1. 打开 https://console.upstash.com → 用 Google/GitHub 登录（免费层**不用绑卡**）
2. **Create Database** → 名字随便（如 `family-menu`），Region 选 `ap-northeast-1 (Tokyo)`（离国内近）
3. 创建后进数据库页 → 找 **REST API** 区块，复制两个值：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. 回到 Vercel 填环境变量并部署

在刚才的 Import 页面（或 项目 → Settings → Environment Variables）添加 3 个变量：

| Key | Value | 说明 |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | 第 3 步复制的 URL | |
| `UPSTASH_REDIS_REST_TOKEN` | 第 3 步复制的 Token | |
| `ADMIN_PIN` | 你自定的 4-6 位数字 | 管理页密码，默认 8888 |

→ **Deploy**。一分钟后拿到 `https://family-menu-xxx.vercel.app`。

### 5. ⚠️ 关键验证：用**手机流量**打开

电脑上开着代理测不准！用手机**关 WiFi** 直接访问部署地址：

- ✅ 能打开 → 分享链接到家庭群，完事
- ❌ 打不开/很慢 → `*.vercel.app` 在你的地区被污染，花 ~20 元买个域名（腾讯云/Namesilo）：
  1. Vercel 项目 → Settings → Domains → Add，按提示加 CNAME 记录 `cname.vercel-dns.com`
  2. 域名 DNS 生效后，用 `http://你的域名` 访问（服务器在境外，**不需要备案**）

## 本地开发

> ⚠️ 本机默认 node 是 v12（宁阳/老项目用），本项目要 18+：先 `nvm use 20.16.0`，或在 IDE 里选 E:\app\nvm\v20.16.0。

```bash
npm install
npm run dev        # 前端 http://localhost:5173（/api 代理到 3000）
npx vercel dev --listen 3000   # 另开终端：本地跑 serverless（.env.local 填同样变量）
```

或 `npm run build` 后把 `dist/` 丢任何静态托管 + `api/` 丢支持 Node serverless 的平台。

## 数据说明

- 全部数据存在 Upstash 一个 key（`fmenu`）里：家人名单、菜品库、按日期的勾选记录
- 首次访问自动播种 15 道家常菜 + 3 个默认成员，去「管理」页改成自己家的
- 勾选按"当日"覆盖保存（重复提交 = 覆盖自己的，不影�别人）；历史按日期保留
- 想备份/迁移：Upstash 控制台看一下 `fmenu` 这个 key，JSON 拷走即可

## 改菜灵感

管理页每道菜可填：图标 emoji、分类、辣度、食材（每行一种）。食材写全点，买菜清单才准。
