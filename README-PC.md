# Video & Image Enhancer - PC端 Vue2 + Element UI 组件

## 📋 项目说明

这是一个专为PC端设计的视频/图片增强组件，基于Vue2 + Element UI开发，提供了完整的文件上传、处理和对比展示功能。该组件采用现代化的UI设计，具有优秀的用户体验。

## 🎯 主要特性

### 核心功能
- ✅ **文件上传**：支持拖拽、点击选择，多文件批量上传（最多8个）
- ✅ **实时预览**：上传后即时显示文件预览
- ✅ **分辨率选择**：HD (1920×1080) / 4K (3840×2160)
- ✅ **处理进度**：实时显示处理进度和状态
- ✅ **对比展示**：左右并排对比原始和增强效果
- ✅ **视频控制**：同步播放、暂停、重新开始、静音控制
- ✅ **示例文件**：内置示例快速测试

### 技术特点
- 基于Vue2框架，兼容性好
- 使用Element UI组件库，UI统一美观
- 纯前端实现，可轻松集成后端API
- 响应式设计，适配不同屏幕尺寸
- 模块化代码结构，易于维护

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Vue2（如果项目中还没有）
npm install vue@2.6.14

# 安装Element UI
npm install element-ui@2.15.14

# 安装Sass预处理器
npm install sass sass-loader@10.1.1 -D
```

### 2. 全局配置

在 `main.js` 中引入Element UI：

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

// 可选：自定义主题
Vue.use(ElementUI, {
  size: 'medium', // 组件默认尺寸
  zIndex: 3000    // 弹框起始z-index
})
```

### 3. 使用组件

```vue
<template>
  <div id="app">
    <video-enhancer />
  </div>
</template>

<script>
import VideoEnhancer from '@/components/VideoEnhancer.vue'

export default {
  name: 'App',
  components: {
    VideoEnhancer
  }
}
</script>
```

## 📁 项目结构

```
src/
├── components/
│   ├── VideoEnhancer.vue      # 主组件
│   └── VideoEnhancer.scss     # 样式文件
├── assets/
│   └── samples/               # 示例文件（可选）
└── main.js                    # 入口文件
```

## 🔧 配置说明

### 组件Props（可扩展）

虽然当前版本没有暴露props，但可以根据需要添加：

```javascript
props: {
  // 最大文件大小（MB）
  maxFileSize: {
    type: Number,
    default: 100
  },
  // 支持的文件格式
  acceptFormats: {
    type: String,
    default: '.mp4,.mov,.m4v,.3gp,.avi,.jpg,.jpeg,.png'
  },
  // API端点
  apiEndpoint: {
    type: String,
    default: '/api/enhance'
  },
  // 是否自动处理
  autoProcess: {
    type: Boolean,
    default: false
  }
}
```

### 事件（Events）

组件可以发出以下事件：

```javascript
// 文件上传成功
this.$emit('upload-success', file)

// 处理完成
this.$emit('process-complete', result)

// 下载文件
this.$emit('download', fileInfo)

// 错误处理
this.$emit('error', error)
```

## 🎨 样式定制

### 修改主题色

在 `VideoEnhancer.scss` 中修改变量：

```scss
// 主题色定义
$primary-color: #6366f1;
$primary-gradient-start: #6366f1;
$primary-gradient-end: #8b5cf6;
$success-color: #10b981;
$danger-color: #ef4444;
$bg-color: #f8f9fb;
$sidebar-bg: #1a1d23;
```

### 自定义组件样式

```scss
// 覆盖Element UI样式
.video-enhancer-page {
  ::v-deep .el-button--primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
  }
  
  ::v-deep .el-progress-bar__inner {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
  }
}
```

## 💻 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 80+ | 完全支持 |
| Firefox | 75+ | 完全支持 |
| Safari | 13+ | 完全支持 |
| Edge | 80+ | 完全支持 |
| IE | - | 不支持 |

## 🔌 API集成

### 1. 文件上传API

```javascript
// 修改 startProcessing 方法
async startProcessing() {
  const formData = new FormData()
  formData.append('file', this.currentFile)
  formData.append('resolution', this.resolution)
  
  try {
    const response = await axios.post('/api/enhance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        this.processPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    
    this.enhancedVideoSrc = response.data.url
    this.processingComplete = true
    this.$message.success('Processing complete!')
  } catch (error) {
    this.$message.error('Processing failed: ' + error.message)
  }
}
```

### 2. WebSocket实时进度

```javascript
// 建立WebSocket连接
connectWebSocket() {
  const ws = new WebSocket('ws://localhost:3000/progress')
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    this.processPercent = data.progress
    
    if (data.status === 'complete') {
      this.enhancedVideoSrc = data.resultUrl
      this.processingComplete = true
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}
```

## 📊 性能优化

### 1. 大文件处理

```javascript
// 分片上传
async uploadChunks(file) {
  const chunkSize = 5 * 1024 * 1024 // 5MB
  const chunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    await this.uploadChunk(chunk, i, chunks)
  }
}
```

### 2. 内存管理

```javascript
// 及时释放资源
releaseResources() {
  // 撤销对象URL
  if (this.originalVideoSrc.startsWith('blob:')) {
    URL.revokeObjectURL(this.originalVideoSrc)
  }
  
  // 清除视频元素
  if (this.$refs.originalVideo) {
    this.$refs.originalVideo.src = ''
    this.$refs.originalVideo.load()
  }
}
```

## 🐛 常见问题

### 1. 视频无法播放
- 检查视频格式是否被浏览器支持
- 确认视频编码是否正确（H.264推荐）
- 验证CORS设置是否正确

### 2. 上传失败
- 检查文件大小限制
- 验证文件格式
- 确认服务器配置

### 3. 样式问题
- 确保正确引入Element UI样式
- 检查Sass loader版本兼容性
- 验证CSS作用域设置

## 🚩 版本更新

### v1.0.0 (2024-01-25)
- ✅ 初始PC端版本发布
- ✅ 完整的视频/图片处理功能
- ✅ Element UI组件集成
- ✅ 响应式设计

### v1.1.0 (计划中)
- ⏳ 批量文件处理
- ⏳ 拖拽排序
- ⏳ 实时预览效果
- ⏳ 导出多种格式

## 📄 开发团队

- 前端开发：Vue2 + Element UI
- UI设计：现代化扁平设计
- 测试：Chrome, Firefox, Safari

## 📝 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📞 联系方式

- 项目地址：[GitHub Repository]
- Issue反馈：[Issue Tracker]
- 邮箱：support@videoenhancer.com

---

Made with ❤️ using Vue2 + Element UI