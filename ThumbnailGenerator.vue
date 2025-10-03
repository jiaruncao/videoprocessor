<!-- ThumbnailGenerator.vue -->
<template>
  <div class="thumbnail-generator-page">
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
            <span>{{ item.icon }}</span>
            {{ item.label }}
          </li>
        </ul>
      </nav>
      <div class="user-info">
        <div class="nav-item user-account">
          <span>👤</span>
          <div style="flex: 1;">
            <div style="color: white; font-size: 14px; font-weight: 600;">User Account</div>
            <div style="color: #8b92a5; font-size: 12px; margin-top: 2px;">Free Plan</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>Thumbnail Generator</h1>
          <p>Create eye-catching thumbnails for your videos and images with AI-powered text overlays, perfect ratios, and emotional expressions to maximize engagement.</p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <div class="section-title">Upload Media</div>
              <div 
                :class="['upload-area', { 
                  'has-file': hasFile, 
                  'dragover': isDragover 
                }]"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @drop.prevent="handleDrop"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">Drop your image or video here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-upload
                    ref="upload"
                    class="upload-demo"
                    :action="'#'"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleFileChange"
                    accept=".mp4,.mov,.m4v,.avi,.jpg,.jpeg,.png"
                  >
                    <el-button class="upload-btn-small">Choose Files</el-button>
                  </el-upload>
                </div>

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <img 
                      v-if="fileType === 'image'" 
                      :src="previewUrl" 
                      class="preview-image"
                      alt="Preview"
                    >
                    <video 
                      v-else-if="fileType === 'video'"
                      ref="previewVideo"
                      :src="previewUrl"
                      class="preview-video"
                      controls
                    ></video>
                  </div>
                  <div class="file-info">
                    <span>{{ fileName }}</span>
                    <el-button 
                      type="danger" 
                      size="mini" 
                      @click="removeFile"
                    >✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                Supported: .mp4, .mov, .m4v, .avi, .jpg, .jpeg, .png (Max 100MB)
              </div>
              
              <!-- 视频帧选择器 -->
              <div 
                :class="['frame-selector', { 
                  'active': showFrameSelector,
                  'confirmed': frameConfirmed 
                }]"
              >
                <div class="frame-label">
                  <span>Select Video Frame for Thumbnail</span>
                  <span 
                    v-if="frameConfirmed" 
                    class="frame-selected-badge"
                  >
                    ✓ Frame Selected
                  </span>
                </div>
                
                <!-- 视频预览 -->
                <div class="frame-preview-container">
                  <video 
                    ref="framePreviewVideo"
                    class="frame-preview-video"
                    :src="previewUrl"
                    @timeupdate="updateTimelineProgress"
                    @loadedmetadata="handleVideoLoaded"
                    @ended="handleVideoEnded"
                    muted
                  ></video>
                </div>
                
                <!-- 时间轴控制 -->
                <div class="timeline-controls">
                  <el-button 
                    circle 
                    size="small"
                    class="frame-play-btn"
                    @click="toggleFramePlay"
                  >
                    <i :class="isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
                  </el-button>
                  <span class="timeline-time current">{{ currentFrameTime }}</span>
                  <span style="color: #64748b; font-size: 13px;">/</span>
                  <span class="timeline-time">{{ totalFrameTime }}</span>
                </div>
                
                <!-- 缩略图时间轴 -->
                <div class="thumbnail-timeline">
                  <div 
                    class="timeline-track"
                    @click="seekToFrame($event)"
                  >
                    <div class="timeline-frames">
                      <div
                        v-for="(frame, index) in timelineFrames"
                        :key="index"
                        :class="['timeline-frame', { selected: selectedFrameIndex === index }]"
                        :style="{ backgroundImage: `url(${frame.thumbnail})` }"
                        @click.stop="selectFrame(frame.time, index)"
                      ></div>
                    </div>
                    <div 
                      class="timeline-indicator"
                      :style="{ left: timelineProgress + '%' }"
                    ></div>
                  </div>
                </div>
                
                <!-- 选择按钮 -->
                <el-button
                  :type="frameConfirmed ? 'warning' : 'primary'"
                  class="select-frame-btn"
                  @click="confirmFrameSelection"
                >
                  <span v-if="!frameConfirmed">✓ Use This Frame for Thumbnail</span>
                  <span v-else>🔄 Reselect Frame</span>
                </el-button>
                
                <!-- 确认提示 -->
                <div v-if="frameConfirmed" class="frame-confirmation">
                  ✓ Frame successfully selected for thumbnail
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 缩略图设置 -->
            <div class="settings-container">
              <div class="section-title">Thumbnail Settings</div>
              
              <!-- 比例选择 -->
              <div class="setting-group">
                <div class="setting-label">Select Thumbnail Ratio</div>
                <el-radio-group 
                  v-model="thumbnailRatio" 
                  @change="handleRatioChange"
                  class="ratio-selector"
                >
                  <el-radio label="16:9" class="ratio-option">
                    <div class="ratio-content">
                      <div class="ratio-preview ratio-16-9">16:9</div>
                      <span class="ratio-label">YouTube</span>
                    </div>
                  </el-radio>
                  <el-radio label="9:16" class="ratio-option">
                    <div class="ratio-content">
                      <div class="ratio-preview ratio-9-16">9:16</div>
                      <span class="ratio-label">Shorts</span>
                    </div>
                  </el-radio>
                  <el-radio label="4:3" class="ratio-option">
                    <div class="ratio-content">
                      <div class="ratio-preview ratio-4-3">4:3</div>
                      <span class="ratio-label">4:3</span>
                    </div>
                  </el-radio>
                  <el-radio label="3:4" class="ratio-option">
                    <div class="ratio-content">
                      <div class="ratio-preview ratio-3-4">3:4</div>
                      <span class="ratio-label">Instagram</span>
                    </div>
                  </el-radio>
                </el-radio-group>
              </div>

              <!-- 文字输入 -->
              <div class="text-input-container">
                <div class="setting-label">Enter thumbnail text</div>
                <el-input
                  v-model="thumbnailText"
                  type="textarea"
                  :rows="4"
                  placeholder="Make you fit and healthy!!"
                  :maxlength="150"
                  show-word-limit
                  class="text-input"
                ></el-input>
              </div>

              <!-- 情感选择 -->
              <div class="emotion-selector">
                <div class="setting-label">Emotion</div>
                <el-radio-group 
                  v-model="selectedEmotion"
                  @change="handleEmotionChange"
                  class="emotion-options"
                >
                  <el-radio 
                    v-for="emotion in emotions"
                    :key="emotion.value"
                    :label="emotion.value"
                    class="emotion-option"
                  >
                    <div class="emotion-content">
                      <div 
                        class="emotion-preview"
                        :style="{ background: emotion.color }"
                      >
                        <span>{{ emotion.emoji }}</span>
                      </div>
                      <span class="emotion-label">{{ emotion.label }}</span>
                    </div>
                  </el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                size="large"
                class="action-btn btn-generate"
                :loading="processing"
                :disabled="!canGenerate"
                @click="startGenerating"
              >
                <i class="el-icon-brush"></i>
                {{ processing ? 'Generating...' : 'Generate Thumbnails' }}
              </el-button>
              
              <el-button
                v-else
                type="success"
                size="large"
                class="action-btn btn-download"
                @click="downloadAllThumbnails"
              >
                <i class="el-icon-download"></i>
                Download All Thumbnails
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Generating thumbnails...</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress 
                  :percentage="processPercent" 
                  :stroke-width="8"
                ></el-progress>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果展示区域 -->
        <div class="result-section">
          <div class="result-header">
            <h2 class="result-title">Generated Thumbnails</h2>
            <p class="result-subtitle">
              Generated on <span>{{ generatedDate }}</span>, 
              will expire in <span>{{ expireDays }}</span> day(s)
            </p>
          </div>
          
          <!-- 缩略图网格 -->
          <div class="thumbnails-container">
            <div 
              :class="[
                'thumbnails-grid', 
                `ratio-${thumbnailRatio.replace(':', '-')}`
              ]"
            >
              <!-- 空状态 -->
              <div v-if="thumbnails.length === 0" class="empty-state">
                <div style="font-size: 48px; margin-bottom: 15px;">🎨</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                  No thumbnails yet
                </div>
                <div style="color: #64748b;">
                  Upload media and click "Generate Thumbnails" to see results here
                </div>
              </div>
              
              <!-- 缩略图列表 -->
              <div
                v-for="(thumbnail, index) in thumbnails"
                :key="index"
                class="thumbnail-item"
                :style="{ aspectRatio: getAspectRatio(thumbnailRatio) }"
              >
                <img 
                  :src="thumbnail.url" 
                  class="thumbnail-image"
                  :alt="`Thumbnail ${index + 1}`"
                >
                <div class="thumbnail-overlay"></div>
                <div class="thumbnail-actions">
                  <el-button 
                    size="mini" 
                    @click="downloadSingle(index)"
                    title="Download"
                  >⬇️</el-button>
                  <el-button 
                    size="mini"
                    @click="editThumbnail(index)"
                    title="Edit"
                  >✏️</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div v-if="thumbnails.length > 0" class="result-actions">
            <el-button
              type="success"
              @click="downloadAllThumbnails"
            >
              <i class="el-icon-folder"></i> Download All
            </el-button>
            <el-button
              @click="regenerateThumbnails"
            >
              <i class="el-icon-refresh"></i> Regenerate New Set
            </el-button>
            <el-button
              type="warning"
              @click="showHistory = true"
            >
              <i class="el-icon-time"></i> View History
            </el-button>
          </div>
        </div>
        
        <!-- 历史记录对话框 -->
        <el-dialog
          title="Generation History"
          :visible.sync="showHistory"
          width="70%"
          class="history-modal"
        >
          <div class="history-list">
            <div v-if="generationHistory.length === 0" class="empty-history">
              No history yet
            </div>
            <div 
              v-for="(group, date) in groupedHistory"
              :key="date"
              class="history-group"
            >
              <div class="history-date">{{ date }}</div>
              <div class="history-thumbnails">
                <div
                  v-for="(item, index) in group"
                  :key="index"
                  class="history-thumb"
                  @click="loadFromHistory(item)"
                >
                  <img :src="item.thumbnails[0]?.url" alt="History">
                </div>
              </div>
            </div>
          </div>
        </el-dialog>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'ThumbnailGenerator',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🖼️', label: 'Thumbnail Generator', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 文件上传相关
      currentFile: null,
      filePreview: false,
      fileName: '',
      fileType: '',
      previewUrl: '',
      hasFile: false,
      uploadSuccess: false,
      isDragover: false,
      
      // 视频帧选择相关
      showFrameSelector: false,
      frameConfirmed: false,
      isPlaying: false,
      selectedFrame: null,
      selectedFrameIndex: -1,
      currentFrameTime: '00:00:00',
      totalFrameTime: '00:00:00',
      timelineProgress: 0,
      timelineFrames: [],
      animationFrameId: null,
      
      // 设置相关
      thumbnailRatio: '16:9',
      thumbnailText: '',
      selectedEmotion: 'none',
      
      // 情感选项
      emotions: [
        { value: 'none', label: 'None', emoji: '😐', color: '#f0f0f0' },
        { value: 'happy', label: 'Happy', emoji: '😊', color: '#ffe766' },
        { value: 'excited', label: 'Excited', emoji: '🤩', color: '#ff6b6b' },
        { value: 'surprised', label: 'Surprised', emoji: '😲', color: '#a8e6cf' },
        { value: 'anxious', label: 'Anxious', emoji: '😰', color: '#b8d4f0' },
        { value: 'curious', label: 'Curious', emoji: '🤔', color: '#dda8ff' },
        { value: 'angry', label: 'Angry', emoji: '😠', color: '#ff9999' },
        { value: 'sad', label: 'Sad', emoji: '😢', color: '#99ccff' },
        { value: 'cool', label: 'Cool', emoji: '😎', color: '#66d9ef' },
        { value: 'love', label: 'Love', emoji: '😍', color: '#ffb3d9' },
        { value: 'mischievous', label: 'Playful', emoji: '😏', color: '#ffb366' }
      ],
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      
      // 生成结果
      thumbnails: [],
      generatedDate: '--/--/----',
      expireDays: 30,
      
      // 历史记录
      showHistory: false,
      generationHistory: []
    }
  },
  
  computed: {
    // 是否可以生成
    canGenerate() {
      return this.hasFile && 
             this.thumbnailText.trim() && 
             (this.fileType === 'image' || this.frameConfirmed)
    },
    
    // 分组历史记录
    groupedHistory() {
      const grouped = {}
      this.generationHistory.forEach(item => {
        const date = new Date(item.date).toLocaleDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(item)
      })
      return grouped
    }
  },
  
  mounted() {
    // 从localStorage加载历史记录
    this.loadHistory()
  },
  
  methods: {
    // 菜单点击处理
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 文件拖拽处理
    handleDragover(e) {
      if (!this.hasFile) {
        this.isDragover = true
      }
    },
    
    handleDragleave() {
      this.isDragover = false
    },
    
    handleDrop(e) {
      this.isDragover = false
      if (!this.hasFile && e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files[0])
      }
    },
    
    // 文件选择处理
    handleFileChange(file) {
      if (file.raw) {
        this.handleFiles(file.raw)
      }
    },
    
    // 处理文件
    handleFiles(file) {
      // 检查文件大小
      if (file.size > 100 * 1024 * 1024) {
        this.$message.error('File size exceeds 100MB limit')
        return
      }
      
      // 保存文件信息
      this.currentFile = file
      this.fileName = file.name
      this.fileType = file.type.startsWith('video') ? 'video' : 'image'
      
      // 读取文件预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
        this.hasFile = true
        
        // 延迟显示成功标记
        setTimeout(() => {
          this.uploadSuccess = true
          if (this.fileType === 'video') {
            this.showFrameSelector = true
            this.$nextTick(() => {
              this.setupFrameSelector()
            })
          }
        }, 500)
      }
      reader.readAsDataURL(file)
    },
    
    // 设置视频帧选择器
    setupFrameSelector() {
      const video = this.$refs.framePreviewVideo
      if (video) {
        // 视频加载完成后生成缩略图
        video.addEventListener('loadedmetadata', () => {
          this.handleVideoLoaded()
        })
      }
    },
    
    // 视频加载完成处理
    handleVideoLoaded() {
      const video = this.$refs.framePreviewVideo
      if (video) {
        this.totalFrameTime = this.formatTimeDetailed(video.duration)
        this.generateTimelineThumbnails()
      }
    },
    
    // 生成时间轴缩略图
    generateTimelineThumbnails() {
      const video = this.$refs.framePreviewVideo
      if (!video) return
      
      const duration = video.duration
      const frameCount = 10
      this.timelineFrames = []
      
      // 生成每个时间点的缩略图
      for (let i = 0; i < frameCount; i++) {
        const time = (duration / frameCount) * i
        this.captureFrame(video, time, (thumbnail) => {
          this.timelineFrames.push({
            time: time,
            thumbnail: thumbnail
          })
          
          // 如果是第一帧，自动选择
          if (i === 0) {
            this.selectFrame(time, 0)
          }
        })
      }
    },
    
    // 捕获视频帧
    captureFrame(video, time, callback) {
      const tempVideo = document.createElement('video')
      tempVideo.src = video.src
      tempVideo.currentTime = time
      tempVideo.muted = true
      
      tempVideo.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height)
        callback(canvas.toDataURL('image/jpeg', 0.5))
      }
    },
    
    // 更新时间轴进度
    updateTimelineProgress() {
      const video = this.$refs.framePreviewVideo
      if (!video || !video.duration) return
      
      const currentTime = video.currentTime
      const duration = video.duration
      this.timelineProgress = (currentTime / duration) * 100
      this.currentFrameTime = this.formatTimeDetailed(currentTime)
    },
    
    // 视频播放结束处理
    handleVideoEnded() {
      this.isPlaying = false
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
    },
    
    // 播放/暂停视频
    toggleFramePlay() {
      const video = this.$refs.framePreviewVideo
      if (!video) return
      
      if (video.paused) {
        video.play()
        this.isPlaying = true
        this.startProgressAnimation()
      } else {
        video.pause()
        this.isPlaying = false
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId)
        }
      }
    },
    
    // 开始进度动画
    startProgressAnimation() {
      const updateProgress = () => {
        this.updateTimelineProgress()
        if (this.isPlaying) {
          this.animationFrameId = requestAnimationFrame(updateProgress)
        }
      }
      updateProgress()
    },
    
    // 选择帧
    selectFrame(time, index) {
      const video = this.$refs.framePreviewVideo
      if (video) {
        video.currentTime = time
        this.selectedFrameIndex = index
        this.captureCurrentFrame()
      }
    },
    
    // 拖动时间轴
    seekToFrame(event) {
      const video = this.$refs.framePreviewVideo
      if (!video) return
      
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const percent = x / rect.width
      const time = video.duration * percent
      
      // 找到最近的缩略图索引
      let nearestIndex = 0
      let minDiff = Math.abs(this.timelineFrames[0].time - time)
      
      this.timelineFrames.forEach((frame, index) => {
        const diff = Math.abs(frame.time - time)
        if (diff < minDiff) {
          minDiff = diff
          nearestIndex = index
        }
      })
      
      this.selectFrame(time, nearestIndex)
    },
    
    // 捕获当前帧
    captureCurrentFrame() {
      const video = this.$refs.framePreviewVideo
      if (!video) return
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      this.selectedFrame = canvas.toDataURL('image/jpeg')
    },
    
    // 确认帧选择
    confirmFrameSelection() {
      if (!this.frameConfirmed) {
        this.frameConfirmed = true
        this.$message.success('Frame selected successfully!')
      } else {
        this.frameConfirmed = false
        this.$message.info('You can reselect a frame')
      }
    },
    
    // 格式化时间
    formatTimeDetailed(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      const ms = Math.floor((seconds % 1) * 100)
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`
    },
    
    // 移除文件
    removeFile() {
      this.currentFile = null
      this.filePreview = false
      this.fileName = ''
      this.fileType = ''
      this.previewUrl = ''
      this.hasFile = false
      this.uploadSuccess = false
      this.showFrameSelector = false
      this.frameConfirmed = false
      this.selectedFrame = null
      this.selectedFrameIndex = -1
      this.timelineFrames = []
      this.isPlaying = false
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      this.resetProcessingState()
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
    },
    
    // 处理比例更改
    handleRatioChange(value) {
      console.log('Ratio changed to:', value)
    },
    
    // 处理情感更改
    handleEmotionChange(value) {
      console.log('Emotion changed to:', value)
    },
    
    // 获取宽高比
    getAspectRatio(ratio) {
      const ratioMap = {
        '16:9': '16/9',
        '9:16': '9/16',
        '4:3': '4/3',
        '3:4': '3/4'
      }
      return ratioMap[ratio] || '16/9'
    },
    
    // 开始生成缩略图
    startGenerating() {
      if (!this.canGenerate) {
        this.$message.warning('Please complete all required fields')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 20
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.generateThumbnails()
          }, 500)
        }
      }, 200)
    },
    
    // 生成缩略图
    generateThumbnails() {
      // 清空现有缩略图
      this.thumbnails = []
      
      // 生成4个不同样式的缩略图
      const styles = [
        { bgColor: '#00bfff', textColor: 'white', fontSize: 48, position: 'center' },
        { bgColor: '#ff6b6b', textColor: 'white', fontSize: 52, position: 'bottom' },
        { bgColor: '#4ecdc4', textColor: '#333', fontSize: 50, position: 'top' },
        { bgColor: '#ffe66d', textColor: '#333', fontSize: 46, position: 'center' }
      ]
      
      styles.forEach((style, index) => {
        const thumbnail = this.createThumbnail(style)
        this.thumbnails.push({
          id: Date.now() + index,
          url: thumbnail,
          style: style
        })
      })
      
      // 更新生成信息
      this.updateGeneratedInfo()
      
      // 保存到历史记录
      this.saveToHistory()
      
      this.$message.success('Thumbnails generated successfully!')
    },
    
    // 创建缩略图
    createThumbnail(style) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置画布尺寸
      const dimensions = {
        '16:9': { width: 1280, height: 720 },
        '9:16': { width: 720, height: 1280 },
        '4:3': { width: 1024, height: 768 },
        '3:4': { width: 810, height: 1080 }
      }
      
      const dim = dimensions[this.thumbnailRatio] || dimensions['16:9']
      canvas.width = dim.width
      canvas.height = dim.height
      
      // 绘制背景
      ctx.fillStyle = style.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 添加装饰元素
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 100 + 50,
          0, 2 * Math.PI
        )
        ctx.fill()
      }
      
      // 添加文本
      ctx.fillStyle = style.textColor
      ctx.font = `bold ${style.fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 计算文本位置
      let yPosition
      switch(style.position) {
        case 'top':
          yPosition = canvas.height * 0.25
          break
        case 'center':
          yPosition = canvas.height * 0.5
          break
        case 'bottom':
          yPosition = canvas.height * 0.75
          break
      }
      
      // 分割文本为多行
      const words = this.thumbnailText.split(' ')
      const lines = []
      let currentLine = ''
      const maxWidth = canvas.width * 0.8
      
      for (let word of words) {
        const testLine = currentLine + word + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine = testLine
        }
      }
      lines.push(currentLine.trim())
      
      // 绘制文本行
      const lineHeight = style.fontSize * 1.2
      const startY = yPosition - (lines.length - 1) * lineHeight / 2
      
      // 添加文本阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
      
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight)
      })
      
      return canvas.toDataURL('image/png')
    },
    
    // 更新生成信息
    updateGeneratedInfo() {
      const today = new Date()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')
      const year = today.getFullYear()
      this.generatedDate = `${month}/${day}/${year}`
    },
    
    // 保存到历史记录
    saveToHistory() {
      const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        thumbnails: [...this.thumbnails],
        settings: {
          ratio: this.thumbnailRatio,
          text: this.thumbnailText,
          emotion: this.selectedEmotion
        }
      }
      
      this.generationHistory.unshift(historyItem)
      
      // 只保留最近10条记录
      if (this.generationHistory.length > 10) {
        this.generationHistory = this.generationHistory.slice(0, 10)
      }
      
      // 保存到localStorage
      try {
        localStorage.setItem('thumbnailHistory', JSON.stringify(this.generationHistory))
      } catch(e) {
        console.log('Could not save to localStorage')
      }
    },
    
    // 加载历史记录
    loadHistory() {
      try {
        const saved = localStorage.getItem('thumbnailHistory')
        if (saved) {
          this.generationHistory = JSON.parse(saved)
        }
      } catch(e) {
        console.log('Could not load from localStorage')
      }
    },
    
    // 从历史记录加载
    loadFromHistory(item) {
      this.thumbnails = [...item.thumbnails]
      this.thumbnailRatio = item.settings.ratio
      this.thumbnailText = item.settings.text
      this.selectedEmotion = item.settings.emotion
      this.showHistory = false
      this.$message.success('Loaded from history')
    },
    
    // 下载单个缩略图
    downloadSingle(index) {
      const thumbnail = this.thumbnails[index]
      if (thumbnail) {
        const link = document.createElement('a')
        link.download = `thumbnail_${index + 1}_${Date.now()}.png`
        link.href = thumbnail.url
        link.click()
      }
    },
    
    // 下载所有缩略图
    downloadAllThumbnails() {
      this.thumbnails.forEach((thumbnail, index) => {
        setTimeout(() => {
          const link = document.createElement('a')
          link.download = `thumbnail_${index + 1}_${Date.now()}.png`
          link.href = thumbnail.url
          link.click()
        }, index * 200)
      })
      this.$message.success('Downloading all thumbnails...')
    },
    
    // 编辑缩略图
    editThumbnail(index) {
      this.$message.info(`Edit functionality for thumbnail ${index + 1} - Coming soon!`)
    },
    
    // 重新生成缩略图
    regenerateThumbnails() {
      this.resetProcessingState()
      this.startGenerating()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './ThumbnailGenerator.scss';
</style>
