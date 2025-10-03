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
            <div class="user-plan">{{ translate('app.user.plan') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-container">
      <div class="content-wrapper">
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

        <div class="workspace">
          <div class="workspace-left">
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
                  <div class="upload-title">{{ translate('noiseReducer.upload.drop') }}</div>
                  <div class="upload-subtitle">{{ translate('noiseReducer.upload.browse') }}</div>
                  <el-button type="primary" class="upload-btn-small" @click.stop="triggerManualUpload">
                    {{ translate('noiseReducer.upload.button') }}
                  </el-button>
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

          <div class="workspace-right">
            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing || !hasFile"
                :loading="processing"
                @click="startProcessing"
              >
                <span class="btn-icon">🔇</span>
                <span>{{ processing ? translate('noiseReducer.actions.processing') : translate('noiseReducer.actions.reduce') }}</span>
              </el-button>

              <template v-if="processingComplete">
                <el-button class="action-btn btn-download-preview" @click="downloadPreview">
                  <span class="btn-icon">👁️</span>
                  <span class="btn-label">
                    {{ translate('noiseReducer.actions.preview') }}
                    <small>{{ translate('noiseReducer.actions.previewTag') }}</small>
                  </span>
                </el-button>

                <el-button type="success" class="action-btn btn-download-full" @click="downloadFull">
                  <span class="btn-icon">⬇️</span>
                  <span class="btn-label">
                    {{ translate('noiseReducer.actions.download') }}
                    <small>{{ translate('noiseReducer.actions.downloadTag') }}</small>
                  </span>
                </el-button>
              </template>

              <div v-if="processing || processingComplete" class="process-info">
                <template v-if="processing">
                  <div class="process-status">
                    <div class="status-icon">⏳</div>
                    <div class="status-text">{{ translate('noiseReducer.processing.status') }}</div>
                    <div class="status-percent">{{ Math.floor(processPercent) }}%</div>
                  </div>
                  <el-progress
                    :percentage="Math.floor(processPercent)"
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

        <div class="comparison-section">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('noiseReducer.comparison.title') }}</h2>
          </div>

          <div class="comparison-container">
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
                  <p>{{ currentFile ? currentFile.name : translate('noiseReducer.comparison.placeholderTitle') }}</p>
                  <small>{{ translate('noiseReducer.comparison.placeholderHint') }}</small>
                </div>
              </div>
            </div>

            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">{{ translate('noiseReducer.comparison.processed') }}</span>
              </div>
              <div class="video-wrapper">
                <div v-if="processingComplete" class="preview-badge">{{ translate('noiseReducer.comparison.previewLabel') }}</div>
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
                  <p>{{ translate(processing ? 'noiseReducer.status.processing' : 'noiseReducer.status.toBeProcessed') }}</p>
                  <small>{{ translate(processing ? 'noiseReducer.status.waitHint' : 'noiseReducer.status.actionHint') }}</small>
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
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🔇', labelKey: 'menu.noiseReducer', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      samples: [
        {
          type: 'podcast',
          icon: '🎙️',
          labelKey: 'noiseReducer.samples.items.podcast.label',
          titleKey: 'noiseReducer.samples.items.podcast.title'
        },
        {
          type: 'meeting',
          icon: '👥',
          labelKey: 'noiseReducer.samples.items.meeting.label',
          titleKey: 'noiseReducer.samples.items.meeting.title'
        },
        {
          type: 'outdoor',
          icon: '🌳',
          labelKey: 'noiseReducer.samples.items.outdoor.label',
          titleKey: 'noiseReducer.samples.items.outdoor.title'
        },
        {
          type: 'traffic',
          icon: '🚗',
          labelKey: 'noiseReducer.samples.items.traffic.label',
          titleKey: 'noiseReducer.samples.items.traffic.title'
        }
      ],
      uploadUrl: '#',
      fileList: [],
      currentFile: null,
      previewUrl: '',
      hasFile: false,
      processing: false,
      processingComplete: false,
      processPercent: 0,
      processTimer: null,
      originalVideoSrc: '',
      processedVideoSrc: ''
    }
  },
  beforeDestroy() {
    if (this.processTimer) {
      clearInterval(this.processTimer)
    }
  },
  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    triggerManualUpload() {
      if (this.$refs.upload) {
        this.$refs.upload.$refs['upload-inner'].handleClick()
      }
    },
    beforeUpload(file) {
      const validTypes = ['.mp4', '.mov', '.m4v', '.3gp', '.avi']
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!validTypes.includes(fileExt)) {
        this.$message.error(this.translate('noiseReducer.messages.invalidType'))
        return false
      }
      this.previewUrl = URL.createObjectURL(file)
      this.currentFile = file
      this.hasFile = true
      this.originalVideoSrc = this.previewUrl
      return false
    },
    handleExceed() {
      this.$message.warning(this.translate('noiseReducer.messages.fileLimit'))
    },
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
    loadSample(type) {
      this.currentFile = {
        name: `${type}_sample.mp4`,
        type: 'video/mp4'
      }
      this.hasFile = true
      this.originalVideoSrc = `/samples/${type}.mp4`
      this.$message.success(this.translate('noiseReducer.messages.sampleLoaded'))
    },
    startProcessing() {
      if (!this.hasFile) {
        this.$message.warning(this.translate('noiseReducer.messages.uploadRequired'))
        return
      }
      this.processing = true
      this.processPercent = 0
      if (this.processTimer) {
        clearInterval(this.processTimer)
      }
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
    completeProcessing() {
      this.processing = false
      this.processingComplete = true
      this.processedVideoSrc = this.originalVideoSrc
      this.$message.success(this.translate('noiseReducer.messages.complete'))
    },
    playProcessedVideo() {
      const video = document.querySelector('.comparison-item:last-child video')
      if (video) {
        video.play()
      }
    },
    downloadPreview() {
      this.$message.info(this.translate('noiseReducer.messages.previewDownload'))
    },
    downloadFull() {
      this.$message.success(this.translate('noiseReducer.messages.fullDownload'))
    },
    handlePreview(file) {
      console.log('Preview:', file)
    },
    handleRemove(file, fileList) {
      console.log('Remove:', file, fileList)
    },
    handleSuccess(response, file, fileList) {
      console.log('Success:', response, file, fileList)
    }
  }
}
</script>

<style scoped lang="scss">
@import './NoiseReducer.scss';
</style>
