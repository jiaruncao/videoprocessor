<template>
  <div class="video-deduplication-page">
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
            <div class="user-plan">{{ translate('app.user.plan') }}</div>
          </div>
        </div>
      </div>
    </aside>

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
          <h1>{{ translate('deduplication.header.title') }}</h1>
          <p>{{ translate('deduplication.header.subtitle') }}</p>
        </div>

        <div class="workspace">
          <div class="workspace-left">
            <div class="upload-container">
              <div class="section-title">
                <span class="section-icon">📁</span>
                {{ translate('deduplication.upload.title') }}
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
                  <div class="upload-title">{{ translate('deduplication.upload.drop') }}</div>
                  <div class="upload-subtitle">{{ translate('deduplication.upload.browse') }}</div>
                  <el-button class="upload-btn-small">{{ translate('deduplication.upload.button') }}</el-button>
                </div>
                <div v-else class="files-list">
                  <div v-for="(file, index) in uploadedFiles" :key="file.id" class="file-item">
                    <div class="file-icon">🎥</div>
                    <div class="file-details">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-info-text">{{ file.size }}</div>
                    </div>
                    <el-button type="text" class="remove-file" @click.stop="removeFile(index)">✕</el-button>
                  </div>
                </div>
              </el-upload>
              <div class="supported-formats">
                {{ translate('deduplication.upload.supported') }}
              </div>
            </div>

            <div class="actions-container">
              <el-button
                type="primary"
                class="action-btn btn-process"
                :disabled="uploadedFiles.length === 0 || processing"
                @click="startProcessing"
              >
                <span class="btn-icon">🚀</span>
                <span>{{ processing ? translate('deduplication.actions.processing') : translate('deduplication.actions.start') }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadResults"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('deduplication.actions.download') }}
              </el-button>

              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('deduplication.processing.status') }}</div>
                  <div class="status-percent">{{ Math.floor(processPercent) }}%</div>
                </div>
                <el-progress :percentage="Math.floor(processPercent)" :stroke-width="8" color="#6366f1" />
              </div>
            </div>
          </div>

          <div class="workspace-right">
            <div class="settings-container">
              <div class="section-title">
                <span class="section-icon">⚙️</span>
                {{ translate('deduplication.settings.modeTitle') }}
              </div>
              <el-radio-group v-model="processingMode" class="mode-cards" @change="handleModeChange">
                <el-radio label="smart" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'smart' }">
                    <div class="mode-card-icon">🧠</div>
                    <div class="mode-card-title">{{ translate('deduplication.settings.smart.title') }}</div>
                    <div class="mode-card-desc">{{ translate('deduplication.settings.smart.desc') }}</div>
                  </div>
                </el-radio>
                <el-radio label="custom" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'custom' }">
                    <div class="mode-card-icon">⚡</div>
                    <div class="mode-card-title">{{ translate('deduplication.settings.custom.title') }}</div>
                    <div class="mode-card-desc">{{ translate('deduplication.settings.custom.desc') }}</div>
                  </div>
                </el-radio>
              </el-radio-group>

              <transition name="fade">
                <div v-show="processingMode === 'custom'" id="customSettings">
                  <el-collapse v-model="activeCollapse" class="custom-collapse">
                    <el-collapse-item name="basic">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>🔧</span>
                          <span>{{ translate('deduplication.settings.basic.title') }}</span>
                        </div>
                      </template>
                      <div class="checkbox-group">
                        <el-checkbox-group v-model="basicOptions">
                          <div class="checkbox-item" v-for="option in basicDedupOptions" :key="option.value">
                            <el-checkbox :label="option.value">
                              {{ translate(option.labelKey) }}
                            </el-checkbox>
                          </div>
                        </el-checkbox-group>
                      </div>
                    </el-collapse-item>

                    <el-collapse-item name="effects">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>✨</span>
                          <span>{{ translate('deduplication.settings.effects.title') }}</span>
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
                          <span>{{ translate(effect.labelKey) }}</span>
                        </button>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </transition>
            </div>

            <div class="settings-container zoom-settings">
              <div class="section-title">
                <span class="section-icon">🔍</span>
                {{ translate('deduplication.settings.zoom.title') }}
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
                    <span class="zoom-label">{{ translate(zoom.labelKey) }}</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>

        <div class="comparison-section" v-if="uploadedFiles.length > 0">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('deduplication.comparison.title') }}</h2>
          </div>
          <div class="comparison-container">
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">{{ translate('deduplication.comparison.original') }}</span>
                <span class="label-info">{{ translate(originalInfoKey) }}</span>
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
                    <p>{{ translate('deduplication.comparison.placeholderTitle') }}</p>
                    <small>{{ translate('deduplication.comparison.placeholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="comparison-divider">
              <div class="divider-icon">VS</div>
            </div>

            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge processed">{{ translate('deduplication.comparison.processed') }}</span>
                <span class="label-info">{{ translate(processedInfoKey) }}</span>
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
                    <p>{{ translate('deduplication.comparison.processPlaceholderTitle') }}</p>
                    <small>{{ translate('deduplication.comparison.processPlaceholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="processingComplete" class="results-section">
          <h2 class="results-title">{{ translate('deduplication.summary.title') }}</h2>
          <div class="results-summary">
            <div class="summary-card">
              <div class="summary-icon">📹</div>
              <div class="summary-label">{{ translate('deduplication.summary.original') }}</div>
              <div class="summary-value">{{ statistics.totalVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">✅</div>
              <div class="summary-label">{{ translate('deduplication.summary.processed') }}</div>
              <div class="summary-value">{{ statistics.processedVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">⚡</div>
              <div class="summary-label">{{ translate('deduplication.summary.effects') }}</div>
              <div class="summary-value">{{ statistics.effectsCount }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">💯</div>
              <div class="summary-label">{{ translate('deduplication.summary.success') }}</div>
              <div class="summary-value">{{ statistics.successRate }}%</div>
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
  name: 'VideoDeduplication',
  data() {
    return {
      availableLocales: supportedLocales,
      locale: 'en-US',
      menuItems: [
        { icon: '📊', labelKey: 'menu.dashboard', active: false },
        { icon: '✨', labelKey: 'menu.videoEnhancer', active: false },
        { icon: '🧹', labelKey: 'menu.watermarkRemover', active: false },
        { icon: '🔍', labelKey: 'menu.videoDeduplication', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '🔊', labelKey: 'menu.audioEnhancement', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      uploadedFiles: [],
      fileList: [],
      currentFile: null,
      processedFile: null,
      processingMode: 'smart',
      activeCollapse: [],
      basicOptions: [],
      basicDedupOptions: [
        { value: 'removeduplicates', labelKey: 'deduplication.options.basic.removeDuplicates' },
        { value: 'mirrorflip', labelKey: 'deduplication.options.basic.mirrorFlip' },
        { value: 'randomshift', labelKey: 'deduplication.options.basic.randomShift' },
        { value: 'modifymd5', labelKey: 'deduplication.options.basic.modifyMd5' },
        { value: 'smartextract', labelKey: 'deduplication.options.basic.smartExtract' },
        { value: 'smartcolor', labelKey: 'deduplication.options.basic.smartColor' },
        { value: 'sharpening', labelKey: 'deduplication.options.basic.sharpening' },
        { value: 'randomspeed', labelKey: 'deduplication.options.basic.randomSpeed' },
        { value: 'trimheadtail', labelKey: 'deduplication.options.basic.trimHeadTail' },
        { value: 'randommirror', labelKey: 'deduplication.options.basic.randomMirror' }
      ],
      selectedEffect: null,
      specialEffects: [
        { value: 'scanline', icon: '📺', labelKey: 'deduplication.options.effects.scanLine' },
        { value: 'spotlight', icon: '💡', labelKey: 'deduplication.options.effects.spotlight' },
        { value: 'fade', icon: '🌅', labelKey: 'deduplication.options.effects.fade' },
        { value: 'booklet', icon: '📖', labelKey: 'deduplication.options.effects.booklet' },
        { value: 'dissolve', icon: '✨', labelKey: 'deduplication.options.effects.dissolve' },
        { value: 'split', icon: '📱', labelKey: 'deduplication.options.effects.splitScreen' },
        { value: 'product', icon: '🛍️', labelKey: 'deduplication.options.effects.product' },
        { value: 'film', icon: '🎬', labelKey: 'deduplication.options.effects.film' },
        { value: 'drama', icon: '🎭', labelKey: 'deduplication.options.effects.drama' }
      ],
      selectedZoom: null,
      zoomOptions: [
        { value: 'stretch', icon: '↔️', labelKey: 'deduplication.options.zoom.stretch' },
        { value: 'compress', icon: '↕️', labelKey: 'deduplication.options.zoom.compress' },
        { value: 'dynamic', icon: '🔄', labelKey: 'deduplication.options.zoom.dynamic' }
      ],
      processing: false,
      processingComplete: false,
      processPercent: 0,
      originalInfoKey: 'deduplication.comparison.originalInfo',
      processedInfoKey: 'deduplication.comparison.processedInfo.default',
      statistics: {
        totalVideos: 0,
        processedVideos: 0,
        effectsCount: 0,
        successRate: 100
      }
    }
  },
  methods: {
    translate(key) {
      return translateText(this.locale, key)
    },
    translateWithParams(key, params = {}) {
      let text = translateText(this.locale, key)
      Object.keys(params).forEach((param) => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param])
      })
      return text
    },
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    handleFileChange(file, fileList) {
      if (file.raw && file.raw.size > 500 * 1024 * 1024) {
        this.$message.error(
          this.translateWithParams('deduplication.messages.fileTooLarge', { file: file.name })
        )
        return false
      }
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
      this.currentFile = fileData
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      this.uploadedFiles = this.uploadedFiles.filter((item) => item.name !== file.name)
      if (this.currentFile && this.currentFile.name === file.name) {
        this.currentFile = null
      }
      if (this.processedFile && this.processedFile.name === file.name) {
        this.processedFile = null
        this.processedInfoKey = 'deduplication.comparison.processedInfo.default'
      }
    },
    beforeRemove(file) {
      this.uploadedFiles = this.uploadedFiles.filter((item) => item.name !== file.name)
    },
    removeFile(index) {
      const [removed] = this.uploadedFiles.splice(index, 1)
      this.fileList = this.fileList.filter((item) => item.name !== removed.name)
      if (this.currentFile && this.currentFile.name === removed.name) {
        this.currentFile = null
      }
    },
    handleModeChange() {
      if (this.processingMode === 'smart') {
        this.basicOptions = []
        this.selectedEffect = null
        this.selectedZoom = null
        this.activeCollapse = []
      }
    },
    selectEffect(effect) {
      this.selectedEffect = this.selectedEffect === effect ? null : effect
    },
    startProcessing() {
      if (this.uploadedFiles.length === 0) {
        this.$message.warning(this.translate('deduplication.messages.uploadRequired'))
        return
      }
      this.processing = true
      this.processPercent = 0
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
    showResults() {
      let effectsCount = 0
      if (this.processingMode === 'smart') {
        effectsCount = 8
      } else {
        effectsCount = this.basicOptions.length
        if (this.selectedEffect) effectsCount += 1
        if (this.selectedZoom) effectsCount += 1
      }
      this.statistics = {
        totalVideos: this.uploadedFiles.length,
        processedVideos: this.uploadedFiles.length,
        effectsCount,
        successRate: 100
      }
      if (this.currentFile) {
        this.processedFile = { ...this.currentFile }
        this.processedInfoKey =
          this.processingMode === 'smart'
            ? 'deduplication.comparison.processedInfo.smart'
            : 'deduplication.comparison.processedInfo.custom'
      }
      this.processingComplete = true
      const modeText =
        this.processingMode === 'smart'
          ? this.translate('deduplication.messages.modeSmart')
          : this.translate('deduplication.messages.modeCustom')
      this.$message.success(
        this.translateWithParams('deduplication.messages.processedSummary', {
          count: this.uploadedFiles.length,
          mode: modeText
        })
      )
    },
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
        files: this.uploadedFiles.map((f) => ({
          name: f.name,
          size: f.size,
          processed: true
        }))
      }
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = this.translate('deduplication.report.fileName')
      a.click()
      window.URL.revokeObjectURL(url)
      this.$message.success(this.translate('deduplication.messages.reportDownloaded'))
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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
