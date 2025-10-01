<template>
  <div class="video-deduplication-page">
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
            <div class="user-plan">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>Smart Video Deduplication</h1>
          <p>AI-powered video deduplication with intelligent processing modes and advanced transformation options for professional content optimization.</p>
        </div>

        <!-- 工作区 -->
        <div class="workspace">
          <!-- 左侧：上传区域 -->
          <div class="workspace-left">
            <!-- 上传容器 -->
            <div class="upload-container">
              <div class="section-title">
                <span class="section-icon">📁</span>
                Upload Videos
              </div>
              
              <el-upload
                ref="upload"
                class="upload-area"
                :class="{ 'has-files': uploadedFiles.length > 0 }"
                drag
                multiple
                :auto-upload="false"
                :file-list="fileList"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                accept=".mp4,.mov,.m4v,.3gp,.avi,.mkv,.webm"
                :before-remove="beforeRemove"
              >
                <div v-if="uploadedFiles.length === 0" class="upload-content">
                  <div class="upload-icon">📹</div>
                  <div class="upload-title">Drop your videos here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-button class="upload-btn-small">Choose Videos</el-button>
                </div>
                
                <!-- 文件列表 -->
                <div v-else class="files-list">
                  <div v-for="(file, index) in uploadedFiles" :key="file.id" class="file-item">
                    <div class="file-icon">🎥</div>
                    <div class="file-details">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-info-text">{{ file.size }}</div>
                    </div>
                    <el-button 
                      type="text" 
                      class="remove-file" 
                      @click.stop="removeFile(index)"
                    >
                      ✕
                    </el-button>
                  </div>
                </div>
              </el-upload>
              
              <div class="supported-formats">
                Supported: MP4, MOV, M4V, 3GP, AVI, MKV, WebM (Max 500MB)
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button 
                type="primary" 
                class="action-btn btn-process"
                :disabled="uploadedFiles.length === 0 || processing"
                @click="startProcessing"
              >
                <span class="btn-icon">🚀</span>
                <span>{{ processing ? 'Processing...' : 'Start Processing' }}</span>
              </el-button>
              
              <el-button 
                v-if="processingComplete"
                type="success" 
                class="action-btn btn-download"
                @click="downloadResults"
              >
                <span class="btn-icon">⬇️</span>
                Download Processed Videos
              </el-button>
              
              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Processing videos...</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress 
                  :percentage="processPercent" 
                  :stroke-width="8"
                  color="#6366f1"
                />
              </div>
            </div>
          </div>

          <!-- 右侧：设置 -->
          <div class="workspace-right">
            <!-- 处理模式 -->
            <div class="settings-container">
              <div class="section-title">
                <span class="section-icon">⚙️</span>
                Processing Mode
              </div>
              
              <!-- 模式卡片 -->
              <el-radio-group v-model="processingMode" class="mode-cards" @change="handleModeChange">
                <el-radio label="smart" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'smart' }">
                    <div class="mode-card-icon">🧠</div>
                    <div class="mode-card-title">Smart Mode</div>
                    <div class="mode-card-desc">Optimized settings for best results</div>
                  </div>
                </el-radio>
                <el-radio label="custom" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'custom' }">
                    <div class="mode-card-icon">⚡</div>
                    <div class="mode-card-title">Custom Mode</div>
                    <div class="mode-card-desc">Fine-tune all parameters</div>
                  </div>
                </el-radio>
              </el-radio-group>

              <!-- 自定义设置（仅在Custom Mode显示） -->
              <transition name="fade">
                <div v-show="processingMode === 'custom'" id="customSettings">
                  <!-- Basic Deduplication -->
                  <el-collapse v-model="activeCollapse" class="custom-collapse">
                    <el-collapse-item name="basic">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>🔧</span>
                          <span>Basic Deduplication</span>
                        </div>
                      </template>
                      <div class="checkbox-group">
                        <el-checkbox-group v-model="basicOptions">
                          <div class="checkbox-item" v-for="option in basicDedupOptions" :key="option.value">
                            <el-checkbox :label="option.value">
                              {{ option.label }}
                            </el-checkbox>
                          </div>
                        </el-checkbox-group>
                      </div>
                    </el-collapse-item>

                    <!-- Special Effects -->
                    <el-collapse-item name="effects">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>✨</span>
                          <span>Special Effects</span>
                        </div>
                      </template>
                      <div class="effect-grid">
                        <button 
                          v-for="effect in specialEffects" 
                          :key="effect.value"
                          :class="['effect-btn', { selected: selectedEffect === effect.value }]"
                          @click="selectEffect(effect.value)"
                        >
                          <span class="effect-icon">{{ effect.icon }}</span>
                          <span>{{ effect.label }}</span>
                        </button>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </transition>
            </div>

            <!-- Zoom设置 -->
            <div class="settings-container zoom-settings">
              <div class="section-title">
                <span class="section-icon">🔍</span>
                Zoom Settings
              </div>
              <el-radio-group v-model="selectedZoom" class="zoom-options">
                <el-radio 
                  v-for="zoom in zoomOptions" 
                  :key="zoom.value"
                  :label="zoom.value"
                  class="zoom-option-wrapper"
                >
                  <div class="zoom-option" :class="{ selected: selectedZoom === zoom.value }">
                    <span class="zoom-icon">{{ zoom.icon }}</span>
                    <span class="zoom-label">{{ zoom.label }}</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- 对比区域 -->
        <div class="comparison-section" v-if="uploadedFiles.length > 0">
          <div class="comparison-header">
            <h2 class="comparison-title">Before & After Comparison</h2>
          </div>
          <div class="comparison-container">
            <!-- 原始视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">Original</span>
                <span class="label-info">{{ originalInfo }}</span>
              </div>
              <div class="media-wrapper">
                <video 
                  v-if="currentFile && currentFile.type === 'video'" 
                  :src="currentFile.url" 
                  class="comparison-media"
                  controls
                />
                <img 
                  v-else-if="currentFile && currentFile.type === 'image'" 
                  :src="currentFile.url" 
                  class="comparison-media"
                />
                <div v-else class="media-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📂</span>
                    <p>No file uploaded</p>
                    <small>Upload a video to begin</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分隔符 -->
            <div class="comparison-divider">
              <div class="divider-icon">VS</div>
            </div>

            <!-- 处理后的视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">Processed</span>
                <span class="label-info">{{ processedInfo }}</span>
              </div>
              <div class="media-wrapper">
                <video 
                  v-if="processedFile && processedFile.type === 'video'" 
                  :src="processedFile.url" 
                  class="comparison-media processed-media"
                  controls
                />
                <img 
                  v-else-if="processedFile && processedFile.type === 'image'" 
                  :src="processedFile.url" 
                  class="comparison-media processed-media"
                />
                <div v-else class="media-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">⏳</span>
                    <p>Ready to process</p>
                    <small>Click Start Processing to begin</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果统计 -->
        <div v-if="processingComplete" class="results-section">
          <h2 class="results-title">Processing Complete</h2>
          <div class="results-summary">
            <div class="summary-card">
              <div class="summary-icon">📹</div>
              <div class="summary-label">Original Files</div>
              <div class="summary-value">{{ statistics.totalVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">✅</div>
              <div class="summary-label">Processed</div>
              <div class="summary-value">{{ statistics.processedVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">⚡</div>
              <div class="summary-label">Effects Applied</div>
              <div class="summary-value">{{ statistics.effectsCount }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">💯</div>
              <div class="summary-label">Success Rate</div>
              <div class="summary-value">{{ statistics.successRate }}%</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'VideoDeduplication',
  
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🔍', label: 'Video Deduplication', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 文件相关
      uploadedFiles: [],
      fileList: [],
      currentFile: null,
      processedFile: null,
      
      // 处理模式
      processingMode: 'smart',
      activeCollapse: [],
      
      // Basic Deduplication选项
      basicOptions: [],
      basicDedupOptions: [
        { value: 'removeduplicates', label: 'Remove Duplicates' },
        { value: 'mirrorflip', label: 'Mirror Flip' },
        { value: 'randomshift', label: 'Random Position Shift' },
        { value: 'modifymd5', label: 'Modify MD5 Hash' },
        { value: 'smartextract', label: 'Smart Frame Extraction' },
        { value: 'smartcolor', label: 'Smart Color Adjustment' },
        { value: 'sharpening', label: 'Image Sharpening' },
        { value: 'randomspeed', label: 'Random Speed Variation' },
        { value: 'trimheadtail', label: 'Trim Head/Tail' },
        { value: 'randommirror', label: 'Random Mirror' }
      ],
      
      // 特效选项
      selectedEffect: null,
      specialEffects: [
        { value: 'scanline', icon: '📺', label: 'Scan Line' },
        { value: 'spotlight', icon: '💡', label: 'Spotlight' },
        { value: 'fade', icon: '🌅', label: 'Fade' },
        { value: 'booklet', icon: '📖', label: 'Booklet' },
        { value: 'dissolve', icon: '✨', label: 'Dissolve' },
        { value: 'split', icon: '📱', label: 'Split Screen' },
        { value: 'product', icon: '🛍️', label: 'Product' },
        { value: 'film', icon: '🎬', label: 'Film' },
        { value: 'drama', icon: '🎭', label: 'Drama' }
      ],
      
      // Zoom选项
      selectedZoom: null,
      zoomOptions: [
        { value: 'stretch', icon: '↔️', label: 'Stretch' },
        { value: 'compress', icon: '↕️', label: 'Compress' },
        { value: 'dynamic', icon: '🔄', label: 'Dynamic' }
      ],
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      
      // 对比信息
      originalInfo: 'Before Processing',
      processedInfo: 'After Deduplication',
      
      // 统计数据
      statistics: {
        totalVideos: 0,
        processedVideos: 0,
        effectsCount: 0,
        successRate: 100
      }
    }
  },
  
  methods: {
    // 处理菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 文件处理
    handleFileChange(file, fileList) {
      // 检查文件大小
      if (file.raw && file.raw.size > 500 * 1024 * 1024) {
        this.$message.error(`File "${file.name}" exceeds 500MB limit`)
        return false
      }
      
      // 添加文件到列表
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: this.formatFileSize(file.raw ? file.raw.size : 0),
        file: file.raw,
        url: file.url || URL.createObjectURL(file.raw),
        type: this.getFileType(file.raw)
      }
      
      this.uploadedFiles.push(fileData)
      this.fileList = fileList
      
      // 设置当前文件用于预览
      if (this.uploadedFiles.length === 1) {
        this.currentFile = fileData
      }
    },
    
    // 移除文件
    handleFileRemove(file, fileList) {
      const index = this.uploadedFiles.findIndex(f => f.name === file.name)
      if (index !== -1) {
        this.uploadedFiles.splice(index, 1)
      }
      this.fileList = fileList
      
      // 更新当前文件
      if (this.uploadedFiles.length > 0) {
        this.currentFile = this.uploadedFiles[0]
      } else {
        this.currentFile = null
        this.processedFile = null
        this.processingComplete = false
      }
    },
    
    // 移除单个文件
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
      this.fileList.splice(index, 1)
      
      if (this.uploadedFiles.length > 0) {
        this.currentFile = this.uploadedFiles[0]
      } else {
        this.currentFile = null
        this.processedFile = null
        this.processingComplete = false
      }
    },
    
    // 移除前确认
    beforeRemove(file) {
      return this.$confirm(`Remove ${file.name}?`, 'Confirm', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      })
    },
    
    // 处理模式改变
    handleModeChange(mode) {
      if (mode === 'smart') {
        // Smart Mode - 清空所有自定义选择
        this.basicOptions = []
        this.selectedEffect = null
        this.activeCollapse = []
      }
    },
    
    // 选择特效
    selectEffect(effect) {
      if (this.selectedEffect === effect) {
        this.selectedEffect = null
      } else {
        this.selectedEffect = effect
      }
    },
    
    // 开始处理
    startProcessing() {
      if (this.uploadedFiles.length === 0) {
        this.$message.warning('Please upload videos first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 模拟处理过程
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.processing = false
            this.showResults()
          }, 500)
        }
      }, 200)
    },
    
    // 显示结果
    showResults() {
      let effectsCount = 0
      
      if (this.processingMode === 'smart') {
        effectsCount = 8 // Smart Mode预设效果
      } else {
        effectsCount = this.basicOptions.length
        if (this.selectedEffect) effectsCount++
        if (this.selectedZoom) effectsCount++
      }
      
      // 更新统计
      this.statistics = {
        totalVideos: this.uploadedFiles.length,
        processedVideos: this.uploadedFiles.length,
        effectsCount: effectsCount,
        successRate: 100
      }
      
      // 设置处理后的文件（模拟）
      if (this.currentFile) {
        this.processedFile = { ...this.currentFile }
        this.processedInfo = `Processed (${this.processingMode === 'smart' ? 'Smart Mode' : 'Custom Mode'})`
      }
      
      this.processingComplete = true
      
      const modeText = this.processingMode === 'smart' ? 'Smart Mode optimization' : 'custom settings'
      this.$message.success(`Successfully processed ${this.uploadedFiles.length} video(s) with ${modeText}!`)
    },
    
    // 下载结果
    downloadResults() {
      const report = {
        processDate: new Date().toISOString(),
        mode: this.processingMode,
        totalFiles: this.uploadedFiles.length,
        settings: {
          basicOptions: this.basicOptions,
          selectedEffect: this.selectedEffect,
          selectedZoom: this.selectedZoom
        },
        files: this.uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          processed: true
        }))
      }
      
      // 创建下载
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'processing_report.json'
      a.click()
      window.URL.revokeObjectURL(url)
      
      this.$message.success('Processing report downloaded successfully!')
    },
    
    // 工具函数
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    
    getFileType(file) {
      if (!file) return 'unknown'
      if (file.type.startsWith('video/')) return 'video'
      if (file.type.startsWith('image/')) return 'image'
      return 'unknown'
    }
  }
}
</script>

<style lang="scss" scoped>
@import './VideoDeduplication.scss';
</style>