# AI Ad Video Generator - Vue2 + Element UI 组件文档

## 📋 项目概述

AI Ad Video Generator 是一个基于 Vue2 + Element UI 开发的广告视频生成器组件，完全复刻了原 HTML 页面的所有功能和样式。该组件可以让用户通过选择模板、上传产品图片并添加动画描述来生成专业的广告视频。

**特点：**
- ✅ 100% 还原 HTML 版本的设计和功能
- ✅ 基于 Element UI 组件库
- ✅ 响应式设计，支持多端适配
- ✅ 模块化代码结构，易于维护和扩展

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 Vue2
npm install vue@2.6.14

# 安装 Element UI
npm install element-ui@2.15.14

# 安装 Sass 支持
npm install sass sass-loader@10.1.1 -D
```

### 2. 项目配置

#### main.js 配置
```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'

Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(App)
})
```

### 3. 组件使用

```vue
<template>
  <div id="app">
    <ai-ad-video-generator />
  </div>
</template>

<script>
import AIAdVideoGenerator from '@/components/AIAdVideoGenerator.vue'

export default {
  name: 'App',
  components: {
    AIAdVideoGenerator
  }
}
</script>
```

## 📁 文件结构

```
src/
├── components/
│   ├── AIAdVideoGenerator.vue    # 主组件文件
│   └── AIAdVideoGenerator.scss   # 样式文件
├── assets/
│   └── images/                   # 图片资源（可选）
└── main.js                        # 入口文件
```

## 🎯 核心功能

### 1. 模板选择系统
- **10种专业模板**
  - 6种 TikTok 竖版模板 (9:16)
    - Unboxing Experience - 开箱体验
    - Product Reveal - 产品揭示
    - Before & After - 前后对比
    - Lifestyle - 生活方式
    - Customer Testimonial - 用户评价
    - Flash Sale - 限时特卖
  - 4种 YouTube 横版模板 (16:9)
    - YouTube Intro - 视频开场
    - Product Comparison - 产品对比
    - How-To Tutorial - 使用教程
    - Product Showcase - 产品展示

### 2. 智能分类筛选
- All Templates - 显示所有模板
- TikTok (9:16) - 竖版短视频模板
- YouTube (16:9) - 横版视频模板
- 🔥 Trending - 热门模板推荐

### 3. 产品图片上传
- **多种上传方式**
  - 点击上传
  - 拖拽上传
  - 示例产品快速选择
- **智能验证**
  - 支持格式：JPG/PNG
  - 大小限制：10MB
  - 实时预览
  - 一键重置

### 4. Motion 动画描述
- **自定义动画文案**
- **4种预设模板**
  - Dramatic Reveal - 戏剧性揭示
  - Smooth Transition - 流畅过渡
  - Energetic Pop - 活力弹出
  - Elegant Flow - 优雅流动

### 5. 视频生成引擎
- 实时进度显示
- 生成动画效果
- 结果预览
- 下载和重新生成

## 🎨 设计规范

### 主题配色
```scss
$primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
$generate-gradient: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
$success-color: #10b981;
$warning-color: #fbbf24;
$error-color: #ef4444;
$background-color: #f8f9fb;
```

### 设计特点
- Material Design 风格卡片
- 流畅的过渡动画
- 清晰的视觉层次
- 统一的圆角和阴影

## 💻 组件 API

### Props 属性
组件当前无外部 props，所有配置通过内部 data 管理

### Data 数据结构

```javascript
data() {
  return {
    // 菜单配置
    menuItems: Array<{
      icon: String,
      label: String,
      active: Boolean
    }>,
    
    // 模板系统
    templates: Array<{
      id: String,
      name: String,
      description: String,
      category: String,
      platform: String,
      badge?: String,
      badgeType?: String,
      preview: String,
      horizontal: Boolean
    }>,
    
    // 状态管理
    selectedTemplate: String,
    productImage: String,
    motionText: String,
    isGenerating: Boolean,
    processPercent: Number,
    generatedVideo: Boolean
  }
}
```

### Methods 方法列表

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `handleMenuClick` | `index: Number` | `void` | 处理侧边栏菜单点击 |
| `filterTemplates` | `category: String` | `void` | 筛选模板分类 |
| `selectTemplate` | `templateId: String` | `void` | 选择模板 |
| `handleFileUpload` | `file: File` | `Boolean` | 处理文件上传 |
| `loadSampleProduct` | `type: String` | `void` | 加载示例产品 |
| `resetUpload` | - | `void` | 重置上传 |
| `setMotionPreset` | `type: String` | `void` | 设置Motion预设 |
| `generateVideo` | - | `void` | 生成视频 |
| `downloadVideo` | - | `void` | 下载视频 |
| `regenerateVideo` | - | `void` | 重新生成视频 |

### Events 事件

组件内部处理所有事件，如需对外暴露，可添加以下事件：

```javascript
this.$emit('template-selected', templateId)
this.$emit('file-uploaded', file)
this.$emit('video-generated', videoUrl)
```

## 🔧 高级配置

### 1. 添加自定义模板

```javascript
// 在组件的 templates 数组中添加
{
  id: 'custom-template',
  name: 'Custom Template Name',
  description: 'Template description',
  category: 'tiktok trending', // 支持多个分类，空格分隔
  platform: 'TikTok',
  badge: 'NEW', // 可选：HOT, NEW, TRENDING
  badgeType: 'new', // 对应样式类
  preview: 'base64-or-url', // 预览图
  horizontal: false // true 为横版，false 为竖版
}
```

### 2. 自定义 Motion 预设

```javascript
// 修改 presetTexts 对象
presetTexts: {
  custom: 'Your custom motion description...',
  // 添加对应的按钮
}

