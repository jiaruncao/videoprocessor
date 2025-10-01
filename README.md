# Video Deduplication Vue Component 使用说明

## 📦 组件信息

**组件名称**: VideoDeduplication  
**框架版本**: Vue 2.x + Element UI 2.x  
**样式预处理器**: SCSS  
**功能描述**: 智能视频去重组件，提供AI驱动的视频处理和去重功能

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Vue和Element UI
npm install vue@2.6.14
npm install element-ui@2.15.14

# 安装样式依赖
npm install sass sass-loader@10.0.0 -D
```

### 2. 全局引入Element UI

在 `main.js` 中配置:

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

### 3. 组件引入

```vue
<template>
  <video-deduplication />
</template>

<script>
import VideoDeduplication from '@/components/VideoDeduplication/VideoDeduplication.vue'

export default {
  components: {
    VideoDeduplication
  }
}
</script>
```

## 📁 文件结构

```
components/
└── VideoDeduplication/
    ├── VideoDeduplication.vue    # 主组件文件
    ├── VideoDeduplication.scss   # 样式文件
    └── README.md                  # 使用说明
```

## 🎯 核心功能

### 1. 双模式处理
- **Smart Mode (智能模式)**: 一键优化，使用预设的8种优化效果
- **Custom Mode (自定义模式)**: 手动选择所有处理参数

### 2. 文件上传
- 支持拖拽上传
- 支持批量上传（最大500MB/文件）
- 支持格式: MP4, MOV, M4V, 3GP, AVI, MKV, WebM
- 实时文件预览

### 3. Basic Deduplication (基础去重)
仅在Custom Mode下可见，包含10个选项:
- Remove Duplicates (去除重复)
- Mirror Flip (镜像翻转)
- Random Position Shift (随机位置偏移)
- Modify MD5 Hash (修改MD5哈希)
- Smart Frame Extraction (智能帧提取)
- Smart Color Adjustment (智能色彩调整)
- Image Sharpening (图像锐化)
- Random Speed Variation (随机速度变化)
- Trim Head/Tail (去头去尾)
- Random Mirror (随机镜像)

### 4. Special Effects (特殊效果)
仅在Custom Mode下可见，包含9种效果:
- Scan Line (扫描线)
- Spotlight (聚光灯)
- Fade (淡入淡出)
- Booklet (书册效果)
- Dissolve (溶解)
- Split Screen (分屏)
- Product (产品展示)
- Film (电影效果)
- Drama (戏剧效果)

### 5. Zoom Settings (缩放设置)
- Stretch (拉伸)
- Compress (压缩)
- Dynamic (动态缩放)

### 6. 实时对比预览
- 左侧显示原始视频
- 右侧显示处理后效果
- 支持视频和图片格式

### 7. 处理统计
- 原始文件数量
- 处理成功数量
- 应用的效果数量
- 成功率统计

## 🔧 组件属性和方法

### Data 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| processingMode | String | 'smart' | 处理模式 ('smart' 或 'custom') |
| uploadedFiles | Array | [] | 已上传的文件列表 |
| basicOptions | Array | [] | 选中的基础去重选项 |
| selectedEffect | String | null | 选中的特效 |
| selectedZoom | String | null | 选中的缩放模式 |
| processing | Boolean | false | 是否正在处理 |
| processingComplete | Boolean | false | 处理是否完成 |
| processPercent | Number | 0 | 处理进度百分比 |

### Methods 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| handleFileChange | file, fileList | void | 处理文件选择 |
| handleFileRemove | file, fileList | void | 处理文件移除 |
| handleModeChange | mode | void | 处理模式切换 |
| selectEffect | effect | void | 选择特效 |
| startProcessing | - | void | 开始处理视频 |
| showResults | - | void | 显示处理结果 |
| downloadResults | - | void | 下载处理报告 |

## 🎨 样式定制

### 主题色修改

在 `VideoDeduplication.scss` 中修改主题变量:

```scss
// 主色调
$primary-color: #6366f1;
$primary-gradient-start: #6366f1;
$primary-gradient-end: #8b5cf6;

// 成功色
$success-color: #10b981;

// 错误色
$error-color: #ef4444;

