<template>
  <div class="video-background-remover-page">
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
        <div class="nav-item user-info">
          <span>👤</span>
          <div class="user-details">
            <div class="user-name">User Account</div>
            <div class="user-plan">Pro Member</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>Video Background Remover</h1>
          <p>Remove the background from your video and replace it with a green or transparent background with just one click.</p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <div class="section-title">Upload Video</div>
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
                  <div class="upload-title">Click, drop, or paste files to upload</div>
                  <div class="upload-subtitle">Up to 8 files can be uploaded at a time</div>
                  <el-button 
                    type="primary" 
                    size="small" 
                    class="upload-btn-small"
                    @click.stop="triggerFileInput"
                  >
                    Choose Files
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
                Support format: .mp4, .mov, .m4v, .3gp, .avi
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 背景选择设置 -->
            <div class="settings-container">
              <div class="section-title">Background Options</div>
              
              <!-- 背景选择 -->
              <el-radio-group v-model="backgroundMode" @change="handleBackgroundChange" class="background-options">
                <label class="bg-option">
                  <el-radio label="green" class="custom-radio">
                    <div class="bg-content">
                      <div class="bg-icon green"></div>
                      <span class="bg-title">Green</span>
                    </div>
                  </el-radio>
                </label>
                <label class="bg-option">
                  <el-radio label="transparent" class="custom-radio">
                    <div class="bg-content">
                      <div class="bg-icon transparent"></div>
                      <span class="bg-title">Transparent</span>
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
                  <strong>Test Mode:</strong> Processing test_video copy 2.mp4
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
                <span>{{ buttonText }}</span>
              </el-button>
              
              <el-button
                v-if="processingComplete"
                type="warning"
                class="action-btn btn-preview"
                @click="downloadPreview"
              >
                <span class="btn-icon">👁️</span>
                Download 5s Preview Video
                <span class="btn-subtitle">(Free!)</span>
              </el-button>
              
              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadFull"
              >
                <span class="btn-icon">⬇️</span>
                Download Full Video
                <span class="btn-subtitle">(Pro)</span>
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Processing your video...</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  class="progress-bar"
                />
                <div class="process-details">
                  <small>Analyzing frames • Removing background • Applying effects</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="showSuccess" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">Background Removed Successfully!</div>
                <div class="complete-subtitle">Your video is ready for download</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果对比区域 -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">Video Comparison</h2>
          </div>
          <div class="comparison-container">
            <!-- 原始视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">Original</span>
                <span class="label-info">{{ originalInfo }}</span>
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
                  <span class="preview-time">5s Preview</span>
                </div>
                <div v-if="!hasFile" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📂</span>
                    <p>To be uploaded</p>
                    <small>Upload a video to begin</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- 处理后的视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">After</span>
                <span class="label-info">{{ processedInfo }}</span>
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
                  <span class="preview-time">5s Preview</span>
                </div>
                <div v-if="!processingComplete && !processing" class="process-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">⏳</span>
                    <p>{{ placeholderText }}</p>
                    <small>{{ placeholderHint }}</small>
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
export default {
  name: 'VideoBackgroundRemover',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🎥', label: 'Background Remover', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
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
      buttonText: 'Remove Background',
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
      originalInfo: 'Original Video',
      processedInfo: 'Background Removed',
      placeholderText: 'To be processed',
      placeholderHint: 'Click Remove Background to begin'
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
        this.$message.error('Maximum 8 files allowed at once')
        return
      }
      
      const file = files[0]
      if (file.size > 500 * 1024 * 1024) {
        this.$message.error('File size exceeds 500MB limit')
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
      this.buttonText = 'Reprocess Video'
      this.processingComplete = false
      this.showProcessedControls = false
      this.showSuccess = false
      this.placeholderText = 'Settings changed'
      this.placeholderHint = 'Click Reprocess to apply new background'
      
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
      this.buttonText = 'Remove Background'
      this.showSuccess = false
      this.placeholderText = 'To be processed'
      this.placeholderHint = 'Click Remove Background to begin'
    },
    
    // 开始处理
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning('Please upload a video first')
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
      const backgroundText = this.backgroundMode === 'green' ? 'Green Screen' : 'Transparent'
      this.processedInfo = `${backgroundText} Applied`
      
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
      this.$message.success('Downloading 5s preview video...')
      // 实际应用中，这里实现预览视频的下载逻辑
    },
    
    // 下载完整视频
    downloadFull() {
      this.$message.info('Downloading full video (Pro feature)...')
      // 实际应用中，这里实现完整视频的下载逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoBackgroundRemover.scss';
</style>
