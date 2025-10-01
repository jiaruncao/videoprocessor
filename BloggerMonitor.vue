<template>
  <div class="blogger-monitor-page">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">MediaEnhance Pro</div>
      <nav>
        <ul class="nav-menu">
          <li 
            v-for="(item, index) in menuItems" 
            :key="index"
            :class="['nav-item', { active: item.active }]"
            @click="handleMenuClick(index)"
          >
            <span>{{ item.icon }}</span> {{ item.label }}
          </li>
        </ul>
      </nav>
      <div class="user-section">
        <div class="nav-item user-account">
          <span>👤</span>
          <div class="user-info">
            <div class="user-name">User Account</div>
            <div class="user-plan">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>Blogger Monitor & Video Downloader</h1>
          <p>Track your favorite content creators across multiple platforms and download their videos without watermarks. Stay updated with real-time notifications when new content is posted.</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statsData" :key="stat.id">
            <span class="stat-icon">{{ stat.icon }}</span>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <!-- 平台监控区域 -->
        <div class="platform-sections">
          <div 
            v-for="platform in platforms" 
            :key="platform.id"
            class="platform-monitor-container"
          >
            <div class="platform-header">
              <span class="platform-icon-large">{{ platform.icon }}</span>
              <span class="platform-name">{{ platform.name }}</span>
            </div>
            
            <div class="blogger-input-area">
              <div class="input-with-button">
                <el-input
                  v-model="platform.inputValue"
                  :placeholder="platform.placeholder"
                  class="custom-input"
                  @keyup.enter="addBlogger(platform.id)"
                />
                <el-button 
                  type="primary" 
                  class="add-btn"
                  @click="addBlogger(platform.id)"
                >
                  Add
                </el-button>
              </div>
              <div class="input-hint">{{ platform.hint }}</div>
            </div>

            <div class="monitored-list">
              <div 
                v-for="(blogger, index) in platform.bloggers" 
                :key="index"
                class="monitored-item"
              >
                <div class="monitored-info">
                  <span class="monitored-name">{{ blogger.name }}</span>
                </div>
                <div :class="['monitored-status', `status-${blogger.status}`]">
                  <span class="status-dot"></span>
                  <span>{{ blogger.statusText }}</span>
                </div>
                <el-button 
                  type="danger" 
                  size="mini" 
                  class="remove-btn"
                  @click="removeBlogger(platform.id, index)"
                >
                  Remove
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 更新日志区域 -->
        <div class="updates-log-section">
          <div class="log-header">
            <h2 class="log-title">📝 Recent Updates Log</h2>
            <div class="log-filter">
              <button 
                v-for="filter in logFilters" 
                :key="filter.value"
                :class="['filter-btn', { active: currentFilter === filter.value }]"
                @click="filterLog(filter.value)"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
          
          <div class="log-container">
            <div 
              v-for="(log, index) in filteredLogs" 
              :key="index"
              class="log-item"
              :data-platform="log.platform"
            >
              <div class="log-time">{{ log.time }}</div>
              <div class="log-content">
                <span class="log-platform-badge">{{ log.platformIcon }} {{ log.platformName }}</span>
                <div class="log-message">
                  <strong>{{ log.blogger }}</strong> {{ log.message }}
                </div>
                <a href="#" class="log-link" @click.prevent="viewContent(log)">
                  {{ log.linkText }} →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频下载区域 -->
        <div class="download-section">
          <div class="download-header">
            <h2 class="download-title">Video Downloader</h2>
            <p class="download-subtitle">Download videos without watermarks from your favorite platforms</p>
          </div>
          
          <div class="download-input-wrapper">
            <div class="url-input-group">
              <el-input
                v-model="videoUrl"
                placeholder="Paste video URL here (TikTok, Douyin, Instagram, YouTube, etc.)"
                class="url-input"
                @keyup.enter="downloadVideo"
              />
              <el-button 
                type="primary" 
                class="download-btn"
                :loading="downloading"
                @click="downloadVideo"
              >
                <span v-if="!downloading">⬇️ Download</span>
                <span v-else>Processing...</span>
              </el-button>
            </div>
            
            <!-- 支持的平台 -->
            <div class="supported-platforms">
              <div 
                v-for="platform in supportedPlatforms" 
                :key="platform.id"
                class="platform-tag"
              >
                <span class="platform-tag-icon">{{ platform.icon }}</span>
                <span>{{ platform.name }}</span>
              </div>
            </div>
          </div>

          <!-- 处理状态 -->
          <div v-if="downloading" class="process-status">
            <div class="process-icon">⚙️</div>
            <div class="process-text">Processing video... Please wait</div>
          </div>

          <!-- 成功消息 -->
          <transition name="slide-down">
            <div v-if="showSuccessMessage" class="success-message show">
              <span>✅</span> Video downloaded successfully without watermark!
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'BloggerMonitor',
  
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '📡', label: 'Blogger Monitor', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 统计数据
      statsData: [
        { id: 'bloggers', icon: '👥', value: 8, label: 'Monitored Bloggers' },
        { id: 'updates', icon: '🔔', value: 12, label: 'New Updates Today' },
        { id: 'platforms', icon: '📱', value: 4, label: 'Active Platforms' }
      ],
      
      // 平台数据
      platforms: [
        {
          id: 'tiktok',
          name: 'TikTok',
          icon: '🎵',
          inputValue: '',
          placeholder: 'Enter @username or profile link',
          hint: 'Example: @charlidamelio or https://www.tiktok.com/@username',
          bloggers: [
            { name: '@trendy_creator', status: 'active', statusText: 'Active' },
            { name: '@fashionista', status: 'checking', statusText: 'Checking' }
          ]
        },
        {
          id: 'douyin',
          name: 'Douyin',
          icon: '🎭',
          inputValue: '',
          placeholder: 'Enter username or profile link',
          hint: 'Example: 美食达人 or Douyin profile URL',
          bloggers: [
            { name: '美食达人', status: 'active', statusText: 'Active' }
          ]
        },
        {
          id: 'instagram',
          name: 'Instagram',
          icon: '📷',
          inputValue: '',
          placeholder: 'Enter @username or profile link',
          hint: 'Example: @cristiano or https://www.instagram.com/username',
          bloggers: [
            { name: '@photography_pro', status: 'active', statusText: 'Active' },
            { name: '@travel_diary', status: 'active', statusText: 'Active' }
          ]
        },
        {
          id: 'youtube',
          name: 'YouTube',
          icon: '📺',
          inputValue: '',
          placeholder: 'Enter @channel or channel link',
          hint: 'Example: @MrBeast or https://www.youtube.com/@channel',
          bloggers: [
            { name: 'TechReviews', status: 'active', statusText: 'Active' },
            { name: 'GamingChannel', status: 'active', statusText: 'Active' }
          ]
        }
      ],
      
      // 日志过滤器
      logFilters: [
        { value: 'all', label: 'All' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'douyin', label: 'Douyin' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube', label: 'YouTube' }
      ],
      currentFilter: 'all',
      
      // 日志数据
      logs: [
        {
          time: '10:32 AM',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformName: 'TikTok',
          blogger: '@trendy_creator',
          message: 'posted a new video: "Morning Routine 2025 ✨"',
          linkText: 'View Video'
        },
        {
          time: '09:45 AM',
          platform: 'youtube',
          platformIcon: '📺',
          platformName: 'YouTube',
          blogger: 'TechReviews',
          message: 'uploaded: "iPhone 16 Pro Max Unboxing & First Impressions"',
          linkText: 'View Video'
        },
        {
          time: '09:20 AM',
          platform: 'instagram',
          platformIcon: '📷',
          platformName: 'Instagram',
          blogger: '@photography_pro',
          message: 'shared a new Reel: "Golden Hour Photography Tips"',
          linkText: 'View Reel'
        },
        {
          time: '08:55 AM',
          platform: 'douyin',
          platformIcon: '🎭',
          platformName: 'Douyin',
          blogger: '美食达人',
          message: 'posted: "家常菜教程 - 红烧肉"',
          linkText: 'View Video'
        },
        {
          time: '08:30 AM',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformName: 'TikTok',
          blogger: '@fashionista',
          message: 'went live: "Fashion Q&A Session"',
          linkText: 'Watch Recording'
        },
        {
          time: 'Yesterday',
          platform: 'youtube',
          platformIcon: '📺',
          platformName: 'YouTube',
          blogger: 'GamingChannel',
          message: 'premiered: "Cyberpunk 2077 - Full Walkthrough Part 1"',
          linkText: 'View Video'
        }
      ],
      
      // 支持的平台
      supportedPlatforms: [
        { id: 'tiktok', icon: '🎵', name: 'TikTok' },
        { id: 'douyin', icon: '🎭', name: 'Douyin' },
        { id: 'instagram', icon: '📷', name: 'Instagram Reels' },
        { id: 'youtube', icon: '📺', name: 'YouTube Shorts' },
        { id: 'twitter', icon: '📱', name: 'Twitter/X' },
        { id: 'snapchat', icon: '👻', name: 'Snapchat' }
      ],
      
      // 视频下载
      videoUrl: '',
      downloading: false,
      showSuccessMessage: false,
      
      // 自动更新定时器
      updateTimer: null
    }
  },
  
  computed: {
    // 过滤后的日志
    filteredLogs() {
      if (this.currentFilter === 'all') {
        return this.logs
      }
      return this.logs.filter(log => log.platform === this.currentFilter)
    }
  },
  
  mounted() {
    // 启动自动更新检查
    this.startAutoUpdate()
  },
  
  beforeDestroy() {
    // 清理定时器
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  
  methods: {
    // 处理菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 添加博主
    addBlogger(platformId) {
      const platform = this.platforms.find(p => p.id === platformId)
      if (!platform.inputValue.trim()) {
        this.$message.warning('Please enter a blogger ID or link')
        return
      }
      
      // 创建新博主
      const newBlogger = {
        name: platform.inputValue.trim(),
        status: 'checking',
        statusText: 'Checking'
      }
      
      // 添加到列表
      platform.bloggers.push(newBlogger)
      
      // 模拟状态更新
      setTimeout(() => {
        newBlogger.status = 'active'
        newBlogger.statusText = 'Active'
        
        // 添加日志
        this.addLogEntry(platformId, newBlogger.name)
      }, 2000)
      
      // 更新统计
      this.updateStats('bloggers', 1)
      
      // 清空输入
      platform.inputValue = ''
      
      // 显示成功消息
      this.$message.success('Blogger added successfully!')
    },
    
    // 移除博主
    removeBlogger(platformId, index) {
      const platform = this.platforms.find(p => p.id === platformId)
      platform.bloggers.splice(index, 1)
      
      // 更新统计
      this.updateStats('bloggers', -1)
      
      this.$message.info('Blogger removed')
    },
    
    // 添加日志条目
    addLogEntry(platformId, bloggerName) {
      const now = new Date()
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      
      const platformInfo = {
        tiktok: { icon: '🎵', name: 'TikTok' },
        douyin: { icon: '🎭', name: 'Douyin' },
        instagram: { icon: '📷', name: 'Instagram' },
        youtube: { icon: '📺', name: 'YouTube' }
      }
      
      const platform = platformInfo[platformId]
      
      const newLog = {
        time,
        platform: platformId,
        platformIcon: platform.icon,
        platformName: platform.name,
        blogger: bloggerName,
        message: 'has been added to monitoring list',
        linkText: 'Check Profile'
      }
      
      // 添加到日志开头
      this.logs.unshift(newLog)
      
      // 更新统计
      this.updateStats('updates', 1)
    },
    
    // 过滤日志
    filterLog(filter) {
      this.currentFilter = filter
    },
    
    // 查看内容
    viewContent(log) {
      this.$message.info(`Opening ${log.blogger}'s content...`)
      // 这里可以实现实际的跳转逻辑
    },
    
    // 下载视频
    async downloadVideo() {
      if (!this.videoUrl.trim()) {
        this.$message.warning('Please enter a video URL')
        return
      }
      
      if (!this.videoUrl.startsWith('http')) {
        this.$message.error('Please enter a valid URL')
        return
      }
      
      this.downloading = true
      
      // 模拟下载过程
      setTimeout(() => {
        this.downloading = false
        this.showSuccessMessage = true
        
        // 清空输入
        this.videoUrl = ''
        
        // 3秒后隐藏成功消息
        setTimeout(() => {
          this.showSuccessMessage = false
        }, 3000)
        
        console.log('Video downloaded successfully')
      }, 2500)
    },
    
    // 更新统计
    updateStats(type, change) {
      const stat = this.statsData.find(s => s.id === type)
      if (stat) {
        stat.value += change
      }
    },
    
    // 启动自动更新
    startAutoUpdate() {
      // 每30秒检查一次更新
      this.updateTimer = setInterval(() => {
        this.checkForUpdates()
      }, 30000)
    },
    
    // 检查更新（模拟）
    checkForUpdates() {
      if (Math.random() > 0.5) {
        const platforms = ['tiktok', 'douyin', 'instagram', 'youtube']
        const bloggers = ['@trendy_creator', '美食达人', '@photography_pro', 'TechReviews']
        const messages = [
          'posted a new video',
          'went live',
          'shared a new reel',
          'uploaded new content'
        ]
        
        const platform = platforms[Math.floor(Math.random() * platforms.length)]
        const blogger = bloggers[Math.floor(Math.random() * bloggers.length)]
        const message = messages[Math.floor(Math.random() * messages.length)]
        
        // 添加新的日志
        const now = new Date()
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        
        const platformInfo = {
          tiktok: { icon: '🎵', name: 'TikTok' },
          douyin: { icon: '🎭', name: 'Douyin' },
          instagram: { icon: '📷', name: 'Instagram' },
          youtube: { icon: '📺', name: 'YouTube' }
        }
        
        const platformData = platformInfo[platform]
        
        this.logs.unshift({
          time,
          platform,
          platformIcon: platformData.icon,
          platformName: platformData.name,
          blogger,
          message: `${message}: "New Content"`,
          linkText: 'View Content'
        })
        
        // 更新统计
        this.updateStats('updates', 1)
        
        // 显示通知
        this.$notify({
          title: 'New Update',
          message: `${blogger} ${message}`,
          type: 'info',
          duration: 3000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './BloggerMonitor.scss';
</style>
