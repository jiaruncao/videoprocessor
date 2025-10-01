# Video & Audio to Text 组件文档

## 📋 概述

Video & Audio to Text 是一个基于 Vue2 + Element UI 开发的音视频转文字组件，提供了完整的语音识别、多语言支持和翻译功能。该组件完美复刻了原 HTML 版本的所有功能和样式。

## 🚀 技术栈

- **Vue 2.6+** - 渐进式 JavaScript 框架
- **Element UI 2.15+** - 基于 Vue 2.0 的组件库
- **Sass/SCSS** - CSS 预处理器

## 📦 安装依赖

```bash
# 安装 Vue
npm install vue@2.6.14

# 安装 Element UI
npm install element-ui@2.15.14

# 安装 Sass 支持
npm install sass sass-loader@10 -D
```

## 🎨 文件结构

```
components/
├── VideoAudioToText.vue    # 主组件文件
├── VideoAudioToText.scss   # 样式文件
└── README.md               # 说明文档
```

## 💡 使用方法

### 1. 全局注册 Element UI

```javascript
// main.js
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

### 2. 导入组件

```javascript
import VideoAudioToText from '@/components/VideoAudioToText.vue'

export default {
  components: {
    VideoAudioToText
  }
}
```

### 3. 在模板中使用

```vue
<template>
  <div id="app">
    <video-audio-to-text />
  </div>
</template>
```

## 🎯 主要功能

### 1. 文件上传
- ✅ 支持拖拽上传
- ✅ 支持点击选择文件
- ✅ 支持多种音视频格式：.mp4, .mov, .m4v, .mp3, .wav, .m4a, .aac
- ✅ 最大支持 2GB 文件
- ✅ 上传成功动画提示

### 2. 语言识别
- ✅ 自动检测语言
- ✅ 支持 10+ 种语言选择
- ✅ 智能语言冲突检测

### 3. 翻译功能
- ✅ 可选的翻译开关
- ✅ 支持 15 种目标语言
- ✅ 源语言与目标语言冲突自动处理
- ✅ 翻译进度实时显示

### 4. 输出格式
- ✅ TXT 格式 - 纯文本输出
- ✅ SRT 格式 - 带时间戳的字幕格式

### 5. 示例文件
- ✅ 提供 4 种快速示例
  - 🎙️ Interview (访谈)
  - 🎧 Podcast (播客)
  - 💼 Meeting (会议)
  - 🎓 Lecture (讲座)

### 6. 处理进度
- ✅ 实时进度条显示
- ✅ 百分比进度提示
- ✅ 处理步骤详情显示
- ✅ 完成状态动画

## 📊 组件属性 (Props)

该组件目前没有外部 props，所有配置通过内部 data 管理。如需自定义，可以扩展以下属性：

```javascript
props: {
  maxFileSize: {
    type: Number,
    default: 2 * 1024 * 1024 * 1024 // 2GB
  },
  acceptFormats: {
    type: String,
    default: '.mp4,.mov,.m4v,.mp3,.wav,.m4a,.aac'
  },
  enableTranslationDefault: {
    type: Boolean,
    default: false
  }
}
```

## 🎈 组件事件

可以扩展以下事件供父组件监听：

```javascript
// 文件上传成功
this.$emit('upload-success', file)

// 转录开始
this.$emit('transcription-start', { 
  file: this.currentFile,
  settings: {
    language: this.languageSelect,
    translation: this.enableTranslation,
    format: this.outputFormat
  }
})

// 转录完成
this.$emit('transcription-complete', {
  text: this.transcriptionText,
  format: this.outputFormat
})

