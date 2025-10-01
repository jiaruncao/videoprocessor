<template>
  <div class="noise-reducer-page">
    <!-- Sidebar -->
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
        <div class="nav-item user-account">
          <span>👤</span>
          <div class="user-details">
            <div class="user-name">{{ translate('app.user.account') }}</div>
            <div class="user-plan">{{ translate('app.user.proMember') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- Header -->
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
          <h1>{{ translate('noiseReducer.header.title') }}</h1>
          <p>{{ translate('noiseReducer.header.subtitle') }}</p>
        </div>

        <!-- Workspace -->
        <div class="workspace">
          <!-- Left: Upload Area -->
          <div class="workspace-left">
            <!-- Upload Container -->
            <div class="upload-container">
              <div class="section-title">{{ translate('noiseReducer.upload.title') }}</div>
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
                  <div class="upload-title">{{ translate('noiseReducer.upload.instructions') }}</div>
                  <div class="upload-subtitle">{{ translate('noiseReducer.upload.hint') }}</div>
                  <el-button type="primary" class="upload-btn-small">{{ translate('noiseReducer.upload.button') }}</el-button>
                </div>
                <div v-else class="file-preview">
                  <div class="upload-success-badge">✔</div>
                  <div class="file-preview-item">
                    <video v-if="currentFile" :src="previewUrl" controls></video>
                  </div>
                  <div class="file-info">
                    <span>{{ currentFile ? currentFile.name : translate('noiseReducer.upload.noFile') }}</span>
                    <el-button type="danger" size="mini" @click="removeFile">✕</el-button>
                  </div>
                </div>
              </el-upload>
              <div class="supported-formats">
                {{ translate('noiseReducer.upload.supported') }}
              </div>
            </div>

            <!-- Quick Samples -->
            <div class="samples-container">
              <div class="section-title">{{ translate('noiseReducer.samples.title') }}</div>
              <div class="sample-grid">
                <div
                  v-for="sample in samples"
                  :key="sample.type"
                  class="sample-item"
                  @click="loadSample(sample.type)"
                  :title="translate(sample.titleKey)"
                >
                  <div class="sample-icon">{{ sample.icon }}</div>
                  <div class="sample-text">{{ translate(sample.labelKey) }}</div>
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
                <span>{{ translate(processing ? 'noiseReducer.actions.processing' : 'noiseReducer.actions.reduce') }}</span>
              </el-button>

              <!-- Download Buttons -->
              <template v-if="processingComplete">
                <el-button
                  class="action-btn btn-download-preview"
                  @click="downloadPreview"
                >
                  <span class="btn-icon">👁️</span>
                  <span class="btn-label">
                    {{ translate('noiseReducer.actions.preview') }}
                    <small>{{ translate('noiseReducer.actions.previewSubtitle') }}</small>
                  </span>
                </el-button>

                <el-button
                  type="success"
                  class="action-btn btn-download-full"
                  @click="downloadFull"
                >
                  <span class="btn-icon">⬇️</span>
                  <span class="btn-label">
                    {{ translate('noiseReducer.actions.downloadFull') }}
                    <small>{{ translate('noiseReducer.actions.downloadFullSubtitle') }}</small>
                  </span>
                </el-button>
              </template>

              <!-- Processing Info -->
              <div v-if="processing || processingComplete" class="process-info">
                <template v-if="processing">
                  <div class="process-status">
                    <div class="status-icon">⏳</div>
                    <div class="status-text">{{ translate('noiseReducer.processing.inProgress') }}</div>
                    <div class="status-percent">{{ processPercent }}%</div>
                  </div>
                  <el-progress
                    :percentage="processPercent"
                    :stroke-width="8"
                    :show-text="false"
                  />
                  <div class="process-details">
                    <small>{{ translate('noiseReducer.processing.details') }}</small>
                  </div>
                </template>
                <template v-else>
                  <div class="complete-status">
                    <div class="complete-icon">✅</div>
                    <div class="complete-text">{{ translate('noiseReducer.processing.completeTitle') }}</div>
                    <div class="complete-subtitle">{{ translate('noiseReducer.processing.completeSubtitle') }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Section -->
        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('noiseReducer.comparison.title') }}</h2>
          </div>

          <div class="comparison-container">
            <!-- Original -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">{{ translate('noiseReducer.comparison.original') }}</span>
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
                  <p>{{ currentFile ? currentFile.name : translate('noiseReducer.comparison.defaultFileName') }}</p>
                  <small>{{ translate('noiseReducer.comparison.ready') }}</small>
                </div>
              </div>
            </div>

            <!-- Processed -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">{{ translate('noiseReducer.comparison.processed') }}</span>
              </div>
              <div class="video-wrapper">
                <div v-if="processingComplete" class="preview-badge">{{ translate('noiseReducer.processing.previewBadge') }}</div>
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
                  <p>{{ translate(processing ? 'noiseReducer.processing.placeholderProcessing' : 'noiseReducer.processing.placeholderPending') }}</p>
                  <small>{{ translate(processing ? 'noiseReducer.processing.placeholderWaitHint' : 'noiseReducer.processing.placeholderStartHint') }}</small>
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
  name: 'NoiseReducer',
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      // 菜单项
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🔇', labelKey: 'menu.noiseReducer', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],

      // 示例文件
      samples: [
        { type: 'podcast', icon: '🎙️', labelKey: 'noiseReducer.samples.podcast.label', titleKey: 'noiseReducer.samples.podcast.title' },
        { type: 'meeting', icon: '👥', labelKey: 'noiseReducer.samples.meeting.label', titleKey: 'noiseReducer.samples.meeting.title' },
        { type: 'outdoor', icon: '🌳', labelKey: 'noiseReducer.samples.outdoor.label', titleKey: 'noiseReducer.samples.outdoor.title' },
        { type: 'traffic', icon: '🚗', labelKey: 'noiseReducer.samples.traffic.label', titleKey: 'noiseReducer.samples.traffic.title' }
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
    translate(key) {
      return translateText(this.locale, key)
    },

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
        this.$message.error(this.translate('noiseReducer.messages.invalidFile'))
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
      this.$message.warning(this.translate('noiseReducer.messages.exceedLimit'))
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

      this.$message.success(this.translate(`noiseReducer.messages.sampleLoaded.${type}`))
    },
    
    // 开始处理
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning(this.translate('noiseReducer.messages.uploadRequired'))
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

      this.$message.success(this.translate('noiseReducer.messages.processingComplete'))
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
      this.$message.info(this.translate('noiseReducer.messages.downloadPreview'))
      // 实现下载逻辑
    },

    // 下载完整版
    downloadFull() {
      this.$message.success(this.translate('noiseReducer.messages.downloadFull'))
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