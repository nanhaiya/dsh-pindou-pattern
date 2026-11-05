# 提交到 dsh-plugin.org

本站（[dsh-plugin.org](https://dsh-plugin.org/zh/submit)）不做文件上传，收录方式是：**公开 GitHub 仓库 + `dsh-plugin` topic + README + 根目录 `package.json`**，然后开一个 issue 提交。仓库里已经准备好了需要的文件。

## 0. 一键脚本（推荐）

在**能正常访问 GitHub 的机器**上：

```bash
cd dsh-pindou-pattern          # 仓库根目录
bash publish.sh                # 构建 + 测试 + git push + npm publish
```

- 首次会要求先建空仓库：<https://github.com/new?name=dsh-pindou-pattern&visibility=public>（不要勾选初始化 README）。
- GitHub 用户名不是当前 `git config user.name` 时：`OWNER=你的名字 bash publish.sh`。
- 只想推仓库：`SKIP_NPM=1 bash publish.sh`。

脚本跑完后仍要做下面第 2 步（加 topic）和第 4 步（开 issue）。

## 1. 创建 GitHub 仓库并推送

```bash
cd E:\workspace\pindou
git init
git add .
git commit -m "feat: 拼豆图纸工坊 — image to MARD bead pattern"
git branch -M main
git remote add origin https://github.com/<owner>/dsh-pindou-pattern.git
git push -u origin main
```

> 把 `<owner>` 换成你的 GitHub 用户名。仓库必须是 **public**。
> `work/`、`dist/` 已在 `.gitignore` 里，不会被提交。

## 2. 给仓库加 topic

GitHub 仓库页 → 右上 ⚙️（About 旁的齿轮）→ Topics 填入 `dsh-plugin` → 保存。
可再加 `deepseek-harness`、`perler-beads`、`pixel-art`。

## 3. 发布 npm 包（可选，但上「插件中心」必须）

```bash
cd E:\workspace\pindou
npm publish
```

发布前 `prepublishOnly` 会跑 `node build.mjs` 重新生成 `client.js`。
包名 `dsh-pindou-pattern` 若已被占用，改 `package.json` 的 `name`（例如加个前缀）再发布，并同步改 README 与下面的安装命令。

## 4. 开 Issue 提交

打开 <https://github.com/dshplugin/dsh-plugin-hub/issues/new>，按下面模板填写（或直接用 `/zh/submit` 页面的「自动预填」按钮改字段）。

标题：

```
[插件提交] <owner>/dsh-pindou-pattern — 上传图片，一键生成任意尺寸的 MARD 色号拼豆图纸
```

正文：

```markdown
### 仓库地址
<https://github.com/<owner>/dsh-pindou-pattern>

### 一句话价值
上传任意图片，在 DSH 里直接生成可打印的 MARD 色号拼豆图纸，尺寸与颜色数可自定义，并导出图纸 PNG 与色号清单 CSV。

### 能力分类
界面与体验

### 安装命令
dsh plugin --profile web add dsh-pindou-pattern
（源码安装：dsh plugin --profile web add github:<owner>/dsh-pindou-pattern）

### 兼容与运行要求
DSH >= 0.2.1-rc.3，Web 平台；纯浏览器 Canvas 运算，不需要额外服务或 API Key。

### 许可证
MIT

### 截图 / 演示
仓库 docs/preview.png（工作台）与 docs/sample-output.png（导出图纸，50×50 / 8 色 / 378 颗）。

### 补充说明
内置 MARD 291 色（标准 221 + 扩展 70），可限定只用标准色；图片全程本地处理，不上传、不联网；不申请任何 DSH 工具权限。

### 提交前自查
- [x] 仓库已公开
- [x] 已添加 GitHub topic：dsh-plugin
- [x] README 包含安装命令
- [x] 插件导出 apply(ctx) 模块
- [x] 仓库根目录包含 package.json
```

## 5. 收录后加徽章（可选）

把 `your-owner` / `dsh-pindou-pattern` 换成详情页地址里的值，加进 README 顶部：

```markdown
[![Listed on dsh-plugin.org](https://dsh-plugin.org/badges/listed.svg)](https://dsh-plugin.org/plugins/your-owner/dsh-pindou-pattern)
```

## 发布物

`dist/` 里是三个形态的发布文件：

| 文件 | 大小 | SHA-256 |
| --- | --- | --- |
| `dsh-pindou-pattern-0.1.0.tgz` | 934,373 B | `9b8e2f0a814f441c66a433bb725c35250e6f1ee89ee0609c476dfd233c3cdb33` |
| `BeadPatternStudio.exe` | 917,504 B | `e1abe6e1687cf2f4124661a6dd64a3ea405168449c94a05b08e5d2c6e8c3e6d4` |
| `pindou-web.zip` | 25,202 B | `828c6984555fa14360d70f8df3f61c2f4143bc5934f27eba1efbede991f958ad` |

- **.tgz** 是 npm 包（`package.json`、`index.js`、`client.js`、`cordis.patch.yml`、`icon.svg`、`locale/`、`src/`、`web/`、`win/`、`docs/`、README、LICENSE）。
  - 直接发布：`npm publish dist/dsh-pindou-pattern-0.1.0.tgz`
  - 或本地试装：`dsh plugin add dist/dsh-pindou-pattern-0.1.0.tgz`
- **.exe** 是 Windows 桌面版（单文件，内置网页 + WebView2 SDK 程序集），双击即用。
- **.zip** 里是 `index.html` 单文件网页版，解压后双击即可，也可以整份传到你自己的静态托管。

重新打包：

```bash
node build.mjs && node build-web.mjs
npm pack --pack-destination dist
powershell -File win/build-exe.ps1
powershell -Command "Compress-Archive web/index.html dist/pindou-web.zip -Force"
```
