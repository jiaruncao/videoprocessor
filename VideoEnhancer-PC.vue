<template>
  <DashboardLayout
    page-class="video-enhancer-page"
    :menu-items="menuItems"
    :locale="locale"
    :available-locales="availableLocales"
    :brand="translate('app.brand')"
    :title="translate('videoEnhancer.header.title')"
    :subtitle="translate('videoEnhancer.header.subtitle')"
    :user-name="translate('app.user.account')"
    :user-plan="translate('app.user.plan')"
    :translate="translate"
    @select-menu="handleMenuClick"
    @change-locale="handleLocaleChange"
  >
    <!-- 主要工作区 -->
    <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <h3 class="section-title">{{ translate('videoEnhancer.upload.title') }}</h3>
              <div
                :class="['upload-area', { 'has-file': hasFile, 'dragover': isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✓</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">{{ translate('videoEnhancer.upload.drop') }}</div>
                  <div class="upload-subtitle">{{ translate('videoEnhancer.upload.browse') }}</div>
                  <el-button type="primary" size="small" class="upload-btn-small" @click.stop="triggerFileInput">
                    {{ translate('videoEnhancer.upload.button') }}
                  </el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    class="file-input"
                    multiple
                    accept=".mp4,.mov,.m4v,.3gp,.avi,.jpg,.jpeg,.png"
                    @change="handleFileSelect"
                  />
                </div>

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <img
                      v-if="fileType === 'image'"
                      :src="previewUrl"
                      class="preview-image"
                    />
                    <video
                      v-else-if="fileType === 'video'"
                      :src="previewUrl"
                      class="preview-video"
                      controls
                    />
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ fileName }}</span>
                    <el-button type="danger" size="mini" @click.stop="removeFile">✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                {{ translate('videoEnhancer.upload.supported') }}
              </div>
            </div>

            <!-- 示例文件 -->
            <div class="samples-container">
              <h3 class="section-title">{{ translate('videoEnhancer.samples.title') }}</h3>
              <div class="sample-grid">
                <div
                  v-for="sample in samples"
                  :key="sample.type"
                  class="sample-item"
                  @click="loadSample(sample.type)"
                  :title="translate(sample.titleKey)"
                >
                  <span class="sample-icon">{{ sample.icon }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 增强设置 -->
            <div class="settings-container">
              <h3 class="section-title">{{ translate('videoEnhancer.settings.title') }}</h3>

              <!-- 分辨率选择 -->
              <div class="setting-group">
                <div class="setting-label">{{ translate('videoEnhancer.settings.resolution') }}</div>
                <el-radio-group v-model="resolution" @change="handleSettingChange">
                  <div class="resolution-group">
                    <label class="radio-option">
                      <el-radio label="hd">
                        <div class="radio-content">
                          <div class="radio-title">{{ translate('videoEnhancer.settings.hd') }}</div>
                          <div class="radio-subtitle">{{ translate('videoEnhancer.settings.hdSubtitle') }}</div>
                        </div>
                      </el-radio>
                    </label>
                    <label class="radio-option">
                      <el-radio label="4k">
                        <div class="radio-content">
                          <div class="radio-title">{{ translate('videoEnhancer.settings.fourK') }}</div>
                          <div class="radio-subtitle">{{ translate('videoEnhancer.settings.fourKSubtitle') }}</div>
                        </div>
                      </el-radio>
                    </label>
                  </div>
                </el-radio-group>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !fileUploaded"
                @click="startProcessing"
              :loading="processing"
            >
              <span v-if="!processing" class="btn-icon">🚀</span>
                {{ translate(buttonTextKey) }}
              </el-button>

              <el-button
                v-else
                type="success"
                class="action-btn btn-download"
                @click="downloadResult"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('videoEnhancer.actions.download') }}
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">{{ translate('videoEnhancer.processing.inProgress') }}</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  color="#6366f1"
                />
                <div class="process-details">
                  <small>{{ translate('videoEnhancer.processing.details') }}</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">{{ translate('videoEnhancer.processing.completeTitle') }}</div>
                <div class="complete-subtitle">{{ translate('videoEnhancer.processing.completeSubtitle') }}</div>
              </div>
            </div>
          </div>
        </div>

    <!-- 视频对比区域 -->
    <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('videoEnhancer.comparison.title') }}</h2>
            <div v-show="showVideoControls" class="comparison-controls">
              <el-button
                class="control-btn"
                @click="togglePlayPause"
                size="small"
                round
              >
                <span class="control-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                {{ translate(isPlaying ? 'videoEnhancer.comparison.pause' : 'videoEnhancer.comparison.play') }}
              </el-button>
              <el-button
                class="control-btn"
                @click="restartVideos"
                size="small"
                round
              >
                <span class="control-icon">🔄</span>
                {{ translate('videoEnhancer.comparison.restart') }}
              </el-button>
              <el-button
                class="control-btn"
                @click="toggleMute"
                size="small"
                round
              >
                <span class="control-icon">{{ isMuted ? '🔇' : '🔊' }}</span>
                {{ translate(isMuted ? 'videoEnhancer.comparison.muted' : 'videoEnhancer.comparison.sound') }}
              </el-button>
              <el-slider
                v-model="videoProgress"
                @input="seekVideos"
                class="video-slider"
                :show-tooltip="false"
              />
            </div>
          </div>

          <div class="comparison-container">
            <!-- 原始视频/图片 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">{{ translate('videoEnhancer.comparison.original') }}</span>
                <span class="label-resolution">{{ originalResolution }}</span>
              </div>
              <div
                class="video-wrapper"
                @click="toggleVideoPlayPause('original')"
              >
                <video
                  v-show="showOriginalVideo"
                  ref="originalVideo"
                  :src="originalVideoSrc"
                  class="comparison-video"
                  :muted="isMuted"
                  @timeupdate="handleTimeUpdate"
                  @loadedmetadata="handleVideoLoaded"
                />
                <img
                  v-show="showOriginalImage"
                  :src="originalImageSrc"
                  class="comparison-image"
                />
                <div class="play-overlay" v-if="showOriginalVideo">
                  <span class="play-overlay-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                </div>
                <div v-if="!fileUploaded" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📁</span>
                    <p class="placeholder-text">{{ translate('videoEnhancer.comparison.placeholderTitle') }}</p>
                    <small class="placeholder-hint">{{ translate('videoEnhancer.comparison.placeholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- VS 分隔符 -->
            <div class="comparison-divider">
              <div class="divider-icon">VS</div>
            </div>

            <!-- 增强后的视频/图片 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge enhanced">{{ translate('videoEnhancer.comparison.enhanced') }}</span>
                <span class="label-resolution">{{ enhancedResolution }}</span>
              </div>
              <div
                class="video-wrapper"
                @click="toggleVideoPlayPause('enhanced')"
              >
                <video
                  v-show="showEnhancedVideo"
                  ref="enhancedVideo"
                  :src="enhancedVideoSrc"
                  class="comparison-video"
                  :muted="isMuted"
                />
                <img
                  v-show="showEnhancedImage"
                  :src="enhancedImageSrc"
                  class="comparison-image"
                  :style="{ filter: 'contrast(1.1) saturate(1.1) brightness(1.05)' }"
                />
                <div class="play-overlay" v-if="showEnhancedVideo && processingComplete">
                  <span class="play-overlay-icon">{{ isPlaying ? '⏸️' : '▶️' }}</span>
                </div>
                <div v-if="!processingComplete || !fileUploaded" class="enhancement-overlay">
                  <div class="enhancement-info">
                    <span class="check-icon">{{ enhancementIcon }}</span>
                    <p class="enhancement-text">{{ translate(enhancementTextKey) }}</p>
                    <small class="enhancement-hint">{{ translate(enhancementHintKey) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间轴 -->
          <div v-show="showVideoControls" class="comparison-timeline">
            <span class="time-label">{{ currentTime }}</span>
            <div class="timeline-bar">
              <div class="timeline-progress" :style="{ width: videoProgress + '%' }" />
            </div>
            <span class="time-label">{{ totalTime }}</span>
          </div>
    </div>

    <!-- 智能洞察 -->
    <div class="insights-section">
      <h2 class="section-title">{{ translate('videoEnhancer.insights.title') }}</h2>
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon">⚡</div>
          <div class="insight-content">
            <div class="insight-title">{{ translate('videoEnhancer.insights.performance.title') }}</div>
            <div class="insight-metric">{{ translate('videoEnhancer.insights.performance.value') }}</div>
            <p class="insight-description">{{ translate('videoEnhancer.insights.performance.description') }}</p>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-icon">🎯</div>
          <div class="insight-content">
            <div class="insight-title">{{ translate('videoEnhancer.insights.clarity.title') }}</div>
            <div class="insight-metric">{{ translate('videoEnhancer.insights.clarity.value') }}</div>
            <p class="insight-description">{{ translate('videoEnhancer.insights.clarity.description') }}</p>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-icon">🌈</div>
          <div class="insight-content">
            <div class="insight-title">{{ translate('videoEnhancer.insights.color.title') }}</div>
            <div class="insight-metric">{{ translate('videoEnhancer.insights.color.value') }}</div>
            <p class="insight-description">{{ translate('videoEnhancer.insights.color.description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from './components/dashboard/DashboardLayout.vue'
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'VideoEnhancer',
  components: {
    DashboardLayout
  },
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '🔊', labelKey: 'menu.audioEnhancement', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],

      // 示例文件
      samples: [
        { type: 'portrait', icon: '👤', titleKey: 'videoEnhancer.samples.portrait' },
        { type: 'nature', icon: '🌿', titleKey: 'videoEnhancer.samples.nature' },
        { type: 'cityscape', icon: '🏙️', titleKey: 'videoEnhancer.samples.cityscape' },
        { type: 'food', icon: '🍔', titleKey: 'videoEnhancer.samples.food' }
      ],
      
      // 上传状态
      isDragover: false,
      hasFile: false,
      uploadSuccess: false,
      filePreview: false,
      fileName: '',
      fileType: '',
      previewUrl: '',
      fileUploaded: false,
      currentFile: null,
      
      // 处理状态
      resolution: 'hd',
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonTextKey: 'videoEnhancer.actions.apply',
      
      // 视频控制
      isPlaying: false,
      isMuted: true,
      videoProgress: 0,
      currentTime: '00:00',
      totalTime: '00:00',
      showVideoControls: false,
      
      // 显示状态
      showOriginalVideo: false,
      showOriginalImage: false,
      showEnhancedVideo: false,
      showEnhancedImage: false,
      originalVideoSrc: '',
      originalImageSrc: '',
      enhancedVideoSrc: '',
      enhancedImageSrc: '',
      
      // 分辨率显示
      originalResolution: '-',
      enhancedResolution: '-',
      
      // 增强提示
      enhancementIcon: '📁',
      enhancementTextKey: 'videoEnhancer.status.toBeUploaded',
      enhancementHintKey: 'videoEnhancer.status.uploadHint'
    }
  },
  
  mounted() {
    // 组件挂载后的初始化
    this.initializeComponent()
  },

  beforeDestroy() {
    // 清理资源
    this.cleanup()
  },

  watch: {
    locale() {
      this.updateResolutionDisplay()
    }
  },

  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },

    handleLocaleChange(newLocale) {
      this.locale = newLocale
    },

    // 初始化组件
    initializeComponent() {
      console.log('Video Enhancer component initialized')
    },
    
    // 清理资源
    cleanup() {
      // 释放视频资源
      if (this.originalVideoSrc) {
        URL.revokeObjectURL(this.originalVideoSrc)
      }
      if (this.enhancedVideoSrc) {
        URL.revokeObjectURL(this.enhancedVideoSrc)
      }
    },
    
    // 菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // 文件选择处理
    handleFileSelect(event) {
      const files = event.target.files
      if (files && files.length > 0) {
        this.handleFiles(files)
      }
    },
    
    // 文件拖拽处理
    handleDragover() {
      if (!this.hasFile) {
        this.isDragover = true
      }
    },
    
    handleDragleave() {
      this.isDragover = false
    },
    
    handleDrop(e) {
      this.isDragover = false
      if (!this.hasFile) {
        const files = e.dataTransfer.files
        this.handleFiles(files)
      }
    },
    
    // 处理文件
    handleFiles(files) {
      if (files.length > 8) {
        this.$message.warning(this.translate('videoEnhancer.messages.uploadLimit'))
        return
      }
      
      const file = files[0]
      this.currentFile = file
      this.displayPreview(file)
    },
    
    // 显示预览
    displayPreview(file) {
      this.fileName = file.name
      this.fileType = file.type.startsWith('image') ? 'image' : 'video'
      
      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
        
        // 延迟显示成功标记，模拟上传过程
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.showComparisonWithFile()
        }, 500)
      }
      reader.readAsDataURL(file)
    },
    
    // 显示对比
    showComparisonWithFile() {
      // 更新增强提示
      this.enhancementIcon = '⏳'
      this.enhancementTextKey = 'videoEnhancer.status.toBeProcessed'
      this.enhancementHintKey = 'videoEnhancer.status.processHint'

      // 更新分辨率显示
      this.updateResolutionDisplay()
      
      // 设置原始内容
      if (this.fileType === 'video') {
        this.setupOriginalVideo()
      } else {
        this.setupOriginalImage()
      }
    },
    
    // 设置原始视频
    setupOriginalVideo() {
      this.originalVideoSrc = this.previewUrl
      this.showOriginalVideo = true
      this.showOriginalImage = false
      this.showVideoControls = true
      
      // 获取视频元数据
      this.$nextTick(() => {
        if (this.$refs.originalVideo) {
          this.$refs.originalVideo.onloadedmetadata = () => {
            const video = this.$refs.originalVideo
            this.originalResolution = `${video.videoWidth}×${video.videoHeight}px`
            this.totalTime = this.formatDuration(video.duration)
          }
        }
      })
    },
    
    // 设置原始图片
    setupOriginalImage() {
      this.originalImageSrc = this.previewUrl
      this.showOriginalImage = true
      this.showOriginalVideo = false
      this.showVideoControls = false
      
      // 获取图片尺寸
      const img = new Image()
      img.onload = () => {
        this.originalResolution = `${img.width}×${img.height}px`
      }
      img.src = this.previewUrl
    },
    
    // 移除文件
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.fileType = ''
      this.previewUrl = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.fileUploaded = false
      this.currentFile = null
      this.resetComparisonToInitial()
      this.resetProcessingState()
      
      // 重置文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // 重置对比区域到初始状态
    resetComparisonToInitial() {
      this.showOriginalVideo = false
      this.showOriginalImage = false
      this.showEnhancedVideo = false
      this.showEnhancedImage = false
      this.showVideoControls = false
      this.originalResolution = '-'
      this.enhancedResolution = '-'
      this.enhancementIcon = '📁'
      this.enhancementTextKey = 'videoEnhancer.status.toBeUploaded'
      this.enhancementHintKey = 'videoEnhancer.status.uploadHint'
      
      // 清理视频资源
      if (this.originalVideoSrc && this.originalVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.originalVideoSrc)
      }
      if (this.enhancedVideoSrc && this.enhancedVideoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(this.enhancedVideoSrc)
      }
      
      this.originalVideoSrc = ''
      this.originalImageSrc = ''
      this.enhancedVideoSrc = ''
      this.enhancedImageSrc = ''
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonTextKey = 'videoEnhancer.actions.apply'
    },
    
    // 加载示例
    loadSample(type) {
      // 创建示例图片（使用Canvas生成）
      const canvas = document.createElement('canvas')
      canvas.width = 720
      canvas.height = 1280
      const ctx = canvas.getContext('2d')
      
      // 不同类型的示例颜色
      const colors = {
        portrait: '#f8cdba',
        nature: '#90ee90',
        cityscape: '#87ceeb',
        food: '#ffd700'
      }
      
      ctx.fillStyle = colors[type]
      ctx.fillRect(0, 0, 720, 1280)
      ctx.fillStyle = '#333'
      ctx.font = '32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${type.charAt(0).toUpperCase() + type.slice(1)} Sample`, 360, 640)
      
      // 转换为Blob
      canvas.toBlob((blob) => {
        const file = new File([blob], `${type}_sample.jpg`, { type: 'image/jpeg' })
        this.currentFile = file
        this.fileName = file.name
        this.fileType = 'image'
        this.previewUrl = canvas.toDataURL()
        this.filePreview = true
        
        // 延迟显示成功标记
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.showComparisonWithFile()
        }, 500)
      })
    },
    
    // 处理设置更改
    handleSettingChange() {
      this.updateResolutionDisplay()
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 更新分辨率显示
    updateResolutionDisplay() {
      if (this.fileUploaded) {
        this.enhancedResolution = this.translate(
          this.resolution === '4k'
            ? 'videoEnhancer.resolution.fourKLabel'
            : 'videoEnhancer.resolution.hdLabel'
        )
      }
    },

    // 重置为重新处理状态
    resetToReprocess() {
      this.buttonTextKey = 'videoEnhancer.actions.reprocess'
      this.processingComplete = false
      this.enhancementIcon = '🔄'
      this.enhancementTextKey = 'videoEnhancer.status.settingsChanged'
      this.enhancementHintKey = 'videoEnhancer.status.settingsHint'
    },

    // 开始处理
    startProcessing() {
      if (!this.fileUploaded && !this.filePreview) {
        this.$message.warning(this.translate('videoEnhancer.messages.uploadRequired'))
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.showEnhancedResult()
          }, 500)
        }
      }, 200)
    },
    
    // 显示增强结果
    showEnhancedResult() {
      this.updateResolutionDisplay()
      
      if (this.fileType === 'video') {
        this.setupEnhancedVideo()
      } else {
        this.setupEnhancedImage()
      }
    },
    
    // 设置增强视频
    setupEnhancedVideo() {
      // 实际应用中，这里应该是增强后的视频URL
      this.enhancedVideoSrc = this.originalVideoSrc
      this.showEnhancedVideo = true
      this.showEnhancedImage = false
    },
    
    // 设置增强图片
    setupEnhancedImage() {
      // 实际应用中，这里应该是增强后的图片URL
      this.enhancedImageSrc = this.originalImageSrc
      this.showEnhancedImage = true
      this.showEnhancedVideo = false
    },
    
    // 视频控制
    togglePlayPause() {
      if (this.$refs.originalVideo) {
        if (this.isPlaying) {
          this.$refs.originalVideo.pause()
          if (this.$refs.enhancedVideo) {
            this.$refs.enhancedVideo.pause()
          }
        } else {
          this.$refs.originalVideo.play()
          if (this.$refs.enhancedVideo && this.processingComplete) {
            this.$refs.enhancedVideo.play()
          }
        }
        this.isPlaying = !this.isPlaying
      }
    },
    
    // 点击视频播放/暂停
    toggleVideoPlayPause(side) {
      if (side === 'original' && this.showOriginalVideo) {
        this.togglePlayPause()
      } else if (side === 'enhanced' && this.showEnhancedVideo && this.processingComplete) {
        this.togglePlayPause()
      }
    },
    
    // 重新开始
    restartVideos() {
      if (this.$refs.originalVideo) {
        this.$refs.originalVideo.currentTime = 0
        if (this.$refs.enhancedVideo) {
          this.$refs.enhancedVideo.currentTime = 0
        }
        if (this.isPlaying) {
          this.togglePlayPause()
        }
      }
    },
    
    // 静音切换
    toggleMute() {
      this.isMuted = !this.isMuted
    },
    
    // 跳转视频
    seekVideos(value) {
      if (this.$refs.originalVideo) {
        const time = (value / 100) * this.$refs.originalVideo.duration
        this.$refs.originalVideo.currentTime = time
        if (this.$refs.enhancedVideo && this.processingComplete) {
          this.$refs.enhancedVideo.currentTime = time
        }
      }
    },
    
    // 时间更新
    handleTimeUpdate() {
      if (this.$refs.originalVideo) {
        const current = this.$refs.originalVideo.currentTime
        const duration = this.$refs.originalVideo.duration
        this.videoProgress = (current / duration) * 100
        this.currentTime = this.formatDuration(current)
        
        // 同步增强视频
        if (this.$refs.enhancedVideo && this.processingComplete) {
          if (Math.abs(this.$refs.enhancedVideo.currentTime - current) > 0.1) {
            this.$refs.enhancedVideo.currentTime = current
          }
        }
      }
    },
    
    // 视频加载完成
    handleVideoLoaded() {
      if (this.$refs.originalVideo) {
        this.totalTime = this.formatDuration(this.$refs.originalVideo.duration)
        const video = this.$refs.originalVideo
        this.originalResolution = `${video.videoWidth}×${video.videoHeight}px`
      }
    },
    
    // 格式化时长
    formatDuration(seconds) {
      if (isNaN(seconds)) return '00:00'
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },
    
    // 下载结果
    downloadResult() {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = this.fileType === 'video' ? this.enhancedVideoSrc : this.enhancedImageSrc
      link.download = `enhanced_${this.fileName}`
      link.click()
      
      this.$message.success(this.translate('videoEnhancer.messages.downloadStarted'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoEnhancer.scss';

.language-switcher {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: #475569;

  .language-label {
    font-size: 14px;
    font-weight: 500;
  }

  .language-select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5f5;
    background: #f8fafc;
    color: #334155;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  }
}
</style>