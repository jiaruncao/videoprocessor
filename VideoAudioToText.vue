<template>
  <div class="video-audio-to-text-page">
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
        <div class="nav-item user-account">
          <span>👤</span>
          <div class="user-info">
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
          <h1>Video & Audio to Text</h1>
          <p>Convert your video and audio files into accurate text transcriptions using advanced AI speech recognition technology. Support for multiple languages and export formats.</p>
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
                @dragover.prevent="handleDragover"
                @dragleave="handleDragleave"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <div v-if="uploadSuccess" class="upload-success-badge">✔</div>
                
                <!-- 上传内容 -->
                <div v-if="!filePreview" class="upload-content">
                  <div class="upload-icon">⬆️</div>
                  <div class="upload-title">Drop your media files here</div>
                  <div class="upload-subtitle">or click to browse</div>
                  <el-button type="primary" size="small" class="upload-btn-small">
                    Choose Files
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

                <!-- 文件预览 -->
                <div v-else class="file-preview">
                  <div class="file-preview-item">
                    <div class="media-preview">
                      <div class="media-icon">{{ mediaIcon }}</div>
                      <div class="media-info">
                        <div class="media-name">{{ fileName }}</div>
                        <div class="media-duration">Duration: {{ mediaDuration }}</div>
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
                Supported: .mp4, .mov, .m4v, .mp3, .wav, .m4a, .aac (Max 8 files, 2GB total)
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
                  <div class="sample-icon">{{ sample.icon }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：设置和选项 -->
          <div class="workspace-right">
            <!-- 转录设置 -->
            <div class="settings-container">
              <div class="section-title">Transcription Settings</div>
              
              <!-- 语言选择 -->
              <div class="setting-group">
                <div class="setting-label">Language Detection</div>
                <el-select 
                  v-model="languageSelect" 
                  placeholder="Select language"
                  class="language-select-element"
                  @change="handleLanguageChange"
                >
                  <el-option label="Auto-detect Language" value="auto"></el-option>
                  <el-option label="English" value="en"></el-option>
                  <el-option label="Spanish" value="es"></el-option>
                  <el-option label="French" value="fr"></el-option>
                  <el-option label="German" value="de"></el-option>
                  <el-option label="Chinese (Mandarin)" value="zh"></el-option>
                  <el-option label="Japanese" value="ja"></el-option>
                  <el-option label="Korean" value="ko"></el-option>
                  <el-option label="Arabic" value="ar"></el-option>
                  <el-option label="Russian" value="ru"></el-option>
                  <el-option label="Portuguese" value="pt"></el-option>
                </el-select>
              </div>

              <!-- 翻译选项 -->
              <div class="setting-group">
                <div class="setting-label">Translation Options</div>
                <div class="translation-toggle">
                  <el-switch
                    v-model="enableTranslation"
                    active-color="#6366f1"
                    @change="handleTranslationToggle"
                  >
                  </el-switch>
                  <span class="toggle-label">Enable Translation</span>
                </div>
                <transition name="slide">
                  <div v-if="enableTranslation" class="translation-language-wrapper">
                    <div class="setting-sublabel">Translate to:</div>
                    <el-select 
                      v-model="translationLanguage" 
                      placeholder="Select translation language"
                      class="language-select-element"
                      @change="handleTranslationLanguageChange"
                    >
                      <el-option label="English" value="en"></el-option>
                      <el-option label="Chinese (Simplified)" value="zh"></el-option>
                      <el-option label="Chinese (Traditional)" value="zh-tw"></el-option>
                      <el-option label="Spanish" value="es"></el-option>
                      <el-option label="French" value="fr"></el-option>
                      <el-option label="German" value="de"></el-option>
                      <el-option label="Japanese" value="ja"></el-option>
                      <el-option label="Korean" value="ko"></el-option>
                      <el-option label="Arabic" value="ar"></el-option>
                      <el-option label="Russian" value="ru"></el-option>
                      <el-option label="Portuguese" value="pt"></el-option>
                      <el-option label="Italian" value="it"></el-option>
                      <el-option label="Dutch" value="nl"></el-option>
                      <el-option label="Hindi" value="hi"></el-option>
                      <el-option label="Thai" value="th"></el-option>
                    </el-select>
                  </div>
                </transition>
              </div>

              <!-- 输出格式 -->
              <div class="setting-group">
                <div class="setting-label">Output Format</div>
                <el-radio-group v-model="outputFormat" @change="handleFormatChange" class="format-options">
                  <div class="format-option">
                    <el-radio label="txt" class="format-radio">
                      <div class="format-content">
                        <span class="format-icon">📄</span>
                        <span class="format-title">TXT</span>
                      </div>
                    </el-radio>
                  </div>
                  <div class="format-option">
                    <el-radio label="srt" class="format-radio">
                      <div class="format-content">
                        <span class="format-icon">📺</span>
                        <span class="format-title">SRT</span>
                      </div>
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button 
                v-if="!processingComplete"
                type="primary"
                class="action-btn btn-process"
                :disabled="processing"
                @click="startTranscription"
              >
                <span class="btn-icon">🎯</span>
                <span>{{ buttonText }}</span>
              </el-button>
              
              <el-button 
                v-if="processingComplete"
                type="success"
                class="action-btn btn-download"
                @click="downloadTranscription"
              >
                <span class="btn-icon">⬇️</span>
                Download Transcript
              </el-button>

              <!-- 处理进度 -->
              <div v-if="processing" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Transcribing your media...</div>
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

              <!-- 完成状态 -->
              <div v-if="processingComplete && !processing" class="process-complete">
                <div class="complete-icon">✅</div>
                <div class="complete-text">Transcription Complete!</div>
                <div class="complete-subtitle">Your transcript is ready for download</div>
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
  name: 'VideoAudioToText',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '📝', label: 'Speech to Text', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 示例文件
      samples: [
        { type: 'interview', icon: '🎙️', title: 'Interview Sample' },
        { type: 'podcast', icon: '🎧', title: 'Podcast Sample' },
        { type: 'meeting', icon: '💼', title: 'Meeting Sample' },
        { type: 'lecture', icon: '🎓', title: 'Lecture Sample' }
      ],
      
      // 文件上传状态
      currentFile: null,
      isDragover: false,
      hasFile: false,
      uploadSuccess: false,
      filePreview: false,
      fileName: '',
      mediaIcon: '🎵',
      mediaDuration: '00:00',
      showWaveform: false,
      
      // 设置选项
      languageSelect: 'auto',
      enableTranslation: false,
      translationLanguage: 'en',
      outputFormat: 'txt',
      
      // 处理状态
      processing: false,
      processingComplete: false,
      processPercent: 0,
      buttonText: 'Start Transcription',
      processDetails: 'Processing audio • Recognizing speech • Generating text',
      transcriptionText: '',
      
      // 语言名称映射
      languageNames: {
        'en': 'English',
        'zh': 'Chinese',
        'zh-tw': 'Chinese (Traditional)',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'it': 'Italian',
        'nl': 'Dutch',
        'hi': 'Hindi',
        'th': 'Thai'
      }
    }
  },
  
  methods: {
    // 菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
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
      if (!this.hasFile) {
        this.handleFiles(e.dataTransfer.files)
      }
    },
    
    // 触发文件选择
    triggerFileInput() {
      if (!this.hasFile) {
        this.$refs.fileInput.click()
      }
    },
    
    // 处理文件选择
    handleFileSelect(event) {
      this.handleFiles(event.target.files)
    },
    
    // 处理文件
    handleFiles(files) {
      if (files.length > 0) {
        // 检查文件大小
        let totalSize = 0
        for (let file of files) {
          totalSize += file.size
        }
        if (totalSize > 2 * 1024 * 1024 * 1024) {
          this.$message.error('Total file size exceeds 2GB limit')
          return
        }
        
        // 保存文件并显示预览
        this.currentFile = files[0]
        this.displayPreview(this.currentFile)
        
        // 延迟显示成功标记
        setTimeout(() => {
          this.showUploadSuccess()
          this.resetProcessingState()
        }, 500)
      }
    },
    
    // 显示预览
    displayPreview(file) {
      this.filePreview = true
      this.fileName = file.name
      
      // 判断文件类型并设置图标
      if (file.type.startsWith('video/')) {
        this.mediaIcon = '🎥'
        this.showWaveform = false
      } else if (file.type.startsWith('audio/')) {
        this.mediaIcon = '🎵'
        this.showWaveform = true
      }
      
      // 模拟获取媒体时长
      this.mediaDuration = this.generateRandomDuration()
    },
    
    // 生成随机时长
    generateRandomDuration() {
      const minutes = Math.floor(Math.random() * 10) + 1
      const seconds = Math.floor(Math.random() * 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    
    // 显示上传成功
    showUploadSuccess() {
      this.uploadSuccess = true
      this.hasFile = true
    },
    
    // 移除文件
    removeFile() {
      this.filePreview = false
      this.fileName = ''
      this.uploadSuccess = false
      this.hasFile = false
      this.currentFile = null
      this.resetProcessingState()
      
      // 重置文件输入
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    
    // 加载示例
    loadSample(type) {
      const sampleInfo = {
        interview: { name: 'interview_sample.mp3', icon: '🎙️', duration: '05:23' },
        podcast: { name: 'podcast_sample.mp3', icon: '🎧', duration: '15:47' },
        meeting: { name: 'meeting_recording.mp4', icon: '💼', duration: '45:12' },
        lecture: { name: 'lecture_video.mp4', icon: '🎓', duration: '1:23:45' }
      }
      
      const sample = sampleInfo[type]
      this.filePreview = true
      this.fileName = sample.name
      this.mediaIcon = sample.icon
      this.mediaDuration = sample.duration
      
      // 显示音频波形
      this.showWaveform = (type === 'interview' || type === 'podcast')
      
      // 延迟显示成功标记
      setTimeout(() => {
        this.showUploadSuccess()
        this.resetProcessingState()
      }, 500)
      
      this.currentFile = true // 标记有文件
    },
    
    // 处理语言更改
    handleLanguageChange() {
      console.log('Language changed to:', this.languageSelect)
      this.checkLanguageConflict()
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 处理翻译开关
    handleTranslationToggle() {
      if (this.enableTranslation) {
        this.checkLanguageConflict()
      }
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 处理翻译语言更改
    handleTranslationLanguageChange() {
      console.log('Translation language changed to:', this.translationLanguage)
      this.checkLanguageConflict()
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 检查语言冲突
    checkLanguageConflict() {
      if (this.enableTranslation && 
          this.languageSelect !== 'auto' && 
          this.languageSelect === this.translationLanguage) {
        this.$message.warning('Source language and translation language cannot be the same')
        
        // 自动切换到其他语言
        if (this.languageSelect !== 'en') {
          this.translationLanguage = 'en'
        } else {
          this.translationLanguage = 'zh'
        }
      }
    },
    
    // 处理格式更改
    handleFormatChange() {
      console.log('Output format changed to:', this.outputFormat)
      
      if (this.processingComplete) {
        this.resetToReprocess()
      }
    },
    
    // 重置为需要重新处理状态
    resetToReprocess() {
      this.buttonText = 'Retranscribe'
      this.processingComplete = false
    },
    
    // 重置处理状态
    resetProcessingState() {
      this.processing = false
      this.processingComplete = false
      this.processPercent = 0
      this.buttonText = 'Start Transcription'
    },
    
    // 开始转录
    startTranscription() {
      // 检查是否有文件
      if (!this.currentFile && !this.filePreview) {
        this.$message.error('Please upload a file or select a sample first')
        return
      }
      
      this.processing = true
      this.processPercent = 0
      
      // 更新处理详情文本
      this.updateProcessDetails()
      
      // 模拟处理进度
      const interval = setInterval(() => {
        this.processPercent += Math.floor(Math.random() * 15)
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          // 处理完成
          setTimeout(() => {
            this.processing = false
            this.processingComplete = true
            this.generateTranscriptionText()
          }, 500)
        }
      }, 200)
    },
    
    // 更新处理详情
    updateProcessDetails() {
      let details = 'Processing audio • Recognizing speech • Generating text'
      if (this.enableTranslation) {
        details += ` • Translating to ${this.languageNames[this.translationLanguage]}`
      }
      this.processDetails = details
    },
    
    // 生成转录文本（后台处理）
    generateTranscriptionText() {
      // 根据是否启用翻译生成不同的示例文本
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
    
    // 生成默认文本
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
    
    // 生成中文文本
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
    
    // 生成西班牙语文本
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
    
    // 下载转录文本
    downloadTranscription() {
      let fileName = 'transcription'
      
      // 如果启用了翻译，在文件名中添加语言代码
      if (this.enableTranslation) {
        fileName += `_${this.translationLanguage}`
      }
      
      fileName += `.${this.outputFormat}`
      
      this.$message.success(`Downloading ${fileName}...`)
      
      // 实际下载逻辑
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
