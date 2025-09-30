<template>
  <div class="watermark-remover-page">
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
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </nav>
      <div class="user-info">
        <div class="nav-item user-account">
          <span class="nav-icon">👤</span>
          <div class="user-details">
            <div class="user-name">User Account</div>
            <div class="user-plan">Free Plan</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1 class="header-title">Watermark & Text Remover</h1>
          <p class="header-subtitle">
            Remove unwanted watermarks, logos, text, and objects from your images and videos using advanced AI-powered content-aware fill technology.
          </p>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：上传和预览区域 -->
          <div class="workspace-left">
            <!-- 上传区域 -->
            <div class="upload-container">
              <div class="section-title">Upload Media</div>
              <div
                :class="['upload-area', { 'has-file': hasFile, 'dragover': isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="!hasFile && triggerFileInput()"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">Drop your files here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-button type="primary" class="upload-btn-small" @click.stop="triggerFileInput">
                    Choose Files
                  </el-button>
                  <input 
                    ref="fileInput"
                    type="file" 
                    class="file-input" 
                    multiple 
                    accept=".mp4,.mov,.m4v,.3gp,.avi,.jpg,.jpeg,.png" 
                    @change="handleFileSelect"
                  >
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
                      :src="previewUrl"
                      class="preview-video"
                      controls
                    ></video>
                  </div>
                  <div class="file-info">
                    <span class="file-name">{{ fileName }}</span>
                    <el-button type="danger" size="mini" class="remove-file" @click.stop="removeFile">✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                Supported: .mp4, .mov, .m4v, .3gp, .avi, .jpg, .jpeg, .png (Max 100MB)
              </div>
            </div>

            <!-- 示例文件 -->
            <div class="samples-container">
              <div class="section-title">Quick Samples</div>
              <div class="sample-grid">
                <div
                  v-for="sample in samples"
                  :key="sample.type"
                  class="sample-item"
                  @click="loadSample(sample.type)"
                  :title="sample.title"
                >
                  <span class="sample-icon">{{ sample.icon }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 移除模式设置 -->
            <div class="settings-container">
              <div class="section-title">Removal Mode</div>
              
              <!-- 移除模式选择 -->
              <div class="setting-group">
                <el-radio-group v-model="removalMode" @change="handleModeChange" class="removal-modes">
                  <el-radio 
                    v-for="mode in removalModes" 
                    :key="mode.value"
                    :label="mode.value" 
                    class="mode-option"
                  >
                    <div class="mode-content">
                      <span class="mode-icon">{{ mode.icon }}</span>
                      <span class="mode-title">{{ mode.label }}</span>
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
                class="action-btn btn-process"
                :disabled="processing || !hasFile"
                @click="startProcessing"
                :loading="processing"
              >
                <span v-if="!processing" class="btn-icon">🧹</span>
                <span>{{ buttonText }}</span>
              </el-button>
              
              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadResult"
              >
                <span class="btn-icon">⬇️</span>
                Download Clean Media
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <span class="status-icon">⏳</span>
                  <span class="status-text">Processing your media...</span>
                  <span class="status-percent">{{ processPercent }}%</span>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  class="progress-bar"
                />
                <div class="process-details">
                  <small>Detecting watermarks • Analyzing content • Applying smart fill</small>
                </div>
              </div>

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <span class="complete-icon">✅</span>
                <div class="complete-text">Watermark Removed Successfully!</div>
                <div class="complete-subtitle">Your clean media is ready for download</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果对比区域 -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">Result Comparison</h2>
          </div>
          
          <div class="comparison-container">
            <!-- 原始图片/视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">Original</span>
                <span class="label-info">{{ originalInfo }}</span>
              </div>
              <div class="image-wrapper">
                <img
                  v-if="showOriginalImage"
                  :src="originalImageSrc"
                  class="comparison-image"
                  alt="Original"
                >
                <video
                  v-else-if="showOriginalVideo"
                  ref="originalVideo"
                  :src="originalVideoSrc"
                  class="comparison-video"
                  controls
                ></video>
                <div v-if="!fileUploaded" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📂</span>
                    <p>To be uploaded</p>
                    <small>Upload a file to begin</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- VS 分隔符 -->
            <div class="comparison-divider">
              <div class="divider-icon">VS</div>
            </div>

            <!-- 清理后的图片/视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge cleaned">Cleaned</span>
                <span class="label-info">{{ cleanedInfo }}</span>
              </div>
              <div class="image-wrapper">
                <img
                  v-if="showCleanedImage"
                  :src="cleanedImageSrc"
                  class="comparison-image"
                  alt="Cleaned"
                >
                <video
                  v-else-if="showCleanedVideo"
                  ref="cleanedVideo"
                  :src="cleanedVideoSrc"
                  class="comparison-video"
                  controls
                ></video>
                <div v-if="!processingComplete || !fileUploaded" class="process-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">{{ placeholderIcon }}</span>
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
  name: 'WatermarkRemover',
  data() {
    return {
      // Menu items
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // Sample files
      samples: [
        { type: 'watermark', icon: '💧', title: 'Watermark Sample' },
        { type: 'logo', icon: '🏷️', title: 'Logo Sample' },
        { type: 'text', icon: '📝', title: 'Text Sample' },
        { type: 'object', icon: '🗑️', title: 'Object Sample' }
      ],
      
      // Removal modes
      removalModes: [
        { value: 'smart', label: 'Smart Remove', icon: '✨' },
        { value: 'watermark', label: 'Remove Watermark', icon: '💧' },
        { value: 'subtitle', label: 'Remove Subtitle', icon: '📝' }
      ],
      
      // Upload state
      isDragover: false,
      hasFile: false,
      uploadSuccess: false,
      filePreview: false,
      fileName: '',
      fileType: '',
      previewUrl: '',
      fileUploaded: false,
      currentFile: null,
      
      // Processing state
      removalMode: 'smart',
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonText: 'Remove Watermark',
      
      // Display state
      showOriginalVideo: false,
      showOriginalImage: false,
      showCleanedVideo: false,
      showCleanedImage: false,
      originalVideoSrc: '',
      originalImageSrc: '',
      cleanedVideoSrc: '',
      cleanedImageSrc: '',
      
      // Info text
      originalInfo: 'With Watermark',
      cleanedInfo: 'Watermark Removed',
      
      // Placeholder state
      placeholderIcon: '⏳',
      placeholderText: 'To be processed',
      placeholderHint: 'Upload a file first'
    }
  },
  
  methods: {
    // Handle menu click
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // File drag and drop handling
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
        this.handleFiles(e.dataTransfer.files)
      }
    },
    
    // Trigger file input
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    // Handle file selection
    handleFileSelect(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.handleFiles(files)
      }
    },
    
    // Process files
    handleFiles(files) {
      if (files.length > 0) {
        // Check file size
        if (files[0].size > 100 * 1024 * 1024) {
          this.$message.error('File size exceeds 100MB limit')
          return
        }
        
        const file = files[0]
        this.currentFile = file
        this.displayPreview(file)
      }
    },
    
    // Display file preview
    displayPreview(file) {
      this.fileName = file.name
      this.fileType = file.type.startsWith('image') ? 'image' : 'video'
      
      // Read file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewUrl = e.target.result
        this.filePreview = true
        
        // Delay showing success badge
        setTimeout(() => {
          this.uploadSuccess = true
          this.hasFile = true
          this.fileUploaded = true
          this.showComparisonWithFile()
        }, 500)
      }
      reader.readAsDataURL(file)
    },
    
    // Show comparison with file
    showComparisonWithFile() {
      // Update placeholder
      this.placeholderIcon = '⏳'
      this.placeholderText = 'Ready to process'
      this.placeholderHint = 'Click Remove Watermark to begin'
      
      // Update info text
      this.originalInfo = 'With Watermark'
      this.cleanedInfo = 'Ready to process'
      
      // Setup original content
      if (this.fileType === 'video') {
        this.setupOriginalVideo()
      } else {
        this.setupOriginalImage()
      }
    },
    
    // Setup original video
    setupOriginalVideo() {
      this.originalVideoSrc = this.previewUrl
      this.showOriginalVideo = true
      this.showOriginalImage = false
    },
    
    // Setup original image
    setupOriginalImage() {
      this.originalImageSrc = this.previewUrl
      this.showOriginalImage = true
      this.showOriginalVideo = false
    },
    
    // Remove file
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.fileType = ''
      this.previewUrl = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.fileUploaded = false
      this.currentFile = null
      this.$refs.fileInput.value = ''
      this.resetComparisonToInitial()
      this.resetProcessingState()
    },
    
    // Reset comparison to initial state
    resetComparisonToInitial() {
      this.showOriginalVideo = false
      this.showOriginalImage = false
      this.showCleanedVideo = false
      this.showCleanedImage = false
      this.originalInfo = 'With Watermark'
      this.cleanedInfo = 'Watermark Removed'
      this.placeholderIcon = '⏳'
      this.placeholderText = 'To be processed'
      this.placeholderHint = 'Upload a file first'
    },
    
    // Reset processing state
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonText = 'Remove Watermark'
    },
    
    // Load sample
    loadSample(type) {
      // Create sample image
      this.fileName = `${type}_sample.jpg`
      this.fileType = 'image'
      
      // Generate sample image URL
      this.previewUrl = this.generateSampleImage(type)
      this.filePreview = true
      
      // Delay showing success badge
      setTimeout(() => {
        this.uploadSuccess = true
        this.hasFile = true
        this.fileUploaded = true
        this.currentFile = true // Mark as having file
        this.showComparisonWithFile()
      }, 500)
    },
    
    // Generate sample image
    generateSampleImage(type) {
      const canvas = document.createElement('canvas')
      canvas.width = 1280
      canvas.height = 720
      const ctx = canvas.getContext('2d')
      
      // Background colors
      const colors = {
        watermark: '#e0f2fe',
        logo: '#fef3c7',
        text: '#ede9fe',
        object: '#fee2e2'
      }
      
      // Draw background
      ctx.fillStyle = colors[type]
      ctx.fillRect(0, 0, 1280, 720)
      
      // Add content elements
      ctx.fillStyle = '#333333'
      ctx.font = '24px Arial'
      ctx.fillText('Sample Image Content', 100, 100)
      
      // Add watermark/text samples
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      
      if (type === 'watermark') {
        // Add diagonal watermark
        ctx.save()
        ctx.translate(640, 360)
        ctx.rotate(-30 * Math.PI / 180)
        ctx.fillStyle = 'rgba(128, 128, 128, 0.4)'
        ctx.fillText('WATERMARK', 0, 0)
        ctx.restore()
      } else if (type === 'logo') {
        // Add logo style
        ctx.fillStyle = 'rgba(100, 100, 100, 0.7)'
        ctx.fillRect(1080, 50, 150, 80)
        ctx.fillStyle = 'white'
        ctx.font = 'bold 36px Arial'
        ctx.fillText('LOGO', 1155, 100)
      } else if (type === 'text') {
        // Add text overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(0, 650, 1280, 70)
        ctx.fillStyle = '#333'
        ctx.font = '32px Arial'
        ctx.fillText('www.example.com - Sample Text Overlay', 640, 690)
      } else if (type === 'object') {
        // Add object
        ctx.fillStyle = 'rgba(200, 50, 50, 0.8)'
        ctx.beginPath()
        ctx.arc(1100, 600, 60, 0, 2 * Math.PI)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = '24px Arial'
        ctx.fillText('Object', 1100, 610)
      }
      
      return canvas.toDataURL()
    },
    
    // Handle mode change
    handleModeChange() {
      console.log('Removal mode changed to:', this.removalMode)
      
      // If already processed, need to reprocess
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // Reset to reprocess state
    resetToReprocess() {
      this.buttonText = 'Reprocess Media'
      this.processingComplete = false
      this.placeholderIcon = '🔄'
      this.placeholderText = 'Mode changed'
      this.placeholderHint = 'Click Reprocess to apply new mode'
    },
    
    // Start processing
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning('Please upload a file first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // Simulate processing progress
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.showCleanedResult()
            this.$message.success('Watermark removed successfully!')
          }, 500)
        }
      }, 200)
    },
    
    // Show cleaned result
    showCleanedResult() {
      const modeText = {
        'smart': 'Smart Remove',
        'watermark': 'Watermark Removed',
        'subtitle': 'Subtitle Removed'
      }
      this.cleanedInfo = modeText[this.removalMode] || 'Processed'
      
      if (this.fileType === 'video') {
        this.setupCleanedVideo()
      } else {
        this.setupCleanedImage()
      }
    },
    
    // Setup cleaned video
    setupCleanedVideo() {
      this.cleanedVideoSrc = this.previewUrl // In production, this should be the cleaned video
      this.showCleanedVideo = true
      this.showCleanedImage = false
    },
    
    // Setup cleaned image
    setupCleanedImage() {
      this.cleanedImageSrc = this.previewUrl // In production, this should be the cleaned image
      this.showCleanedImage = true
      this.showCleanedVideo = false
    },
    
    // Download result
    downloadResult() {
      this.$message.info('Downloading clean media...')
      
      // Create download link
      const link = document.createElement('a')
      link.href = this.showCleanedImage ? this.cleanedImageSrc : this.cleanedVideoSrc
      link.download = `cleaned_${this.fileName}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './WatermarkRemover.scss';
</style>
