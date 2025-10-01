<template>
  <div class="noise-reducer-page">
    <!-- Sidebar -->
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
          <div class="user-details">
            <div class="user-name">User Account</div>
            <div class="user-plan">Pro Member</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="header">
          <h1>Noise Reducer</h1>
          <p>Remove background noise from videos with AI for clear, crisp sound. Ideal for podcasts, narration, and voiceovers.</p>
        </div>

        <!-- Workspace -->
        <div class="workspace">
          <!-- Left: Upload Area -->
          <div class="workspace-left">
            <!-- Upload Container -->
            <div class="upload-container">
              <div class="section-title">Upload Media</div>
              <el-upload
                ref="upload"
                class="upload-area"
                drag
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
                :file-list="fileList"
                :show-file-list="false"
                :limit="8"
                :on-exceed="handleExceed"
                accept=".mp4,.mov,.m4v,.3gp,.avi"
                :auto-upload="false"
              >
                <div v-if="!hasFile" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">Click, drop, or paste files to upload</div>
                  <div class="upload-subtitle">Up to 8 files can be uploaded at a time</div>
                  <el-button type="primary" class="upload-btn-small">Choose Files</el-button>
                </div>
                <div v-else class="file-preview">
                  <div class="upload-success-badge">✔</div>
                  <div class="file-preview-item">
                    <video v-if="currentFile" :src="previewUrl" controls></video>
                  </div>
                  <div class="file-info">
                    <span>{{ currentFile ? currentFile.name : 'No file selected' }}</span>
                    <el-button type="danger" size="mini" @click="removeFile">✕</el-button>
                  </div>
                </div>
              </el-upload>
              <div class="supported-formats">
                Support format: .mp4, .mov, .m4v, .3gp, .avi
              </div>
            </div>

            <!-- Quick Samples -->
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
                  <div class="sample-icon">{{ sample.icon }}</div>
                  <div class="sample-text">{{ sample.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="workspace-right">
            <div class="actions-container">
              <!-- Process Button -->
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !hasFile"
                :loading="processing"
                @click="startProcessing"
              >
                <span class="btn-icon">🔇</span>
                <span>{{ processing ? 'Processing...' : 'Reduce Noise' }}</span>
              </el-button>

              <!-- Download Buttons -->
              <template v-if="processingComplete">
                <el-button
                  class="action-btn btn-download-preview"
                  @click="downloadPreview"
                >
                  <span class="btn-icon">👁️</span>
                  <span class="btn-label">
                    Download 5s Preview Video
                    <small>Free!</small>
                  </span>
                </el-button>

                <el-button
                  type="success"
                  class="action-btn btn-download-full"
                  @click="downloadFull"
                >
                  <span class="btn-icon">⬇️</span>
                  <span class="btn-label">
                    Download Full Video
                    <small>You are Pro member</small>
                  </span>
                </el-button>
              </template>

              <!-- Processing Info -->
              <div v-if="processing || processingComplete" class="process-info">
                <template v-if="processing">
                  <div class="process-status">
                    <div class="status-icon">⏳</div>
                    <div class="status-text">Processing audio...</div>
                    <div class="status-percent">{{ processPercent }}%</div>
                  </div>
                  <el-progress 
                    :percentage="processPercent" 
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <div class="process-details">
                    <small>Analyzing frequencies • Removing noise • Enhancing clarity</small>
                  </div>
                </template>
                <template v-else>
                  <div class="complete-status">
                    <div class="complete-icon">✅</div>
                    <div class="complete-text">Noise Reduction Complete!</div>
                    <div class="complete-subtitle">Your clean audio is ready</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Section -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">Audio Comparison</h2>
          </div>

          <div class="comparison-container">
            <!-- Original -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">Original</span>
              </div>
              <div class="video-wrapper">
                <video 
                  v-if="originalVideoSrc" 
                  :src="originalVideoSrc" 
                  class="comparison-video" 
                  controls
                ></video>
                <div v-else class="placeholder-info">
                  <span class="placeholder-icon">📂</span>
                  <p>{{ currentFile ? currentFile.name : 'test_video copy 2.mp4' }}</p>
                  <small>Ready to process</small>
                </div>
              </div>
            </div>

            <!-- Processed -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">After</span>
              </div>
              <div class="video-wrapper">
                <div v-if="processingComplete" class="preview-badge">5s Preview</div>
                <video 
                  v-if="processedVideoSrc" 
                  :src="processedVideoSrc" 
                  class="comparison-video" 
                  controls
                ></video>
                <div 
                  v-else-if="processingComplete && !processedVideoSrc" 
                  class="video-play-overlay" 
                  @click="playProcessedVideo"
                >
                  ▶️
                </div>
                <div v-else class="placeholder-info">
                  <span class="placeholder-icon">⏳</span>
                  <p>{{ processing ? 'Processing...' : 'To be processed' }}</p>
                  <small>{{ processing ? 'Please wait' : 'Click Reduce Noise to begin' }}</small>
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
  name: 'NoiseReducer',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🔇', label: 'Noise Reducer', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 示例文件
      samples: [
        { type: 'podcast', icon: '🎙️', label: 'Podcast', title: 'Podcast Sample' },
        { type: 'meeting', icon: '👥', label: 'Meeting', title: 'Meeting Sample' },
        { type: 'outdoor', icon: '🌳', label: 'Outdoor', title: 'Outdoor Sample' },
        { type: 'traffic', icon: '🚗', label: 'Traffic', title: 'Traffic Sample' }
      ],
      
      // 文件相关
      uploadUrl: '#',
      fileList: [],
      currentFile: null,
      previewUrl: '',
      hasFile: false,
      
      // 处理相关
      processing: false,
      processingComplete: false,
      processPercent: 0,
      processTimer: null,
      
      // 视频相关
      originalVideoSrc: '',
      processedVideoSrc: ''
    }
  },
  
  methods: {
    // 菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    
    // 文件上传前
    beforeUpload(file) {
      const validTypes = ['.mp4', '.mov', '.m4v', '.3gp', '.avi']
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      
      if (!validTypes.includes(fileExt)) {
        this.$message.error('Please upload video files only!')
        return false
      }
      
      // 创建预览URL
      this.previewUrl = URL.createObjectURL(file)
      this.currentFile = file
      this.hasFile = true
      this.originalVideoSrc = this.previewUrl
      
      return false // 阻止自动上传
    },
    
    // 文件超出限制
    handleExceed(files, fileList) {
      this.$message.warning('Maximum 8 files allowed at once')
    },
    
    // 移除文件
    removeFile() {
      this.currentFile = null
      this.previewUrl = ''
      this.hasFile = false
      this.fileList = []
      this.originalVideoSrc = ''
      this.processedVideoSrc = ''
      this.processingComplete = false
      this.processPercent = 0
    },
    
    // 加载示例
    loadSample(type) {
      // 模拟加载示例文件
      this.currentFile = {
        name: `${type}_sample.mp4`,
        type: 'video/mp4'
      }
      this.hasFile = true
      this.originalVideoSrc = `/samples/${type}.mp4` // 示例视频路径
      
      this.$message.success(`Loaded ${type} sample`)
    },
    
    // 开始处理
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning('Please upload a file first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 模拟处理进度
      this.processTimer = setInterval(() => {
        if (this.processPercent < 100) {
          this.processPercent += Math.random() * 15
          if (this.processPercent > 100) {
            this.processPercent = 100
          }
        } else {
          clearInterval(this.processTimer)
          this.completeProcessing()
        }
      }, 500)
    },
    
    // 完成处理
    completeProcessing() {
      this.processing = false
      this.processingComplete = true
      this.processedVideoSrc = this.originalVideoSrc // 实际应该是处理后的视频
      
      this.$message.success('Noise reduction completed!')
    },
    
    // 播放处理后的视频
    playProcessedVideo() {
      // 实现播放逻辑
      const video = document.querySelector('.comparison-item:last-child video')
      if (video) {
        video.play()
      }
    },
    
    // 下载预览
    downloadPreview() {
      this.$message.info('Downloading 5s preview video...')
      // 实现下载逻辑
    },
    
    // 下载完整版
    downloadFull() {
      this.$message.success('Downloading full video...')
      // 实现下载逻辑
    },
    
    // 处理文件预览
    handlePreview(file) {
      console.log('Preview:', file)
    },
    
    // 处理文件移除
    handleRemove(file, fileList) {
      console.log('Remove:', file, fileList)
    },
    
    // 处理上传成功
    handleSuccess(response, file, fileList) {
      console.log('Success:', response, file, fileList)
    }
  },
  
  beforeDestroy() {
    // 清理定时器
    if (this.processTimer) {
      clearInterval(this.processTimer)
    }
    
    // 清理URL对象
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
    }
  }
}
</script>

<style lang="scss" scoped>
@import './NoiseReducer.scss';
</style>