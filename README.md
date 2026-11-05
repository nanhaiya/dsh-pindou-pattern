# 拼豆图纸工坊 · Bead Pattern Studio

一个 DeepSeek Harness 插件：上传任意图片，生成 **MARD 色号** 的拼豆图纸，尺寸（格子数）自由设定，支持导出可打印的图纸 PNG 与色号清单 CSV。

![示例输出](docs/sample-output.png)

![工作台界面](docs/preview.png)

## 功能

- **图片转图纸**：PNG / JPG / WebP，点击选择、拖拽到画布，或直接 Ctrl+V 粘贴剪贴板图片。
- **尺寸自定义**：25×25、29×29、48×48、50×50、64×64 预设，也可手填 8–200 之间的宽高；上传时自动按原图比例建议高度。
- **MARD 官方色号**：内置 291 色完整色卡（标准 221 色 + 扩展 P/Q/R/T/Y/ZG 70 色），可切换「标准 221」或「全部 291」。
- **颜色数量可控**：Lab 空间 k-means 聚类 + 最近色映射，颜色上限 2–64（默认 24），保证成品不会出现几十种难买的色号。
- **抖动（可选）**：Floyd–Steinberg 蛇形误差扩散，用颗粒感换细节，适合人像与渐变。
- **去纯色背景（可选）**：自动检测图片边框是否为纯色，是则抠成空格；容差可调（ΔE 0–60）。
- **画布预览**：每一格都标注对应色号（默认开启，可关）、行列编号、5 格加粗网格、按底色自动反色、缩放 1×/2×/3×；为保证色号看得清，格子不小于 20px，宽图可横向滚动并自动居中。
- **导出图纸 PNG**：标题 + 尺寸/色数/总颗数 + 四边行列编号 + 格内色号 + 色卡图例（色号 + 颗数）+ 页脚，长边最高 4100px。
- **导出色号清单 CSV**：`code,hex,count` + `TOTAL` 行，带 UTF-8 BOM，Excel 直接打开不乱码。
- 中英双语界面，跟随 Harness 语言；亮/暗主题跟随 `--dsw-alias-*` token；设置自动记住，可一键恢复默认。

## 安装

从 npm 安装（发布后可用，装完出现在「插件中心」）：

```bash
dsh plugin --profile web add dsh-pindou-pattern
```

或直接源码安装这个仓库：

```bash
dsh plugin --profile web add github:<owner>/dsh-pindou-pattern
```

本地开发时也可以直接安装目录：

```bash
dsh plugin add E:\workspace\pindou   # 或在 Harness 的插件面板里安装该目录
```

安装后侧边栏「全局面板」会出现「拼豆图纸工坊」入口（排在「智能体」之后），点击即可打开工作台。

## 使用

1. 上传图片（选择 / 拖拽 / Ctrl+V）。
2. 选尺寸：先点预设，或直接改宽高。上传时若原图不是正方形，会自动把高度调整为贴合比例。
3. 调颜色：切换色号范围、拖动「颜色上限」、按需打开抖动或去背景。
4. 右上角「导出图纸」预览并下载 PNG；「CSV」导出色号清单。

每格显示的就是 MARD 色号，图例给出每种色号的颗数，按颗数排序。

## 算法

```
图片 → 逐级减半降采样 → W×H 网格像素
     → （可选）纯色背景判定 → 空格
     → Lab 空间 k-means（k = 颜色上限，固定种子，可复现）
     → 质心映射到最近的 MARD 色号（限定标准/全部）
     → 逐格最近色（或 Floyd–Steinberg 抖动）
     → cells + 色号统计 → Canvas 预览 / 图纸 PNG / CSV
```

- 颜色距离使用 CIELAB ΔE（D65）。
- 背景判定：取图片四边像素的中位色，只有当边框上 ≥55% 的像素落在该色 ΔE≤10 内时才认为是纯色背景（照片不会被误判）。
- 训练集上限 12000 点，200×200 网格 + 64 色 + 抖动约 80–160ms。

## 兼容性

- DSH 版本：`>= 0.2.1-rc.3`（`dsh.engines.dsh`）
- 平台：Web（浏览器端 Canvas 渲染，无 Host 服务）
- 运行环境：Node.js >= 20.3（宿主侧仅安装依赖，不需要额外服务）
- 浏览器：支持 Canvas 2D 的现代浏览器（Chrome / Edge / Safari 16+ / Firefox）

## 权限与隐私

- 图片**只在浏览器本地处理**：不上传、不发网络请求，导出文件由本地 Canvas 生成。
- 不申请任何 DSH 工具、文件系统或凭据权限；Host 半只有空 `apply()`。
- 设置（尺寸、色号范围、颜色上限等）存在浏览器 `localStorage`，可随时「恢复默认设置」清除。

## 开发

```bash
node build.mjs     # 把 src/palette.json + engine.js + ui.js 打成 client.js
node --check client.js
node test/engine.test.cjs   # 13 组引擎断言（色卡、聚类、抖动、去背、性能）
```

- `src/palette.json`：291 个 MARD 色号 `{code, hex, series}`。
- `src/engine.js`：纯逻辑（采样、聚类、映射、抖动、背景判定），无 DOM 依赖。
- `src/ui.js`：面板注册、界面、Canvas 预览与图纸渲染、导出、i18n。
- `build.mjs`：把调色板内联进 `client.js`，产出 `window.__ModuleLoader__.load(...)` 模块。
- `client.js`：构建产物，插件实际加载的文件。

色卡数据整理自 [pixel-beads.com 的 MARD 色号表](https://www.pixel-beads.com/zh/mard-bead-color-chart)（291 色 / 标准 221 / 扩展 70）。

## 结构

```
package.json          # dsh.bundle.patch + dsh.client 声明
cordis.patch.yml      # 插入 pindou-pattern 条目
index.js              # Host 半（无需服务，空实现）
client.js             # 构建产物：角色面板 + 工作台 UI
src/                  # 源码（palette / engine / ui）
locale/{zh,en}.json   # 插件元信息文案
icon.svg              # 侧栏图标
```

## 许可

MIT
