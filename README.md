# AI Image Cutout - 浏览器端智能抠图工具

AI Image Cutout 是一个基于 React 的开源项目，使用 u2net.onnx 模型和 onnxruntime-web 在浏览器中实现本地运行的智能图像抠图功能。无需服务器支持，所有图像处理均在用户设备上完成，保护用户隐私。

# ✨ 核心特性
纯前端实现 - 所有计算在浏览器中完成，无需后端服务器

实时抠图处理 - 使用 WebAssembly 加速 ONNX 模型推理

隐私保护 - 用户图像永不离开本地设备

高质量结果 - 基于 u2net 深度学习模型的专业级抠图效果

轻量级 - 优化模型加载，快速启动应用


# 🚀 在线体验
http://aicut.online

# ⚙️ 安装与运行
前置要求\

```
Node.js 18+\
pnpm 8+\
现代浏览器（推荐 Chrome 或 Edge）
```

安装步骤
```
bash
# 克隆仓库
git clone https://github.com/yuedud/aicut.git
```

# 安装依赖
```
npm install
// 或使用 yarn
yarn install
// 或使用pnpm
pnpm install
```

# 启动开发服务器
```
npm start
// 或使用 yarn
yarn start
// 或使用pnpm
pnpm start
```

应用将在 http://localhost:3000 启动