// 在 motionPresets 数组添加
motionPresets: [
  { type: 'custom', label: 'Custom Motion' }
]
```

### 3. API 接口集成

#### 文件上传接口
```javascript
async handleFileUpload(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await this.$http.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    this.productImage = response.data.url
    this.$message.success('Upload successful!')
  } catch (error) {
    this.$message.error('Upload failed: ' + error.message)
  }
  
  return false
}
```

#### 视频生成接口
```javascript
async generateVideo() {
  if (!this.productImage) {
    this.$message.warning('Please upload a product image first!')
    return
  }

  this.isGenerating = true
  this.processPercent = 0

  try {
    const response = await this.$http.post('/api/generate-video', {
      templateId: this.selectedTemplate,
      productImage: this.productImage,
      motionText: this.motionText
    })

    // 轮询获取进度
    const pollProgress = setInterval(async () => {
      const progress = await this.$http.get(`/api/progress/${response.data.taskId}`)
      this.processPercent = progress.data.percent
      
      if (progress.data.status === 'completed') {
        clearInterval(pollProgress)
        this.generatedVideo = progress.data.videoUrl
        this.isGenerating = false
        this.$message.success('Video generated successfully!')
      }
    }, 1000)
  } catch (error) {
    this.isGenerating = false
    this.$message.error('Generation failed: ' + error.message)
  }
}
```

## 📱 响应式适配

### 断点设置
- **大屏** (>1200px): 4列模板网格，双栏工作区
- **中屏** (768-1200px): 3列模板网格，单栏工作区
- **小屏** (<768px): 2列模板网格，隐藏侧边栏

### 移动端优化
```scss
// 自定义移动端样式
@media (max-width: 768px) {
  // 隐藏侧边栏
  .sidebar { display: none; }
  
  // 调整内边距
  .main-container { padding: 20px; }
  
  // 优化触控目标大小
  .category-tab { 
    min-height: 44px; 
    min-width: 44px;
  }
}
```

## 🐛 问题解决

### 常见问题

**Q: Element UI 样式覆盖不生效**
```scss
// 使用深度选择器
::v-deep .el-button {
  // 自定义样式
}
```

**Q: 上传大文件导致页面卡顿**
```javascript
// 使用分片上传
const chunkSize = 1024 * 1024 * 2 // 2MB
const chunks = Math.ceil(file.size / chunkSize)
// 实现分片上传逻辑
```

**Q: 模板预览图加载缓慢**
```javascript
// 使用懒加载
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload)
```

### 性能优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 实现懒加载
   - 使用 CDN 加速

2. **代码分割**
   ```javascript
   const AIAdVideoGenerator = () => import('@/components/AIAdVideoGenerator.vue')
   ```

3. **状态管理**
   - 大型项目建议使用 Vuex
   - 缓存生成的视频结果

## 📄 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 60+ |
| Firefox | 60+ |
| Safari | 12+ |
| Edge | 79+ |
| IE | 11 (需要 polyfill) |

## 🚩 更新日志

### v1.0.0 (2024-01-25)
- ✨ 初始版本发布
- ✨ 完整复刻 HTML 版本功能
- ✨ 实现10种视频模板
- ✨ 支持拖拽上传
- ✨ Motion 动画系统
- ✨ 响应式设计

### 待开发功能
- [ ] 批量处理
- [ ] 视频预览播放器
- [ ] 更多模板样式
- [ ] 自定义水印
- [ ] 导出多种格式

## 📞 技术支持

如遇到问题或需要帮助：
- 📧 Email: support@example.com
- 💬 微信群：扫码加入技术交流群
- 🐛 Issue: GitHub Issues

## 📜 许可证

MIT License - 可自由使用和修改

---

**Made with ❤️ by MediaEnhance Team**
