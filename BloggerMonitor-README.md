# Blogger Monitor Vue2 + Element UI 组件说明文档

## 📋 项目概述

这是一个基于 Vue2 + Element UI 开发的博主监控和视频下载组件，完全复刻了原始 HTML 页面的所有功能和样式。该组件提供了多平台博主监控、更新日志追踪和无水印视频下载功能。

## 🎯 主要功能

### 1. 多平台博主监控
- **支持平台**：TikTok、抖音（Douyin）、Instagram、YouTube
- **独立管理**：每个平台有独立的输入框和监控列表
- **实时状态**：显示博主的监控状态（Active、Checking）
- **快速操作**：支持添加和移除博主

### 2. 更新日志系统
- **实时日志**：记录所有博主的更新信息
- **平台过滤**：可按平台筛选日志（All、TikTok、Douyin、Instagram、YouTube）
- **时间戳**：显示更新的具体时间
- **快速访问**：每条日志都有查看链接

### 3. 视频下载功能
- **无水印下载**：支持从多个平台下载无水印视频
- **支持平台**：TikTok、抖音、Instagram、YouTube、Twitter/X、Snapchat
- **处理状态**：显示下载进度和成功提示
- **URL验证**：自动验证输入的URL格式

### 4. 统计面板
- **监控博主数量**：实时统计监控的博主总数
- **今日更新数**：显示今天收到的更新数量
- **活跃平台数**：统计当前活跃的平台数量

## 📦 安装依赖

```bash
# 安装 Vue2
npm install vue@2.6.14

# 安装 Element UI
npm install element-ui@2.15.14

# 安装 Sass 支持
npm install sass sass-loader@10.1.1 -D
```

## 🚀 使用方法

### 1. 在主文件中引入 Element UI

```javascript
// main.js
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

### 2. 在页面中使用组件

```vue
<template>
  <div id="app">
    <blogger-monitor />
  </div>
</template>

<script>
import BloggerMonitor from '@/components/BloggerMonitor.vue'

