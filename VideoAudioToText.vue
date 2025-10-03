<template>
  <DashboardLayout
    page-class="video-audio-to-text-page"
    :menu-items="menuItems"
    :locale="locale"
    :available-locales="availableLocales"
    :brand="translate('app.brand')"
    :title="translate('transcription.header.title')"
    :subtitle="translate('transcription.header.subtitle')"
    :user-name="translate('app.user.account')"
    :user-plan="translate('app.user.plan')"
    :translate="translate"
    @select-menu="handleMenuClick"
    @change-locale="handleLocaleChange"
  >
    <!-- Workspace -->
    <div class="workspace">
          <!-- Left: Upload Area -->
          <div class="workspace-left">
            <!-- Upload Container -->
            <div class="upload-container">
              <div class="section-title">{{ translate('transcription.upload.title') }}</div>
              <div
                :class="['upload-area', { 'has-file': hasFile, dragover: isDragover }]"
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>

                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">{{ translate('transcription.upload.drop') }}</div>
                  <div class="upload-subtitle">{{ translate('transcription.upload.browse') }}</div>
                  <el-button type="primary" size="small" class="upload-btn-small">
                    {{ translate('transcription.upload.button') }}
                  </el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    class="file-input"
                    accept=".mp4,.mov,.m4v,.mp3,.wav,.m4a,.aac"
                    @change="handleFileSelect"
                    style="display: none;"
                  >
                </div>

                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <div class="media-preview">
                      <div class="media-icon">{{ mediaIcon }}</div>
                      <div class="media-info">
                        <div class="media-name">{{ fileName }}</div>
                        <div class="media-duration">{{ translate('transcription.upload.duration') }}: {{ mediaDuration }}</div>
                      </div>
                      <div v-if="showWaveform" class="audio-waveform">
                        <div v-for="n in 20" :key="n" class="wave-bar"></div>
                      </div>
                    </div>
                  </div>
                  <div class="file-info">
                    <span>{{ fileName }}</span>
                    <el-button type="danger" size="mini" @click.stop="removeFile">✕</el-button>
                  </div>
                </div>
              </div>
              <div class="supported-formats">
                {{ translate('transcription.upload.supported') }}
              </div>
            </div>

            <!-- Samples -->
            <div class="samples-container">
              <div class="section-title">{{ translate('transcription.samples.title') }}</div>
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

          <!-- Right: Settings & Actions -->
          <div class="workspace-right">
            <div class="settings-container">
              <div class="section-title">{{ translate('transcription.settings.title') }}</div>

              <div class="setting-group">
                <div class="setting-label">{{ translate('transcription.settings.language.label') }}</div>
                <el-select
                  v-model="languageSelect"
                  :placeholder="translate('transcription.settings.language.placeholder')"
                  class="language-select-element"
                  @change="handleLanguageChange"
                >
                  <el-option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :label="translate(option.labelKey)"
                    :value="option.value"
                  ></el-option>
                </el-select>
              </div>

              <div class="setting-group">
                <div class="setting-label">{{ translate('transcription.translation.title') }}</div>
                <div class="translation-toggle">
                  <el-switch
                    v-model="enableTranslation"
                    active-color="#6366f1"
                    @change="handleTranslationToggle"
                  >
                  </el-switch>
                  <span class="toggle-label">{{ translate('transcription.translation.toggle') }}</span>
                </div>
                <transition name="slide">
                  <div v-if="enableTranslation" class="translation-language-wrapper">
                    <div class="setting-sublabel">{{ translate('transcription.translation.to') }}</div>
                    <el-select
                      v-model="translationLanguage"
                      :placeholder="translate('transcription.translation.placeholder')"
                      class="language-select-element"
                      @change="handleTranslationLanguageChange"
                    >
                      <el-option
                        v-for="option in translationLanguageOptions"
                        :key="option.value"
                        :label="translate(option.labelKey)"
                        :value="option.value"
                      ></el-option>
                    </el-select>
                  </div>
                </transition>
              </div>

              <div class="setting-group">
                <div class="setting-label">{{ translate('transcription.output.title') }}</div>
                <el-radio-group v-model="outputFormat" @change="handleFormatChange" class="format-options">
                  <div class="format-option">
                    <el-radio label="txt" class="format-radio">
                      <div class="format-content">
                        <span class="format-icon">📄</span>
                        <span class="format-title">{{ translate('transcription.output.options.txt') }}</span>
                      </div>
                    </el-radio>
                  </div>
                  <div class="format-option">
                    <el-radio label="srt" class="format-radio">
                      <div class="format-content">
                        <span class="format-icon">📺</span>
                        <span class="format-title">{{ translate('transcription.output.options.srt') }}</span>
                      </div>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>
            </div>

            <div class="actions-container">
              <el-button
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing"
                @click="startTranscription"
              >
                <span class="btn-icon">🎯</span>
                <span>{{ translate(buttonTextKey) }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadTranscription"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('transcription.actions.download') }}
              </el-button>

              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('transcription.processing.status') }}</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress
                  :percentage="processPercent"
                  :stroke-width="8"
                  :show-text="false"
                  class="progress-bar"
                />
                <div class="process-details">
                  <small>{{ processDetails }}</small>
                </div>
              </div>

              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">{{ translate('transcription.processing.completeTitle') }}</div>
                <div class="complete-subtitle">{{ translate('transcription.processing.completeSubtitle') }}</div>
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
  name: 'VideoAudioToText',
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
        { icon: '📝', labelKey: 'menu.speechToText', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '🔊', labelKey: 'menu.audioEnhancement', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      samples: [
        {
          type: 'interview',
          icon: '🎙️',
          titleKey: 'transcription.samples.items.interview.title',
          labelKey: 'transcription.samples.items.interview.label'
        },
        {
          type: 'podcast',
          icon: '🎧',
          titleKey: 'transcription.samples.items.podcast.title',
          labelKey: 'transcription.samples.items.podcast.label'
        },
        {
          type: 'meeting',
          icon: '💼',
          titleKey: 'transcription.samples.items.meeting.title',
          labelKey: 'transcription.samples.items.meeting.label'
        },
        {
          type: 'lecture',
          icon: '🎓',
          titleKey: 'transcription.samples.items.lecture.title',
          labelKey: 'transcription.samples.items.lecture.label'
        }
      ],
      languageOptions: [
        { value: 'auto', labelKey: 'transcription.settings.language.options.auto' },
        { value: 'en', labelKey: 'transcription.settings.language.options.en' },
        { value: 'zh', labelKey: 'transcription.settings.language.options.zh' },
        { value: 'zh-tw', labelKey: 'transcription.settings.language.options.zh-tw' },
        { value: 'es', labelKey: 'transcription.settings.language.options.es' },
        { value: 'fr', labelKey: 'transcription.settings.language.options.fr' },
        { value: 'de', labelKey: 'transcription.settings.language.options.de' },
        { value: 'ja', labelKey: 'transcription.settings.language.options.ja' },
        { value: 'ko', labelKey: 'transcription.settings.language.options.ko' },
        { value: 'ar', labelKey: 'transcription.settings.language.options.ar' },
        { value: 'ru', labelKey: 'transcription.settings.language.options.ru' },
        { value: 'pt', labelKey: 'transcription.settings.language.options.pt' }
      ],
      translationLanguageOptions: [
        { value: 'en', labelKey: 'transcription.translation.languages.en' },
        { value: 'zh', labelKey: 'transcription.translation.languages.zh' },
        { value: 'zh-tw', labelKey: 'transcription.translation.languages.zh-tw' },
        { value: 'es', labelKey: 'transcription.translation.languages.es' },
        { value: 'fr', labelKey: 'transcription.translation.languages.fr' },
        { value: 'de', labelKey: 'transcription.translation.languages.de' },
        { value: 'ja', labelKey: 'transcription.translation.languages.ja' },
        { value: 'ko', labelKey: 'transcription.translation.languages.ko' },
        { value: 'ar', labelKey: 'transcription.translation.languages.ar' },
        { value: 'ru', labelKey: 'transcription.translation.languages.ru' },
        { value: 'pt', labelKey: 'transcription.translation.languages.pt' },
        { value: 'it', labelKey: 'transcription.translation.languages.it' },
        { value: 'nl', labelKey: 'transcription.translation.languages.nl' },
        { value: 'hi', labelKey: 'transcription.translation.languages.hi' },
        { value: 'th', labelKey: 'transcription.translation.languages.th' }
      ],
      currentFile: null,
      isDragover: false,
      hasFile: false,
      uploadSuccess: false,
      filePreview: false,
      fileName: '',
      mediaIcon: '🎵',
      mediaDuration: '00:00',
      showWaveform: false,
      languageSelect: 'auto',
      enableTranslation: false,
      translationLanguage: 'en',
      outputFormat: 'txt',
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonTextKey: 'transcription.actions.start',
      processDetails: '',
      transcriptionText: ''
    }
  },
  created() {
    this.updateProcessDetails()
  },
  watch: {
    locale() {
      this.updateProcessDetails()
    }
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
    getLanguageName(code) {
      const key = `transcription.translation.languages.${code}`
      const translated = translateText(this.locale, key)
      return translated === key ? code : translated
    },
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
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
      if (!this.hasFile) {
        this.handleFiles(e.dataTransfer.files)
      }
    },
    triggerFileInput() {
      if (!this.hasFile && this.$refs.fileInput) {
        this.$refs.fileInput.click()
      }
    },
    handleFileSelect(event) {
      this.handleFiles(event.target.files)
    },
    handleFiles(files) {
      if (files.length > 0) {
        let totalSize = 0
        for (const file of files) {
          totalSize += file.size
        }
        if (totalSize > 2 * 1024 * 1024 * 1024) {
          this.$message.error(this.translate('transcription.messages.fileSizeLimit'))
          return
        }
        this.currentFile = files[0]
        this.displayPreview(this.currentFile)
        setTimeout(() => {
          this.showUploadSuccess()
          this.resetProcessingState()
        }, 500)
      }
    },
    displayPreview(file) {
      this.filePreview = true
      this.fileName = file.name
      if (file.type.startsWith('video/')) {
        this.mediaIcon = '🎥'
        this.showWaveform = false
      } else if (file.type.startsWith('audio/')) {
        this.mediaIcon = '🎵'
        this.showWaveform = true
      }
      this.mediaDuration = this.generateRandomDuration()
    },
    generateRandomDuration() {
      const minutes = Math.floor(Math.random() * 10) + 1
      const seconds = Math.floor(Math.random() * 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    showUploadSuccess() {
      this.uploadSuccess = true
      this.hasFile = true
    },
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.currentFile = null
      this.resetProcessingState()
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    loadSample(type) {
      const sampleInfo = {
        interview: {
          nameKey: 'transcription.samples.items.interview.fileName',
          icon: '🎙️',
          duration: '05:23'
        },
        podcast: {
          nameKey: 'transcription.samples.items.podcast.fileName',
          icon: '🎧',
          duration: '15:47'
        },
        meeting: {
          nameKey: 'transcription.samples.items.meeting.fileName',
          icon: '💼',
          duration: '45:12'
        },
        lecture: {
          nameKey: 'transcription.samples.items.lecture.fileName',
          icon: '🎓',
          duration: '1:23:45'
        }
      }
      const sample = sampleInfo[type]
      this.filePreview = true
      this.fileName = this.translate(sample.nameKey)
      this.mediaIcon = sample.icon
      this.mediaDuration = sample.duration
      this.showWaveform = type === 'interview' || type === 'podcast'
      setTimeout(() => {
        this.showUploadSuccess()
        this.resetProcessingState()
      }, 500)
      this.currentFile = true
      this.$message.success(this.translate('transcription.messages.sampleLoaded'))
    },
    handleLanguageChange() {
      this.checkLanguageConflict()
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    handleTranslationToggle() {
      if (this.enableTranslation) {
        this.checkLanguageConflict()
      }
      this.updateProcessDetails()
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    handleTranslationLanguageChange() {
      this.checkLanguageConflict()
      this.updateProcessDetails()
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    checkLanguageConflict() {
      if (
        this.enableTranslation &&
        this.languageSelect !== 'auto' &&
        this.languageSelect === this.translationLanguage
      ) {
        this.$message.warning(this.translate('transcription.messages.languageConflict'))
        if (this.languageSelect !== 'en') {
          this.translationLanguage = 'en'
        } else {
          this.translationLanguage = 'zh'
        }
      }
    },
    handleFormatChange() {
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    resetToReprocess() {
      this.buttonTextKey = 'transcription.actions.retranscribe'
      this.processingComplete = false
    },
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonTextKey = 'transcription.actions.start'
      this.updateProcessDetails()
    },
    startTranscription() {
      if (!this.currentFile && !this.filePreview) {
        this.$message.error(this.translate('transcription.messages.noFile'))
        return
      }
      this.processing = true
      this.processPercent = 0
      this.updateProcessDetails()
      const interval = setInterval(() => {
        this.processPercent += Math.floor(Math.random() * 15)
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.generateTranscriptionText()
          }, 500)
        }
      }, 200)
    },
    updateProcessDetails() {
      if (this.enableTranslation) {
        const language = this.getLanguageName(this.translationLanguage)
        this.processDetails = this.translateWithParams('transcription.processing.withTranslation', {
          language
        })
      } else {
        this.processDetails = this.translate('transcription.processing.base')
      }
    },
    generateTranscriptionText() {
      if (this.enableTranslation) {
        if (this.translationLanguage === 'zh') {
          this.generateChineseText()
        } else if (this.translationLanguage === 'es') {
          this.generateSpanishText()
        } else {
          this.generateDefaultText()
        }
      } else {
        this.generateDefaultText()
      }
    },
    generateDefaultText() {
      if (this.outputFormat === 'srt') {
        this.transcriptionText = `1
00:00:00,000 --> 00:00:05,000
Welcome to today's podcast episode.

2
00:00:05,000 --> 00:00:12,000
Today we're going to discuss the latest developments in artificial intelligence.`
      } else {
        this.transcriptionText = `Welcome to today's podcast episode. Today we're going to discuss the latest developments in artificial intelligence and machine learning.`
      }
    },
    generateChineseText() {
      if (this.outputFormat === 'srt') {
        this.transcriptionText = `1
00:00:00,000 --> 00:00:05,000
欢迎来到今天的播客节目。

2
00:00:05,000 --> 00:00:12,000
今天我们将讨论人工智能的最新发展。`
      } else {
        this.transcriptionText = `欢迎来到今天的播客节目。今天我们将讨论人工智能和机器学习的最新发展。`
      }
    },
    generateSpanishText() {
      if (this.outputFormat === 'srt') {
        this.transcriptionText = `1
00:00:00,000 --> 00:00:05,000
Bienvenidos al episodio de podcast de hoy.

2
00:00:05,000 --> 00:00:12,000
Hoy vamos a discutir los últimos desarrollos en inteligencia artificial.`
      } else {
        this.transcriptionText = `Bienvenidos al episodio de podcast de hoy. Hoy vamos a discutir los últimos desarrollos en inteligencia artificial y aprendizaje automático.`
      }
    },
    downloadTranscription() {
      let fileName = this.translate('transcription.download.defaultName')
      if (this.enableTranslation) {
        fileName += `_${this.translationLanguage}`
      }
      fileName += `.${this.outputFormat}`
      this.$message.success(
        this.translateWithParams('transcription.messages.downloading', { fileName })
      )
      const blob = new Blob([this.transcriptionText], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped lang="scss">
@import './VideoAudioToText.scss';
</style>
