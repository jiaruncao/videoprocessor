<template>
  <div class="video-background-remover-page">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">{{ translate('app.brand') }}</div>
      <nav>
        <ul class="nav-menu">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            :class="['nav-item', { active: item.active }]"
            @click="handleMenuClick(index)"
          >
            <span>{{ item.icon }}</span> {{ translate(item.labelKey) }}
          </li>
        </ul>
      </nav>
      <div class="user-section">
        <div class="nav-item user-info">
          <span>👤</span>
          <div class="user-details">
            <div class="user-name">{{ translate('app.user.account') }}</div>
            <div class="user-plan">{{ translate('app.user.proMember') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <div class="language-switcher">
            <label :for="`${$options.name}-locale`" class="language-label">
              {{ translate('language.label') }}
            </label>
            <select :id="`${$options.name}-locale`" v-model="locale" class="language-select">
              <option v-for="code in availableLocales" :key="code" :value="code">
                {{ translate(`language.options.${code}`) }}
              </option>
            </select>
          </div>
          <h1>{{ translate('backgroundRemover.header.title') }}</h1>
          <p>{{ translate('backgroundRemover.header.subtitle') }}</p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <div class="section-title">{{ translate('backgroundRemover.upload.title') }}</div>
              <div 
                :class="['upload-area', { 'has-file': hasFile, 'dragover': isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">{{ translate('backgroundRemover.upload.instructions') }}</div>
                  <div class="upload-subtitle">{{ translate('backgroundRemover.upload.hint') }}</div>
                  <el-button
                    type="primary"
                    size="small"
                    class="upload-btn-small"
                    @click.stop="triggerFileInput"
                  >
                    {{ translate('backgroundRemover.upload.button') }}
                  </el-button>
                  <input 
                    ref="fileInput"
                    type="file" 
                    class="file-input" 
                    accept=".mp4,.mov,.m4v,.3gp,.avi" 
                    @change="handleFileSelect"
                    style="display: none;"
                  >
                </div>

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <video 
                      v-if="previewUrl" 
                      :src="previewUrl" 
                      controls
                      class="preview-video"
                    ></video>
                  </div>
                  <div class="file-info">
                    <span>{{ fileName }}</span>
                    <el-button 
                      type="danger" 
                      size="mini" 
                      @click.stop="removeFile"
                      class="remove-file"
                    >
                      ✕
                    </el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                {{ translate('backgroundRemover.upload.supported') }}
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 背景选择设置 -->
            <div class="settings-container">
              <div class="section-title">{{ translate('backgroundRemover.settings.title') }}</div>

              <!-- 背景选择 -->
              <el-radio-group v-model="backgroundMode" @change="handleBackgroundChange" class="background-options">
                <label class="bg-option">
                  <el-radio label="green" class="custom-radio">
                    <div class="bg-content">
                      <div class="bg-icon green"></div>
                      <span class="bg-title">{{ translate('backgroundRemover.settings.options.green') }}</span>
                    </div>
                  </el-radio>
                </label>
                <label class="bg-option">
                  <el-radio label="transparent" class="custom-radio">
                    <div class="bg-content">
                      <div class="bg-icon transparent"></div>
                      <span class="bg-title">{{ translate('backgroundRemover.settings.options.transparent') }}</span>
                    </div>
                  </el-radio>
                </label>
              </el-radio-group>

              <el-alert
                :closable="false"
                type="info"
                class="test-mode-info"
              >
                <template slot="title">
                  <strong>{{ translate('backgroundRemover.settings.testModeLabel') }}</strong>
                  <span>{{ translate('backgroundRemover.settings.testModeValue') }}</span>
                </template>
              </el-alert>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !hasFile"
                :loading="processing"
                @click="startProcessing"
              >
                <span class="btn-icon" v-if="!processing">🎬</span>
                <span>{{ translate(buttonTextKey) }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="warning"
                class="action-btn btn-preview"
                @click="downloadPreview"
              >
                <span class="btn-icon">👁️</span>
                {{ translate('backgroundRemover.actions.preview') }}
                <span class="btn-subtitle">{{ translate('backgroundRemover.actions.previewSubtitle') }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadFull"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('backgroundRemover.actions.download') }}
                <span class="btn-subtitle">{{ translate('backgroundRemover.actions.downloadSubtitle') }}</span>
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('backgroundRemover.processing.inProgress') }}</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  class="progress-bar"
                />
                <div class="process-details">
                  <small>{{ translate('backgroundRemover.processing.details') }}</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="showSuccess" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">{{ translate('backgroundRemover.processing.completeTitle') }}</div>
                <div class="complete-subtitle">{{ translate('backgroundRemover.processing.completeSubtitle') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果对比区域 -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('backgroundRemover.comparison.title') }}</h2>
          </div>
          <div class="comparison-container">
            <!-- 原始视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">{{ translate('backgroundRemover.comparison.original') }}</span>
                <span class="label-info">{{ translate(originalInfoKey) }}</span>
              </div>
              <div class="canvas-wrapper">
                <canvas
                  ref="originalCanvas"
                  :width="canvasWidth"
                  :height="canvasHeight"
                ></canvas>
                <div v-if="showOriginalControls" class="video-controls">
                  <el-button
                    type="text"
                    class="control-btn"
                    @click="togglePlay('original')"
                  >
                    {{ isPlaying ? '⏸️' : '▶️' }}
                  </el-button>
                  <span class="preview-time">{{ translate('backgroundRemover.comparison.previewLabel') }}</span>
                </div>
                <div v-if="!hasFile" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📂</span>
                    <p>{{ translate('backgroundRemover.comparison.placeholderTitle') }}</p>
                    <small>{{ translate('backgroundRemover.comparison.placeholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- 处理后的视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">{{ translate('backgroundRemover.comparison.processed') }}</span>
                <span class="label-info">{{ translate(processedInfoKey) }}</span>
              </div>
              <div class="canvas-wrapper">
                <canvas
                  ref="processedCanvas"
                  :width="canvasWidth"
                  :height="canvasHeight"
                ></canvas>
                <div v-if="showProcessedControls" class="video-controls">
                  <el-button
                    type="text"
                    class="control-btn"
                    @click="togglePlay('processed')"
                  >
                    {{ isPlaying ? '⏸️' : '▶️' }}
                  </el-button>
                  <span class="preview-time">{{ translate('backgroundRemover.comparison.previewLabel') }}</span>
                </div>
                <div v-if="!processingComplete && !processing" class="process-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">⏳</span>
                    <p>{{ translate(placeholderTextKey) }}</p>
                    <small>{{ translate(placeholderHintKey) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'VideoBackgroundRemover',
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🎥', labelKey: 'menu.backgroundRemover', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      
      // 文件相关
      currentFile: null,
      fileName: '',
      previewUrl: '',
      filePreview: false,
      hasFile: false,
      uploadSuccess: false,
      isDragover: false,
      
      // 处理相关
      backgroundMode: 'green',
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonTextKey: 'backgroundRemover.actions.remove',
      showSuccess: false,
      
      // Canvas相关
      canvasWidth: 640,
      canvasHeight: 480,
      originalVideo: null,
      processedVideo: null,
      originalCtx: null,
      processedCtx: null,
      animationId: null,
      isPlaying: false,
      
      // 控制显示
      showOriginalControls: false,
      showProcessedControls: false,
      originalInfoKey: 'backgroundRemover.status.originalInfo',
      processedInfoKey: 'backgroundRemover.status.processedInitial',
      placeholderTextKey: 'backgroundRemover.status.toBeProcessed',
      placeholderHintKey: 'backgroundRemover.status.processHint'
    }
  },
  
  mounted() {
    // 初始化Canvas
    this.initCanvas()
  },
  
  beforeDestroy() {
    // 清理资源
    this.cleanup()
  },
  
  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },

    // 初始化Canvas
    initCanvas() {
      this.$nextTick(() => {
        if (this.$refs.originalCanvas) {
          this.originalCtx = this.$refs.originalCanvas.getContext('2d')
          // 设置默认背景
          this.originalCtx.fillStyle = '#000'
          this.originalCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        }
        if (this.$refs.processedCanvas) {
          this.processedCtx = this.$refs.processedCanvas.getContext('2d')
          // 设置默认背景
          this.processedCtx.fillStyle = '#000'
          this.processedCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        }
      })
    },
    
    // 菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 触发文件选择
    triggerFileInput() {
      if (!this.hasFile) {
        this.$refs.fileInput.click()
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
      if (!this.hasFile && e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files)
      }
    },
    
    // 文件选择处理
    handleFileSelect(e) {
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files)
      }
    },
    
    // 处理文件
    handleFiles(files) {
      if (files.length > 8) {
        this.$message.error(this.translate('backgroundRemover.messages.uploadLimit'))
        return
      }

      const file = files[0]
      if (file.size > 500 * 1024 * 1024) {
        this.$message.error(this.translate('backgroundRemover.messages.fileTooLarge'))
        return
      }
      
      this.currentFile = file
      this.fileName = file.name
      this.displayPreview(file)
      
      // 延迟显示成功标记
      setTimeout(() => {
        this.uploadSuccess = true
        this.hasFile = true
        this.showVideoInCanvas()
        this.resetProcessingState()
      }, 500)
    },
    
    // 显示预览
    displayPreview(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
      }
      reader.readAsDataURL(file)
    },
    
    // 在Canvas中显示视频
    showVideoInCanvas() {
      // 创建视频元素
      this.originalVideo = document.createElement('video')
      this.originalVideo.src = this.previewUrl
      this.originalVideo.muted = true
      this.originalVideo.loop = true
      
      this.originalVideo.onloadedmetadata = () => {
        // 调整Canvas尺寸以适应视频
        const aspectRatio = this.originalVideo.videoWidth / this.originalVideo.videoHeight
        
        if (aspectRatio > 1.33) {
          this.canvasWidth = 640
          this.canvasHeight = Math.round(640 / aspectRatio)
        } else {
          this.canvasHeight = 480
          this.canvasWidth = Math.round(480 * aspectRatio)
        }
        
        // 重新初始化Canvas
        this.$nextTick(() => {
          this.initCanvas()
          // 绘制第一帧
          if (this.originalCtx && this.originalVideo) {
            this.originalCtx.drawImage(this.originalVideo, 0, 0, this.canvasWidth, this.canvasHeight)
          }
          // 显示控制按钮
          this.showOriginalControls = true
        })
      }
    },
    
    // 移除文件
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.previewUrl = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.currentFile = null
      
      // 清理视频和Canvas
      this.cleanup()
      
      // 重置Canvas
      this.initCanvas()
      
      // 重置控制
      this.showOriginalControls = false
      this.showProcessedControls = false
      
      // 重置状态
      this.resetProcessingState()
    },
    
    // 清理资源
    cleanup() {
      if (this.originalVideo) {
        this.originalVideo.pause()
        this.originalVideo = null
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
      this.processedVideo = null
      this.isPlaying = false
    },
    
    // 背景模式更改
    handleBackgroundChange() {
      console.log('Background mode changed to:', this.backgroundMode)
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 重置为重新处理状态
    resetToReprocess() {
      this.buttonTextKey = 'backgroundRemover.actions.reprocess'
      this.processingComplete = false
      this.showProcessedControls = false
      this.showSuccess = false
      this.processedInfoKey = 'backgroundRemover.status.processedInitial'
      this.placeholderTextKey = 'backgroundRemover.status.settingsChanged'
      this.placeholderHintKey = 'backgroundRemover.status.reprocessHint'

      // 清空处理后的Canvas
      if (this.processedCtx) {
        this.processedCtx.fillStyle = '#000'
        this.processedCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonTextKey = 'backgroundRemover.actions.remove'
      this.showSuccess = false
      this.processedInfoKey = 'backgroundRemover.status.processedInitial'
      this.placeholderTextKey = 'backgroundRemover.status.toBeProcessed'
      this.placeholderHintKey = 'backgroundRemover.status.processHint'
    },

    // 开始处理
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning(this.translate('backgroundRemover.messages.uploadRequired'))
        return
      }
      
      this.processing = true
      this.processPercent = 0
      this.showSuccess = false
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          // 处理完成
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.showSuccess = true
            this.showProcessedResult()
            
            // 3秒后隐藏成功消息
            setTimeout(() => {
              this.showSuccess = false
            }, 3000)
          }, 500)
        }
      }, 200)
    },
    
    // 显示处理结果
    showProcessedResult() {
      this.processedInfoKey =
        this.backgroundMode === 'green'
          ? 'backgroundRemover.status.processedGreen'
          : 'backgroundRemover.status.processedTransparent'

      // 显示处理后的控制按钮
      this.showProcessedControls = true
      
      // 标记处理完成
      this.processedVideo = true
      
      // 绘制处理后的第一帧
      if (this.originalVideo) {
        this.drawProcessedFrame()
      }
    },
    
    // 绘制处理后的帧
    drawProcessedFrame() {
      if (!this.processedCtx) return
      
      const width = this.canvasWidth
      const height = this.canvasHeight
      
      // 清空Canvas
      this.processedCtx.clearRect(0, 0, width, height)
      
      // 根据背景模式绘制背景
      if (this.backgroundMode === 'green') {
        // 绿色背景
        this.processedCtx.fillStyle = '#00ff00'
        this.processedCtx.fillRect(0, 0, width, height)
      } else {
        // 透明背景（棋盘格）
        const blockSize = 20
        for (let y = 0; y < height; y += blockSize) {
          for (let x = 0; x < width; x += blockSize) {
            this.processedCtx.fillStyle = 
              (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0 
                ? '#e2e8f0' : '#cbd5e1'
            this.processedCtx.fillRect(x, y, blockSize, blockSize)
          }
        }
      }
      
      // 绘制处理后的视频（模拟背景移除）
      if (this.originalVideo && this.originalVideo.readyState >= 2) {
        // 创建临时Canvas进行图像处理
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = width
        tempCanvas.height = height
        const tempCtx = tempCanvas.getContext('2d')
        
        // 绘制原始视频帧
        tempCtx.drawImage(this.originalVideo, 0, 0, width, height)
        
        // 获取图像数据进行简单的背景移除模拟
        const imageData = tempCtx.getImageData(0, 0, width, height)
        const data = imageData.data
        
        // 简单的绿幕效果模拟
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // 简单的背景检测
          const brightness = (r + g + b) / 3
          if (brightness > 180 && brightness < 220) {
            // 将背景像素设为透明
            data[i + 3] = 0
          }
        }
        
        // 将处理后的图像绘制到Canvas
        tempCtx.putImageData(imageData, 0, 0)
        this.processedCtx.drawImage(tempCanvas, 0, 0)
      }
    },
    
    // 播放/暂停控制
    togglePlay(type) {
      if (!this.originalVideo) return
      
      if (this.originalVideo.paused) {
        this.originalVideo.play()
        this.startAnimation()
        this.isPlaying = true
      } else {
        this.originalVideo.pause()
        this.stopAnimation()
        this.isPlaying = false
      }
    },
    
    // 开始动画
    startAnimation() {
      if (this.animationId) return
      
      const animate = () => {
        // 绘制原始视频帧
        if (this.originalVideo && this.originalVideo.readyState >= 2 && this.originalCtx) {
          this.originalCtx.drawImage(this.originalVideo, 0, 0, this.canvasWidth, this.canvasHeight)
        }
        
        // 绘制处理后的视频帧
        if (this.processedVideo) {
          this.drawProcessedFrame()
        }
        
        // 限制预览时长为5秒
        if (this.originalVideo && this.originalVideo.currentTime >= 5) {
          this.originalVideo.currentTime = 0
        }
        
        this.animationId = requestAnimationFrame(animate)
      }
      
      animate()
    },
    
    // 停止动画
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },
    
    // 下载预览
    downloadPreview() {
      this.$message.success(this.translate('backgroundRemover.messages.downloadPreview'))
      // 实际应用中，这里实现预览视频的下载逻辑
    },

    // 下载完整视频
    downloadFull() {
      this.$message.info(this.translate('backgroundRemover.messages.downloadFull'))
      // 实际应用中，这里实现完整视频的下载逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoBackgroundRemover.scss';
</style>