export default {
  name: 'App',
  components: {
    BloggerMonitor
  }
}
</script>
```

### 3. 确保样式文件正确引入

将 `BloggerMonitor.scss` 文件放在与 `BloggerMonitor.vue` 相同的目录下，组件会自动引入样式。

## 📁 文件结构

```
src/
├── components/
│   ├── BloggerMonitor.vue      # 主组件文件
│   └── BloggerMonitor.scss     # 样式文件
├── main.js                      # 主入口文件
└── App.vue                      # 根组件
```

## 🎨 组件结构说明

### 数据结构 (data)

```javascript
{
  // 菜单项配置
  menuItems: Array,
  
  // 统计数据
  statsData: Array,
  
  // 平台配置和数据
  platforms: [
    {
      id: String,          // 平台ID
      name: String,        // 平台名称
      icon: String,        // 平台图标
      inputValue: String,  // 输入框值
      placeholder: String, // 输入框提示
      hint: String,        // 输入提示
      bloggers: Array      // 博主列表
    }
  ],
  
  // 日志数据
  logs: Array,
  
  // 其他状态
  currentFilter: String,    // 当前日志过滤器
  videoUrl: String,         // 视频URL输入
  downloading: Boolean,     // 下载状态
  showSuccessMessage: Boolean // 成功消息显示状态
}
```

### 主要方法 (methods)

| 方法名 | 功能描述 | 参数 |
|--------|---------|------|
| `addBlogger(platformId)` | 添加博主到指定平台 | platformId: 平台ID |
| `removeBlogger(platformId, index)` | 移除指定博主 | platformId: 平台ID, index: 博主索引 |
| `filterLog(filter)` | 过滤日志显示 | filter: 过滤条件 |
| `downloadVideo()` | 下载视频 | 无 |
| `checkForUpdates()` | 检查博主更新（自动） | 无 |
| `updateStats(type, change)` | 更新统计数据 | type: 统计类型, change: 变化值 |

## 🔧 配置选项

### 平台配置

可以通过修改 `platforms` 数组来添加或修改平台：

```javascript
platforms: [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    placeholder: 'Enter @username or profile link',
    hint: 'Example: @charlidamelio',
    bloggers: []
  }
  // 添加更多平台...
]
```

### 自动更新间隔

默认每30秒检查一次更新，可以在 `startAutoUpdate` 方法中修改：

```javascript
startAutoUpdate() {
  this.updateTimer = setInterval(() => {
    this.checkForUpdates()
  }, 30000) // 修改这个值来改变检查间隔（毫秒）
}
```

## 🎯 功能特性

### 1. 实时通知
组件使用 Element UI 的 `$notify` 方法显示新更新通知：

```javascript
this.$notify({
  title: 'New Update',
  message: `${blogger} posted new content`,
  type: 'info',
  duration: 3000
})
```

### 2. 状态管理
- **Checking**：正在检查博主状态（黄色）
- **Active**：博主活跃状态（绿色）

### 3. 数据持久化（待实现）
当前版本数据存储在组件内存中，可以扩展以下功能：
- localStorage 本地存储
- Vuex 状态管理
- 后端API集成

## 📱 响应式设计

组件支持以下断点的响应式布局：

- **桌面端** (>1200px)：双列平台布局
- **平板端** (768px-1200px)：单列平台布局
- **移动端** (<768px)：
  - 隐藏侧边栏
  - 单列统计卡片
  - 垂直堆叠的输入和按钮

## 🔄 API 集成指南

### 添加博主 API

```javascript
async addBlogger(platformId) {
  try {
    const response = await axios.post('/api/bloggers', {
      platform: platformId,
      username: this.platforms.find(p => p.id === platformId).inputValue
    })
    // 处理响应
  } catch (error) {
    this.$message.error('Failed to add blogger')
  }
}
```

### 下载视频 API

```javascript
async downloadVideo() {
  try {
    const response = await axios.post('/api/download', {
      url: this.videoUrl
    })
    // 处理下载链接
    window.open(response.data.downloadUrl)
  } catch (error) {
    this.$message.error('Download failed')
  }
}
```

## ⚠️ 注意事项

1. **Element UI 版本**：确保使用 Element UI 2.x 版本，与 Vue2 兼容
2. **Sass 版本**：使用 sass-loader@10.x 版本以兼容 Vue2
3. **字符编码**：确保文件使用 UTF-8 编码以正确显示 emoji 图标
4. **性能优化**：监控列表较长时会自动显示滚动条，避免页面过长
5. **内存管理**：组件销毁时会自动清理定时器，避免内存泄漏

## 🛠 扩展建议

### 1. 数据持久化
```javascript
// 使用 localStorage 保存数据
mounted() {
  const savedData = localStorage.getItem('bloggerMonitorData')
  if (savedData) {
    Object.assign(this.$data, JSON.parse(savedData))
  }
},

watch: {
  platforms: {
    deep: true,
    handler() {
      this.saveToLocalStorage()
    }
  }
},

methods: {
  saveToLocalStorage() {
    localStorage.setItem('bloggerMonitorData', JSON.stringify({
      platforms: this.platforms,
      logs: this.logs
    }))
  }
}
```

### 2. 添加 Vuex 状态管理
```javascript
// store/modules/bloggerMonitor.js
export default {
  state: {
    bloggers: [],
    logs: [],
    stats: {}
  },
  mutations: {
    ADD_BLOGGER(state, blogger) {
      state.bloggers.push(blogger)
    },
    ADD_LOG(state, log) {
      state.logs.unshift(log)
    }
  },
  actions: {
    async fetchBloggers({ commit }) {
      // API 调用
    }
  }
}
```

### 3. 实时更新 WebSocket
```javascript
mounted() {
  this.connectWebSocket()
},

methods: {
  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080/updates')
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      this.addLogEntry(update.platform, update.blogger)
    }
  }
},

beforeDestroy() {
  if (this.ws) {
    this.ws.close()
  }
}
```

## 📞 技术支持

如有问题或建议，请通过以下方式联系：
- Issue: 在项目中提交 issue
- Email: support@example.com

## 📄 许可证

MIT License - 可自由使用和修改

---

## 🚩 更新日志

### v1.0.0 (2024-01-25)
- 初始版本发布
- 实现多平台博主监控
- 添加更新日志功能
- 实现视频下载功能
- 完整响应式设计

### 待实现功能
- [ ] 批量导入博主
- [ ] 数据导出功能
- [ ] 更详细的统计图表
- [ ] 深色模式支持
- [ ] 多语言支持
- [ ] 推送通知设置
- [ ] 历史记录查询
- [ ] 视频批量下载