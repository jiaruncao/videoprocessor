<template>
  <DashboardLayout
    page-class="video-background-remover-page"
    :menu-items="menuItems"
    :locale="locale"
    :available-locales="availableLocales"
    :brand="translate('app.brand')"
    :title="translate('backgroundRemover.header.title')"
    :subtitle="translate('backgroundRemover.header.subtitle')"
    :user-name="translate('app.user.account')"
    :user-plan="translate('app.user.plan')"
    :translate="translate"
    @select-menu="handleMenuClick"
    @change-locale="handleLocaleChange"
  >
    <div class="workspace">
          <div class="workspace-left">
            <div class="upload-container">
              <div class="section-title">{{ translate('backgroundRemover.upload.title') }}</div>
              <div
                :class="['upload-area', { 'has-file': hasFile, dragover: isDragover }]"
                @drop.prevent="handleDrop"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">{{ translate('backgroundRemover.upload.drop') }}</div>
                  <div class="upload-subtitle">{{ translate('backgroundRemover.upload.browse') }}</div>
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
                      class="remove-file"
                      @click.stop="removeFile"
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

          <div class="workspace-right">
            <div class="settings-container">
              <div class="section-title">{{ translate('backgroundRemover.settings.title') }}</div>
              <el-radio-group v-model="backgroundMode" @change="handleBackgroundChange" class="background-options">
                <label
                  v-for="option in backgroundOptions"
                  :key="option.value"
                  class="bg-option"
                >
                  <el-radio :label="option.value" class="custom-radio">
                    <div class="bg-content">
                      <div :class="['bg-icon', option.value]"></div>
                      <span class="bg-title">{{ translate(option.labelKey) }}</span>
                    </div>
                  </el-radio>
                </label>
              </el-radio-group>
              <el-alert :closable="false" type="info" class="test-mode-info">
                <template slot="title">
                  <strong>{{ translate('backgroundRemover.processing.testModeLabel') }}</strong>
                  {{ translateWithParams('backgroundRemover.processing.testModeMessage', { fileName: testFileName }) }}
                </template>
              </el-alert>
            </div>

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
                <span class="btn-subtitle">{{ translate('backgroundRemover.actions.previewTag') }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadFull"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('backgroundRemover.actions.download') }}
                <span class="btn-subtitle">{{ translate('backgroundRemover.actions.downloadTag') }}</span>
              </el-button>

              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('backgroundRemover.processing.status') }}</div>
                  <div class="status-percent">{{ Math.floor(processPercent) }}%</div>
                </div>
                <el-progress
                  :percentage="Math.floor(processPercent)"
                  :stroke-width="8"
                  :show-text="false"
                  class="progress-bar"
                />
                <div class="process-details">
                  <small>{{ translate('backgroundRemover.processing.details') }}</small>
                </div>
              </div>

              <div v-if="showSuccess" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">{{ translate('backgroundRemover.processing.completeTitle') }}</div>
                <div class="complete-subtitle">{{ translate('backgroundRemover.processing.completeSubtitle') }}</div>
              </div>
            </div>
          </div>
        </div>

    <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('backgroundRemover.comparison.title') }}</h2>
          </div>
          <div class="comparison-container">
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
                  <el-button type="text" class="control-btn" @click="togglePlay('original')">
                    {{ isPlaying ? '⏸️' : '▶️' }}
                  </el-button>
                  <span class="preview-time">{{ translate('backgroundRemover.comparison.previewLabel') }}</span>
                </div>
                <div v-if="!hasFile" class="upload-placeholder">
                  <div class="placeholder-info">
                    <span class="placeholder-icon">📂</span>
                    <p>{{ translate('backgroundRemover.comparison.uploadPlaceholderTitle') }}</p>
                    <small>{{ translate('backgroundRemover.comparison.uploadPlaceholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>

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
                  <el-button type="text" class="control-btn" @click="togglePlay('processed')">
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
  </DashboardLayout>
</template>

<script>
import DashboardLayout from './components/dashboard/DashboardLayout.vue'
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'VideoBackgroundRemover',
  components: {
    DashboardLayout
  },
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🎥', labelKey: 'menu.backgroundRemover', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      backgroundOptions: [
        { value: 'green', labelKey: 'backgroundRemover.settings.green' },
        { value: 'transparent', labelKey: 'backgroundRemover.settings.transparent' }
      ],
      currentFile: null,
      fileName: '',
      previewUrl: '',
      filePreview: false,
      hasFile: false,
      uploadSuccess: false,
      isDragover: false,
      backgroundMode: 'green',
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonTextKey: 'backgroundRemover.actions.remove',
      showSuccess: false,
      canvasWidth: 640,
      canvasHeight: 480,
      originalVideo: null,
      processedVideo: null,
      originalCtx: null,
      processedCtx: null,
      animationId: null,
      isPlaying: false,
      showOriginalControls: false,
      showProcessedControls: false,
      originalInfoKey: 'backgroundRemover.comparison.originalInfo',
      processedInfoKey: 'backgroundRemover.comparison.processedInfo.default',
      placeholderTextKey: 'backgroundRemover.comparison.placeholderText',
      placeholderHintKey: 'backgroundRemover.comparison.placeholderHint',
      testFileName: 'test_video copy 2.mp4'
    }
  },
  mounted() {
    this.initCanvas()
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },
    handleLocaleChange(newLocale) {
      this.locale = newLocale
    },
    translateWithParams(key, params = {}) {
      let text = translateText(this.locale, key)
      Object.keys(params).forEach((param) => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param])
      })
      return text
    },
    initCanvas() {
      this.$nextTick(() => {
        if (this.$refs.originalCanvas) {
          this.originalCtx = this.$refs.originalCanvas.getContext('2d')
          this.originalCtx.fillStyle = '#000'
          this.originalCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        }
        if (this.$refs.processedCanvas) {
          this.processedCtx = this.$refs.processedCanvas.getContext('2d')
          this.processedCtx.fillStyle = '#000'
          this.processedCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
        }
      })
    },
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    triggerFileInput() {
      if (!this.hasFile && this.$refs.fileInput) {
        this.$refs.fileInput.click()
      }
    },
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
    handleFileSelect(e) {
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files)
      }
    },
    handleFiles(files) {
      if (files.length > 8) {
        this.$message.error(this.translate('backgroundRemover.messages.fileLimit'))
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
      setTimeout(() => {
        this.uploadSuccess = true
        this.hasFile = true
        this.showVideoInCanvas()
        this.resetProcessingState()
      }, 500)
    },
    displayPreview(file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        this.previewUrl = event.target.result
        this.filePreview = true
      }
      reader.readAsDataURL(file)
    },
    showVideoInCanvas() {
      this.originalVideo = document.createElement('video')
      this.originalVideo.src = this.previewUrl
      this.originalVideo.crossOrigin = 'anonymous'
      this.originalVideo.muted = true
      this.originalVideo.loop = true
      this.originalVideo.onloadeddata = () => {
        this.drawOriginalFrame()
        this.showOriginalControls = true
      }
      this.originalVideo.play()
    },
    drawOriginalFrame() {
      if (!this.originalCtx || !this.originalVideo) return
      this.originalCtx.drawImage(this.originalVideo, 0, 0, this.canvasWidth, this.canvasHeight)
      this.animationId = requestAnimationFrame(() => this.drawOriginalFrame())
    },
    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
      if (this.originalVideo) {
        this.originalVideo.pause()
        this.originalVideo = null
      }
    },
    removeFile() {
      this.currentFile = null
      this.fileName = ''
      this.previewUrl = ''
      this.filePreview = false
      this.uploadSuccess = false
      this.hasFile = false
      this.resetProcessingState()
      this.showOriginalControls = false
      this.showProcessedControls = false
      this.processedInfoKey = 'backgroundRemover.comparison.processedInfo.default'
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      if (this.originalCtx) {
        this.originalCtx.fillStyle = '#000'
        this.originalCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
      if (this.processedCtx) {
        this.processedCtx.fillStyle = '#000'
        this.processedCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
    },
    handleBackgroundChange() {
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    resetToReprocess() {
      this.buttonTextKey = 'backgroundRemover.actions.reprocess'
      this.processingComplete = false
      this.showProcessedControls = false
      this.showSuccess = false
      this.placeholderTextKey = 'backgroundRemover.comparison.settingsChanged'
      this.placeholderHintKey = 'backgroundRemover.comparison.reprocessHint'
      if (this.processedCtx) {
        this.processedCtx.fillStyle = '#000'
        this.processedCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      }
    },
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonTextKey = 'backgroundRemover.actions.remove'
      this.showSuccess = false
      this.placeholderTextKey = 'backgroundRemover.comparison.placeholderText'
      this.placeholderHintKey = 'backgroundRemover.comparison.placeholderHint'
    },
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning(this.translate('backgroundRemover.messages.uploadRequired'))
        return
      }
      this.processing = true
      this.processPercent = 0
      this.showSuccess = false
      const interval = setInterval(() => {
        this.processPercent += Math.random() * 15
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.showSuccess = true
            this.showProcessedResult()
            setTimeout(() => {
              this.showSuccess = false
            }, 3000)
          }, 500)
        }
      }, 200)
    },
    showProcessedResult() {
      this.processedInfoKey =
        this.backgroundMode === 'green'
          ? 'backgroundRemover.comparison.processedInfo.green'
          : 'backgroundRemover.comparison.processedInfo.transparent'
      this.showProcessedControls = true
      this.processedVideo = true
      if (this.originalVideo) {
        this.drawProcessedFrame()
      }
    },
    drawProcessedFrame() {
      if (!this.processedCtx) return
      const width = this.canvasWidth
      const height = this.canvasHeight
      this.processedCtx.clearRect(0, 0, width, height)
      if (this.backgroundMode === 'green') {
        this.processedCtx.fillStyle = '#00ff00'
        this.processedCtx.fillRect(0, 0, width, height)
      } else {
        const blockSize = 20
        for (let y = 0; y < height; y += blockSize) {
          for (let x = 0; x < width; x += blockSize) {
            this.processedCtx.fillStyle =
              (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0
                ? '#e2e8f0'
                : '#cbd5e1'
            this.processedCtx.fillRect(x, y, blockSize, blockSize)
          }
        }
      }
      if (this.originalVideo && this.originalVideo.readyState >= 2) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = width
        tempCanvas.height = height
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.drawImage(this.originalVideo, 0, 0, width, height)
        const imageData = tempCtx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (g > r + b) {
            data[i + 3] = 0
          }
        }
        tempCtx.putImageData(imageData, 0, 0)
        this.processedCtx.drawImage(tempCanvas, 0, 0, width, height)
      }
    },
    togglePlay(type) {
      if (!this.originalVideo) return
      if (this.isPlaying) {
        this.originalVideo.pause()
        cancelAnimationFrame(this.animationId)
        this.isPlaying = false
      } else {
        this.originalVideo.play()
        if (type === 'processed') {
          this.drawProcessedFrame()
        } else {
          this.drawOriginalFrame()
        }
        this.isPlaying = true
      }
    },
    downloadPreview() {
      this.$message.success(this.translate('backgroundRemover.messages.previewDownload'))
    },
    downloadFull() {
      this.$message.info(this.translate('backgroundRemover.messages.fullDownload'))
    }
  }
}
</script>

<style scoped lang="scss">
@import './VideoBackgroundRemover.scss';
</style>
