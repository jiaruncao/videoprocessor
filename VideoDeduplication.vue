<template>
  <div class="video-deduplication-page">
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
            <div class="user-plan">{{ translate('app.user.proPlan') }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
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
          <h1>{{ translate('videoDeduplication.header.title') }}</h1>
          <p>{{ translate('videoDeduplication.header.subtitle') }}</p>
        </div>

        <!-- 工作区 -->
        <div class="workspace">
          <!-- 左侧：上传区域 -->
          <div class="workspace-left">
            <!-- 上传容器 -->
            <div class="upload-container">
              <div class="section-title">
                <span class="section-icon">📁</span>
                {{ translate('videoDeduplication.upload.title') }}
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
                  <div class="upload-title">{{ translate('videoDeduplication.upload.instructions') }}</div>
                  <div class="upload-subtitle">{{ translate('videoDeduplication.upload.hint') }}</div>
                  <el-button class="upload-btn-small">{{ translate('videoDeduplication.upload.button') }}</el-button>
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
                {{ translate('videoDeduplication.upload.supported') }}
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
                <span>{{ translate(processing ? 'videoDeduplication.actions.processing' : 'videoDeduplication.actions.start') }}</span>
              </el-button>

              <el-button
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadResults"
              >
                <span class="btn-icon">⬇️</span>
                {{ translate('videoDeduplication.actions.download') }}
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">{{ translate('videoDeduplication.processing.inProgress') }}</div>
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
                {{ translate('videoDeduplication.settings.title') }}
              </div>

              <!-- 模式卡片 -->
              <el-radio-group v-model="processingMode" class="mode-cards" @change="handleModeChange">
                <el-radio label="smart" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'smart' }">
                    <div class="mode-card-icon">🧠</div>
                    <div class="mode-card-title">{{ translate('videoDeduplication.settings.modes.smart.title') }}</div>
                    <div class="mode-card-desc">{{ translate('videoDeduplication.settings.modes.smart.desc') }}</div>
                  </div>
                </el-radio>
                <el-radio label="custom" class="mode-card-wrapper">
                  <div class="mode-card" :class="{ selected: processingMode === 'custom' }">
                    <div class="mode-card-icon">⚡</div>
                    <div class="mode-card-title">{{ translate('videoDeduplication.settings.modes.custom.title') }}</div>
                    <div class="mode-card-desc">{{ translate('videoDeduplication.settings.modes.custom.desc') }}</div>
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
                          <span>{{ translate('videoDeduplication.settings.basicTitle') }}</span>
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

                    <!-- Special Effects -->
                    <el-collapse-item name="effects">
                      <template slot="title">
                        <div class="collapsible-title">
                          <span>✨</span>
                          <span>{{ translate('videoDeduplication.settings.specialTitle') }}</span>
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

            <!-- Zoom设置 -->
            <div class="settings-container zoom-settings">
              <div class="section-title">
                <span class="section-icon">🔍</span>
                {{ translate('videoDeduplication.settings.zoomTitle') }}
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

        <!-- 对比区域 -->
        <div class="comparison-section" v-if="uploadedFiles.length > 0">
          <div class="comparison-header">
            <h2 class="comparison-title">{{ translate('videoDeduplication.comparison.title') }}</h2>
          </div>
          <div class="comparison-container">
            <!-- 原始视频 -->
            <div class="comparison-item">
              <div class="comparison-label">
                <span class="label-badge original">{{ translate('videoDeduplication.comparison.original') }}</span>
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
                    <p>{{ translate('videoDeduplication.upload.emptyTitle') }}</p>
                    <small>{{ translate('videoDeduplication.upload.emptyHint') }}</small>
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
                <span class="label-badge processed">{{ translate('videoDeduplication.comparison.processed') }}</span>
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
                    <p>{{ translate('videoDeduplication.comparison.processPlaceholderTitle') }}</p>
                    <small>{{ translate('videoDeduplication.comparison.processPlaceholderHint') }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果统计 -->
        <div v-if="processingComplete" class="results-section">
          <h2 class="results-title">{{ translate('videoDeduplication.statistics.title') }}</h2>
          <div class="results-summary">
            <div class="summary-card">
              <div class="summary-icon">📹</div>
              <div class="summary-label">{{ translate('videoDeduplication.statistics.original') }}</div>
              <div class="summary-value">{{ statistics.totalVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">✅</div>
              <div class="summary-label">{{ translate('videoDeduplication.statistics.processed') }}</div>
              <div class="summary-value">{{ statistics.processedVideos }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">⚡</div>
              <div class="summary-label">{{ translate('videoDeduplication.statistics.effects') }}</div>
              <div class="summary-value">{{ statistics.effectsCount }}</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">💯</div>
              <div class="summary-label">{{ translate('videoDeduplication.statistics.success') }}</div>
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
      // 菜单项
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
        { value: 'removeduplicates', labelKey: 'videoDeduplication.settings.basic.removeDuplicates' },
        { value: 'mirrorflip', labelKey: 'videoDeduplication.settings.basic.mirrorFlip' },
        { value: 'randomshift', labelKey: 'videoDeduplication.settings.basic.randomShift' },
        { value: 'modifymd5', labelKey: 'videoDeduplication.settings.basic.modifyMd5' },
        { value: 'smartextract', labelKey: 'videoDeduplication.settings.basic.smartExtract' },
        { value: 'smartcolor', labelKey: 'videoDeduplication.settings.basic.smartColor' },
        { value: 'sharpening', labelKey: 'videoDeduplication.settings.basic.sharpening' },
        { value: 'randomspeed', labelKey: 'videoDeduplication.settings.basic.randomSpeed' },
        { value: 'trimheadtail', labelKey: 'videoDeduplication.settings.basic.trimHeadTail' },
        { value: 'randommirror', labelKey: 'videoDeduplication.settings.basic.randomMirror' }
      ],
      
      // 特效选项
      selectedEffect: null,
      specialEffects: [
        { value: 'scanline', icon: '📺', labelKey: 'videoDeduplication.settings.effects.scanline' },
        { value: 'spotlight', icon: '💡', labelKey: 'videoDeduplication.settings.effects.spotlight' },
        { value: 'fade', icon: '🌅', labelKey: 'videoDeduplication.settings.effects.fade' },
        { value: 'booklet', icon: '📖', labelKey: 'videoDeduplication.settings.effects.booklet' },
        { value: 'dissolve', icon: '✨', labelKey: 'videoDeduplication.settings.effects.dissolve' },
        { value: 'split', icon: '📱', labelKey: 'videoDeduplication.settings.effects.split' },
        { value: 'product', icon: '🛍️', labelKey: 'videoDeduplication.settings.effects.product' },
        { value: 'film', icon: '🎬', labelKey: 'videoDeduplication.settings.effects.film' },
        { value: 'drama', icon: '🎭', labelKey: 'videoDeduplication.settings.effects.drama' }
      ],
      
      // Zoom选项
      selectedZoom: null,
      zoomOptions: [
        { value: 'stretch', icon: '↔️', labelKey: 'videoDeduplication.settings.zoom.stretch' },
        { value: 'compress', icon: '↕️', labelKey: 'videoDeduplication.settings.zoom.compress' },
        { value: 'dynamic', icon: '🔄', labelKey: 'videoDeduplication.settings.zoom.dynamic' }
      ],
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      
      // 对比信息
      originalInfoKey: 'videoDeduplication.status.originalInfo',
      processedInfoKey: 'videoDeduplication.status.processedInfo',
      
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
    translate(key) {
      return translateText(this.locale, key)
    },

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
      return this.$confirm(
        `${this.translate('videoDeduplication.messages.removePrefix')} ${file.name}?`,
        this.translate('videoDeduplication.messages.confirmTitle'),
        {
          confirmButtonText: this.translate('videoDeduplication.messages.confirmYes'),
          cancelButtonText: this.translate('videoDeduplication.messages.confirmNo'),
        type: 'warning'
        }
      )
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
        this.$message.warning(this.translate('videoDeduplication.messages.uploadRequired'))
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
        this.processedInfoKey =
          this.processingMode === 'smart'
            ? 'videoDeduplication.status.processedSmart'
            : 'videoDeduplication.status.processedCustom'
      }

      this.processingComplete = true
      this.$message.success(this.translate('videoDeduplication.messages.processedSuccess'))
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
      
      this.$message.success(this.translate('videoDeduplication.messages.reportDownloaded'))
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