// 背景色
$bg-color: #f8f9fb;
```

### 自定义组件样式

```scss
// 覆盖侧边栏宽度
.video-deduplication-page {
  .sidebar {
    width: 300px; // 默认260px
  }
}

// 自定义卡片阴影
.upload-container,
.settings-container {
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
}
```

## 📱 响应式支持

组件内置响应式断点:
- **桌面端**: > 1200px (完整布局)
- **平板端**: 768px - 1200px (单列布局)
- **移动端**: < 768px (隐藏侧边栏，简化布局)

## 🔌 事件钩子

```javascript
// 组件内部可扩展的事件
this.$emit('processing-start', { files: this.uploadedFiles })
this.$emit('processing-complete', { statistics: this.statistics })
this.$emit('file-uploaded', { file: fileData })
this.$emit('mode-changed', { mode: this.processingMode })
```

## 💡 使用示例

### 基础使用

```vue
<template>
  <div id="app">
    <video-deduplication />
  </div>
</template>

<script>
import VideoDeduplication from './components/VideoDeduplication/VideoDeduplication.vue'

export default {
  components: {
    VideoDeduplication
  }
}
</script>
```

### 带回调的使用

```vue
<template>
  <div id="app">
    <video-deduplication 
      @processing-complete="onProcessingComplete"
      @file-uploaded="onFileUploaded"
    />
  </div>
</template>

<script>
import VideoDeduplication from './components/VideoDeduplication/VideoDeduplication.vue'

export default {
  components: {
    VideoDeduplication
  },
  methods: {
    onProcessingComplete(data) {
      console.log('Processing complete:', data)
    },
    onFileUploaded(file) {
      console.log('File uploaded:', file)
    }
  }
}
</script>
```

## 🔄 后端API集成

组件中的处理方法可以替换为实际的API调用:

```javascript
// 在 startProcessing 方法中集成API
async startProcessing() {
  if (this.uploadedFiles.length === 0) {
    this.$message.warning('Please upload videos first')
    return
  }
  
  this.processing = true
  this.processPercent = 0
  
  try {
    // 准备FormData
    const formData = new FormData()
    this.uploadedFiles.forEach(file => {
      formData.append('files', file.file)
    })
    formData.append('mode', this.processingMode)
    formData.append('options', JSON.stringify({
      basicOptions: this.basicOptions,
      selectedEffect: this.selectedEffect,
      selectedZoom: this.selectedZoom
    }))
    
    // 调用API
    const response = await axios.post('/api/video-deduplication', formData, {
      onUploadProgress: (progressEvent) => {
        this.processPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    
    // 处理响应
    this.showResults(response.data)
    
  } catch (error) {
    this.$message.error('Processing failed: ' + error.message)
  } finally {
    this.processing = false
  }
}
```

## 🐛 常见问题

### 1. Element UI样式未生效
确保在main.js中正确引入Element UI的CSS:
```javascript
import 'element-ui/lib/theme-chalk/index.css'
```

### 2. SCSS编译错误
确保安装正确版本的sass-loader:
```bash
npm install sass-loader@10.0.0 -D
```

### 3. 文件上传大小限制
可以在组件中修改限制:
```javascript
// 修改最大文件大小 (默认500MB)
if (file.raw && file.raw.size > 1024 * 1024 * 1024) { // 1GB
  this.$message.error(`File exceeds size limit`)
  return false
}
```

### 4. 自定义文件类型支持
在组件的accept属性中添加新的文件类型:
```vue
accept=".mp4,.mov,.m4v,.3gp,.avi,.mkv,.webm,.flv,.wmv"
```

## 📝 更新日志

### v1.0.0 (2024-01-26)
- ✅ 初始版本发布
- ✅ 完整实现HTML版本的所有功能
- ✅ Smart Mode 和 Custom Mode 双模式支持
- ✅ 10种基础去重选项
- ✅ 9种特殊效果
- ✅ 3种缩放模式
- ✅ 实时预览和对比功能
- ✅ 处理进度和统计显示
- ✅ 响应式设计支持

## 🤝 技术支持

如有问题或需要帮助，请联系技术团队或查看项目文档。

## 📄 许可证

MIT License - 可自由使用和修改