// 下载文件
this.$emit('download', {
  fileName: fileName,
  content: this.transcriptionText
})
```

## 🔧 数据结构

### 组件内部状态

```javascript
data() {
  return {
    // 菜单项配置
    menuItems: [
      { icon: '📊', label: 'Dashboard', active: false },
      { icon: '📝', label: 'Speech to Text', active: true },
      // ...
    ],
    
    // 文件相关
    currentFile: null,          // 当前上传的文件
    filePreview: false,         // 是否显示文件预览
    fileName: '',               // 文件名
    mediaDuration: '00:00',     // 媒体时长
    
    // 设置选项
    languageSelect: 'auto',     // 源语言选择
    enableTranslation: false,   // 是否启用翻译
    translationLanguage: 'en',  // 目标翻译语言
    outputFormat: 'txt',        // 输出格式
    
    // 处理状态
    processing: false,          // 是否正在处理
    processingComplete: false,  // 处理是否完成
    processPercent: 0,          // 处理进度百分比
    transcriptionText: '',      // 转录文本结果
  }
}
```

## 🎨 样式定制

### 主题颜色

组件使用了以下主题颜色，可以通过修改 SCSS 变量进行定制：

```scss
// 主色调
$primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
$primary-color: #6366f1;
$secondary-color: #8b5cf6;

// 成功/错误色
$success-color: #10b981;
$error-color: #ef4444;

// 背景色
$background-light: #f8f9fb;
$background-dark: #1a1d23;

// 文字颜色
$text-primary: #1e293b;
$text-secondary: #64748b;
$text-muted: #94a3b8;
```

### 自定义样式

可以通过以下方式覆盖默认样式：

```scss
// 自定义侧边栏宽度
.video-audio-to-text-page {
  .sidebar {
    width: 300px; // 默认 260px
  }
}

// 自定义按钮样式
.action-btn.btn-process {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

## 📱 响应式设计

组件包含三个响应式断点：

- **Desktop (>1024px)**: 完整布局，两列显示
- **Tablet (768px-1024px)**: 单列布局，隐藏部分次要元素
- **Mobile (<768px)**: 移动优化，隐藏侧边栏，简化界面

## 🔌 API 集成

### 与后端接口对接示例

```javascript
// 上传文件到服务器
async uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.fileId
  } catch (error) {
    this.$message.error('Upload failed')
  }
}

// 开始转录
async startTranscriptionAPI(fileId) {
  const params = {
    fileId: fileId,
    language: this.languageSelect,
    enableTranslation: this.enableTranslation,
    translationLanguage: this.translationLanguage,
    outputFormat: this.outputFormat
  }
  
  try {
    const response = await axios.post('/api/transcribe', params)
    
    // 轮询检查状态
    this.pollTranscriptionStatus(response.data.taskId)
  } catch (error) {
    this.$message.error('Transcription failed')
  }
}

// 轮询任务状态
async pollTranscriptionStatus(taskId) {
  const interval = setInterval(async () => {
    const response = await axios.get(`/api/transcribe/status/${taskId}`)
    
    this.processPercent = response.data.progress
    
    if (response.data.status === 'completed') {
      clearInterval(interval)
      this.transcriptionText = response.data.result
      this.processingComplete = true
    }
  }, 1000)
}
```

## 🚦 生命周期

```javascript
created() {
  // 初始化默认设置
  this.initializeSettings()
},

mounted() {
  // 设置拖拽事件监听
  this.setupDragListeners()
},

beforeDestroy() {
  // 清理资源
  this.cleanup()
}
```

## ⚠️ 注意事项

1. **文件大小限制**: 默认限制为 2GB，可根据服务器配置调整
2. **浏览器兼容性**: 需要支持 HTML5 File API 的现代浏览器
3. **Element UI 版本**: 确保使用 2.15.0 以上版本
4. **语言冲突**: 源语言和翻译目标语言相同时会自动切换
5. **网络要求**: 实际使用需要稳定的网络连接进行文件上传和处理

## 🔄 版本历史

### v1.0.0 (2024-01-26)
- ✅ 初始版本发布
- ✅ 完整实现音视频上传功能
- ✅ 支持多语言识别
- ✅ 添加翻译功能
- ✅ 支持 TXT/SRT 格式导出

### 待开发功能
- [ ] 批量文件处理
- [ ] 实时转录功能
- [ ] 更多输出格式 (VTT, JSON, PDF)
- [ ] 自定义词汇表
- [ ] 说话人分离
- [ ] 关键词高亮
- [ ] 历史记录管理

## 💻 开发调试

```bash
# 开发环境
npm run serve

# 生产构建
npm run build

# 代码检查
npm run lint
```

## 📞 技术支持

如有问题或建议，请联系开发团队或提交 Issue。

## 📄 许可证

MIT License - 可自由使用和修改
