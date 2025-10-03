<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">MediaEnhance Pro</div>
      <nav>
        <ul class="nav-menu">
          <li class="nav-item" v-for="(item, index) in navItems" :key="index"
              :class="{ active: item.active }"
              @click="handleNavClick(index)">
            <span v-html="item.icon"></span> {{ item.title }}
          </li>
        </ul>
      </nav>
      <div class="user-section">
        <div class="nav-item user-item">
          <span>👤</span>
          <div style="flex: 1;">
            <div class="user-name">User Account</div>
            <div class="user-plan">Pro Plan</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>AI Video Hook Generator</h1>
          <p>Create engaging video hooks that capture attention in the first 3 seconds. Use AI to generate compelling scripts and match them with perfect avatars and effects.</p>
        </div>

        <!-- Tab切换 -->
        <div class="tab-buttons">
          <button 
            class="tab-btn" 
            :class="{ active: currentTab === 'generate' }"
            @click="switchTab('generate')">
            Generate Video
          </button>
          <button 
            class="tab-btn"
            :class="{ active: currentTab === 'upload' }"
            @click="switchTab('upload')">
            Upload Video
          </button>
        </div>

        <!-- 生成视频工作区 -->
        <div v-show="currentTab === 'generate'" class="workspace">
          <!-- 左侧：脚本输入和Voice选择 -->
          <div class="workspace-left">
            <!-- Hook脚本输入 -->
            <div class="upload-container">
              <div class="section-title">Hook Script</div>
              <div class="script-input-area" :class="{ focused: scriptFocused }">
                <el-input
                  type="textarea"
                  v-model="hookScript"
                  :rows="6"
                  :maxlength="240"
                  placeholder="Enter your hook script here - English supported&#10;&#10;Example: 'Did you know that 90% of viewers decide to keep watching in the first 3 seconds? Here's how to hook them instantly...'"
                  class="script-textarea"
                  @focus="scriptFocused = true"
                  @blur="scriptFocused = false"
                  show-word-limit>
                </el-input>
              </div>
              <el-button 
                type="primary" 
                plain 
                class="sample-btn"
                @click="useSampleScript">
                Use Sample Script
              </el-button>
            </div>

            <!-- Voice选择 -->
            <div class="samples-container">
              <div class="section-title">Voice</div>
              <div class="voice-selector" @click="openVoiceSelector">
                <div class="voice-selector-text">
                  <span class="voice-selector-icon">➕</span>
                  <span>{{ selectedVoice || 'Choose Voice' }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- Avatar选择 -->
            <div class="samples-container">
              <div class="section-title">Avatar</div>
              <div class="avatar-options">
                <button class="avatar-btn" @click="selectAvatar('library')">
                  <span>👤</span>
                  <span>{{ selectedAvatar || 'Choose Avatar' }}</span>
                </button>
                <button class="avatar-btn" @click="selectAvatar('custom')">
                  <span>➕</span>
                  <span>Custom Avatar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：Hook Style选择、效果选择和操作按钮 -->
          <div class="workspace-right">
            <!-- Hook Style选择 -->
            <div class="settings-container">
              <div class="section-title">Hook Style</div>
              <div class="style-selector" @click="openStyleModal('generate')">
                <div class="style-selector-text">
                  <span class="style-selector-icon">🎨</span>
                  <span>{{ selectedStyleName }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- 效果选择 -->
            <div class="settings-container">
              <div class="section-title">Effect</div>
              <div class="effect-grid">
                <div 
                  v-for="effect in effects" 
                  :key="effect.id"
                  class="effect-item"
                  :class="{ selected: selectedEffect === effect.id }"
                  @click="selectEffect(effect.id)">
                  <div class="effect-thumbnail">{{ effect.icon }}</div>
                  <div class="effect-label">{{ effect.label }}</div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions-container">
              <el-button 
                v-if="!generationComplete"
                type="primary"
                class="action-btn btn-generate"
                :loading="generating"
                @click="startGeneration">
                <span v-if="!generating" class="btn-icon">🚀</span>
                <span>{{ generating ? 'Generating...' : 'Generate UGC Hook' }}</span>
              </el-button>
              
              <el-button 
                v-if="generationComplete"
                type="success"
                class="action-btn btn-upload"
                @click="downloadVideo">
                <span class="btn-icon">⬇️</span>
                Download Video
              </el-button>

              <div v-if="generating" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Generating your video hook...</div>
                  <div class="status-percent">{{ generationProgress }}%</div>
                </div>
                <el-progress 
                  :percentage="generationProgress" 
                  :stroke-width="8"
                  color="#6366f1">
                </el-progress>
              </div>

              <div v-if="generationComplete" class="process-info success-info">
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                  <div style="font-size: 16px; color: #10b981; font-weight: 600;">
                    Video Hook Generated Successfully!
                  </div>
                  <div style="font-size: 14px; color: #64748b; margin-top: 5px;">
                    Your engaging hook with {{ selectedStyleName }} style is ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 上传视频工作区 -->
        <div v-show="currentTab === 'upload'" class="workspace upload-workspace">
          <div style="width: 100%;">
            <!-- 上传视频区域 -->
            <div class="upload-container">
              <div class="section-title">Your Video</div>
              <el-upload
                class="upload-video-area"
                drag
                action="#"
                :before-upload="handleVideoUpload"
                :show-file-list="false"
                accept="video/*">
                <div v-if="!uploadedVideo">
                  <div class="upload-video-icon">⬆️</div>
                  <div class="upload-video-title">Upload Your Video</div>
                  <div class="upload-video-subtitle">Drop your video file here or click to browse</div>
                  <div class="upload-video-hint">
                    For best results, upload:<br>
                    1. Talking Video<br>
                    2. English-speaking One
                  </div>
                </div>
                <div v-else class="upload-success">
                  <div style="color: #10b981; font-size: 48px; margin-bottom: 10px;">✔</div>
                  <div style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 5px;">
                    Video Uploaded Successfully
                  </div>
                  <div style="font-size: 14px; color: #64748b;">{{ uploadedVideo.name }}</div>
                  <el-button type="primary" plain style="margin-top: 15px;">
                    Choose Another Video
                  </el-button>
                </div>
              </el-upload>
            </div>
            
            <!-- Hook Style选择 -->
            <div class="settings-container" style="margin-top: 20px;">
              <div class="section-title">Apply Hook Style</div>
              <div class="style-selector" @click="openStyleModal('upload')">
                <div class="style-selector-text">
                  <span class="style-selector-icon">🎨</span>
                  <span>{{ uploadStyleName }}</span>
                </div>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>

            <!-- 效果选择 -->
            <div class="settings-container" style="margin-top: 20px;">
              <div class="section-title">Apply Effect</div>
              <div class="effect-grid">
                <div 
                  v-for="effect in effects" 
                  :key="effect.id"
                  class="effect-item"
                  :class="{ selected: uploadEffect === effect.id }"
                  @click="selectUploadEffect(effect.id)">
                  <div class="effect-thumbnail">{{ effect.icon }}</div>
                  <div class="effect-label">{{ effect.label }}</div>
                </div>
              </div>
            </div>

            <!-- 处理按钮 -->
            <div class="actions-container" style="margin-top: 20px;">
              <el-button 
                type="primary"
                class="action-btn btn-generate"
                :disabled="!uploadedVideo"
                @click="processUploadedVideo">
                <span class="btn-icon">🎯</span>
                <span>Apply Hook Style</span>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 生成结果展示区域 -->
        <div class="result-section">
          <div class="result-header">
            <h2 class="result-title">Your Generated Hooks</h2>
            <p class="result-subtitle">Your AI-powered video hooks will appear here</p>
          </div>
          <div class="result-container">
            <div v-if="!generatedVideoUrl" class="result-placeholder">
              <div class="result-placeholder-icon">📦</div>
              <div class="result-placeholder-text">Your generated video hooks will appear here.</div>
              <div class="result-placeholder-hint">Create your first hook to see the magic!</div>
            </div>
            <div v-else class="video-player">
              <video :src="generatedVideoUrl" controls></video>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Voice选择弹窗 -->
    <el-dialog
      title="Choose Voice"
      :visible.sync="voiceModalVisible"
      width="600px"
      :close-on-click-modal="true">
      <div class="voice-list">
        <div 
          v-for="voice in voices" 
          :key="voice.name"
          class="voice-item"
          :class="{ selected: selectedVoice === voice.name }"
          @click="selectVoice(voice)">
          <div class="voice-info">
            <div class="voice-avatar">{{ voice.avatar }}</div>
            <div class="voice-details">
              <div class="voice-name">{{ voice.name }}</div>
              <div class="voice-type">{{ voice.gender }} • {{ voice.accent }}</div>
            </div>
          </div>
          <div class="voice-play">▶</div>
        </div>
      </div>
    </el-dialog>

    <!-- Avatar选择弹窗 -->
    <el-dialog
      title="Choose Avatar"
      :visible.sync="avatarModalVisible"
      width="900px"
      :close-on-click-modal="true">
      <div class="avatar-grid">
        <div 
          v-for="avatar in avatars" 
          :key="avatar.name"
          class="avatar-card"
          :class="{ selected: tempSelectedAvatar === avatar.name }"
          @click="openAvatarBackgrounds(avatar)">
          <div class="avatar-image">{{ avatar.icon }}</div>
          <div class="avatar-name">{{ avatar.name }}</div>
        </div>
      </div>
      <div class="custom-upload-section">
        <div class="section-title" style="margin-bottom: 15px;">Or Upload Custom Avatar</div>
        <el-upload
          class="custom-upload-area"
          action="#"
          :before-upload="handleAvatarUpload"
          :show-file-list="false"
          accept="image/*">
          <div class="custom-upload-icon">📸</div>
          <div class="custom-upload-text">Upload Your Photo</div>
          <div class="custom-upload-hint">JPG, PNG up to 10MB</div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- Avatar背景选择弹窗 -->
    <el-dialog
      :title="`Choose Background for ${tempSelectedAvatar}`"
      :visible.sync="avatarBgModalVisible"
      width="800px"
      :close-on-click-modal="true">
      <div class="bg-options-grid">
        <div 
          v-for="bg in avatarBackgrounds" 
          :key="bg.id"
          class="bg-option"
          @click="selectAvatarWithBg(bg)">
          <div class="bg-preview" :style="{ background: bg.gradient }">
            <div class="avatar-preview-icon">{{ tempSelectedAvatarIcon }}</div>
          </div>
          <div class="bg-label">{{ bg.label }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- Hook Style选择弹窗 -->
    <el-dialog
      title="Choose Hook Style"
      :visible.sync="styleModalVisible"
      width="900px"
      :close-on-click-modal="true">
      <div class="style-grid-modal">
        <div 
          v-for="style in hookStyles" 
          :key="style.id"
          class="style-item-modal"
          :class="{ selected: isStyleSelected(style.id) }"
          @click="selectStyleFromModal(style)">
          <div class="style-thumbnail" :class="style.thumbnailClass">
            <div v-if="style.id === 'no-style'" class="style-avatar">👤</div>
            <div v-else class="style-text-overlay">
              <div class="style-text" v-html="style.text"></div>
            </div>
          </div>
          <div class="style-label">{{ style.label }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AIVideoHookGenerator',
  data() {
    return {
      // 导航菜单数据
      navItems: [
        { icon: '📊', title: 'Dashboard', active: false },
        { icon: '✨', title: 'Video/Image Enhancer', active: false },
        { icon: '🧹', title: 'Watermark Remover', active: false },
        { icon: '🎯', title: 'AI Hook Generator', active: true },
        { icon: '🎨', title: 'Style Transfer', active: false },
        { icon: '🔊', title: 'Audio Enhancement', active: false },
        { icon: '📁', title: 'My Projects', active: false },
        { icon: '⚙️', title: 'Settings', active: false }
      ],

      // Tab状态
      currentTab: 'generate',

      // 生成视频相关
      hookScript: '',
      scriptFocused: false,
      selectedVoice: null,
      selectedAvatar: null,
      selectedAvatarBg: null,
      selectedStyle: 'clean',
      selectedStyleName: 'Clean Look',
      selectedEffect: 'none',
      generating: false,
      generationProgress: 0,
      generationComplete: false,
      generatedVideoUrl: null,

      // 上传视频相关
      uploadedVideo: null,
      uploadStyle: 'clean',
      uploadStyleName: 'Clean Look',
      uploadEffect: 'none',
      currentStyleTab: 'generate',

      // 临时选择状态
      tempSelectedAvatar: null,
      tempSelectedAvatarIcon: null,

      // 弹窗显示状态
      voiceModalVisible: false,
      avatarModalVisible: false,
      avatarBgModalVisible: false,
      styleModalVisible: false,

      // Voice数据
      voices: [
        { name: 'Emily', gender: 'Female', accent: 'American', avatar: '👩' },
        { name: 'James', gender: 'Male', accent: 'British', avatar: '👨' },
        { name: 'Sophia', gender: 'Female', accent: 'Australian', avatar: '👩‍💼' },
        { name: 'Michael', gender: 'Male', accent: 'American', avatar: '👨‍💼' },
        { name: 'Aria', gender: 'Female', accent: 'Canadian', avatar: '👩‍🎤' },
        { name: 'AI Voice Pro', gender: 'Neutral', accent: 'Premium', avatar: '🤖' }
      ],

      // Avatar数据
      avatars: [
        { name: 'Professional Woman', icon: '👩‍💼' },
        { name: 'Professional Man', icon: '👨‍💼' },
        { name: 'Casual Woman', icon: '👩' },
        { name: 'Casual Man', icon: '👨' },
        { name: 'Creative Woman', icon: '👩‍🎨' },
        { name: 'Creative Man', icon: '👨‍🎨' },
        { name: 'Tech Expert Woman', icon: '👩‍💻' },
        { name: 'Tech Expert Man', icon: '👨‍💻' },
        { name: 'Fitness Coach', icon: '🏋️' }
      ],

      // Avatar背景数据
      avatarBackgrounds: [
        { id: 'office', label: 'Modern Office', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'studio', label: 'Creative Studio', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { id: 'outdoor', label: 'Outdoor Scene', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
      ],

      // Hook Style数据
      hookStyles: [
        { id: 'no-style', label: 'No Style', thumbnailClass: 'no-style', text: '' },
        { id: 'thermal', label: 'Thermal', thumbnailClass: 'thermal', text: "AI Template's<br>MAGIC" },
        { id: 'blazing', label: 'Blazing Red', thumbnailClass: 'blazing', text: "AI Template's<br>Magic" },
        { id: 'pulse', label: 'Pulse', thumbnailClass: 'pulse', text: "AI TEMPLATE'S<br>MAGIC" },
        { id: 'clean', label: 'Clean Look', thumbnailClass: 'clean', text: "AI template's<br>magic" },
        { id: 'yellow', label: 'YellowLite', thumbnailClass: 'yellow', text: "AI TEMPLATES<br>MAGIC" },
        { id: 'glow', label: 'GlowReel', thumbnailClass: 'glow', text: "AI TEMPLATE'S<br>MAGIC" },
        { id: 'hyper', label: 'Hyper Green', thumbnailClass: 'hyper', text: "AI TEMPLATES<br>MAGIC" },
        { id: 'aurum', label: 'Aurum', thumbnailClass: 'aurum', text: "HOW TO<br>EDIT FASTER" },
        { id: 'coral', label: 'Coral Look', thumbnailClass: 'coral', text: "AI TEMPLATE'S<br>MAGIC" },
        { id: 'orange', label: 'Orange Flicker', thumbnailClass: 'orange', text: "AI EDIT'S<br>MAGIC" }
      ],

      // 效果数据
      effects: [
        { id: 'none', icon: '🚫', label: 'No Effect' },
        { id: 'fire', icon: '🔥', label: 'Fire Hands' },
        { id: 'claw', icon: '🦾', label: 'Claw Grab' },
        { id: 'earth', icon: '🌍', label: 'Earth Zoom' },
        { id: 'lightning', icon: '⚡', label: 'Lightning' },
        { id: 'sparkle', icon: '✨', label: 'Sparkles' },
        { id: 'neon', icon: '💫', label: 'Neon Glow' },
        { id: 'glitch', icon: '📺', label: 'Glitch' },
        { id: 'smoke', icon: '💨', label: 'Smoke' },
        { id: 'rainbow', icon: '🌈', label: 'Rainbow' },
        { id: 'freeze', icon: '❄️', label: 'Freeze' },
        { id: 'burst', icon: '💥', label: 'Energy Burst' }
      ],

      // 示例脚本
      sampleScripts: [
        "Did you know that 90% of viewers decide to keep watching in the first 3 seconds? Here's the secret formula that top creators use...",
        "Stop scrolling! I'm about to reveal the one trick that changed my entire content strategy forever...",
        "This simple AI hack helped me get 10 million views in just 30 days. Want to know how?",
        "Warning: What I'm about to show you will completely change how you create content..."
      ]
    }
  },
  methods: {
    // 导航点击处理
    handleNavClick(index) {
      this.navItems.forEach((item, i) => {
        item.active = i === index
      })
    },

    // Tab切换
    switchTab(tab) {
      this.currentTab = tab
    },

    // 使用示例脚本
    useSampleScript() {
      const randomScript = this.sampleScripts[Math.floor(Math.random() * this.sampleScripts.length)]
      this.hookScript = randomScript
    },

    // 打开Voice选择器
    openVoiceSelector() {
      this.voiceModalVisible = true
    },

    // 选择Voice
    selectVoice(voice) {
      this.selectedVoice = `${voice.name} (${voice.gender})`
      setTimeout(() => {
        this.voiceModalVisible = false
      }, 300)
    },

    // 选择Avatar
    selectAvatar(type) {
      if (type === 'library') {
        this.avatarModalVisible = true
      } else {
        // 自定义Avatar上传
        this.avatarModalVisible = true
        this.$nextTick(() => {
          // 滚动到上传区域
          const uploadSection = document.querySelector('.custom-upload-section')
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
      }
    },

    // 打开Avatar背景选择
    openAvatarBackgrounds(avatar) {
      this.tempSelectedAvatar = avatar.name
      this.tempSelectedAvatarIcon = avatar.icon
      this.avatarBgModalVisible = true
    },

    // 选择Avatar和背景
    selectAvatarWithBg(bg) {
      this.selectedAvatar = `${this.tempSelectedAvatar} - ${bg.label}`
      this.selectedAvatarBg = bg.id
      this.avatarBgModalVisible = false
      setTimeout(() => {
        this.avatarModalVisible = false
      }, 300)
    },

    // 处理Avatar上传
    handleAvatarUpload(file) {
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error('File size exceeds 10MB limit')
        return false
      }
      
      this.selectedAvatar = 'Custom Avatar'
      this.avatarModalVisible = false
      this.$message.success(`Avatar uploaded successfully: ${file.name}`)
      return false
    },

    // 打开Style选择弹窗
    openStyleModal(tab) {
      this.currentStyleTab = tab
      this.styleModalVisible = true
    },

    // 判断Style是否被选中
    isStyleSelected(styleId) {
      if (this.currentStyleTab === 'generate') {
        return this.selectedStyle === styleId
      } else {
        return this.uploadStyle === styleId
      }
    },

    // 从弹窗选择Style
    selectStyleFromModal(style) {
      if (this.currentStyleTab === 'generate') {
        this.selectedStyle = style.id
        this.selectedStyleName = style.label
      } else {
        this.uploadStyle = style.id
        this.uploadStyleName = style.label
      }
      setTimeout(() => {
        this.styleModalVisible = false
      }, 300)
    },

    // 选择效果
    selectEffect(effectId) {
      this.selectedEffect = effectId
    },

    // 选择上传视频的效果
    selectUploadEffect(effectId) {
      this.uploadEffect = effectId
    },

    // 开始生成
    startGeneration() {
      // 验证输入
      if (!this.hookScript.trim()) {
        this.$message.warning('Please enter a hook script first!')
        return
      }
      
      if (!this.selectedVoice) {
        this.$message.warning('Please select a voice!')
        return
      }

      if (!this.selectedStyle) {
        this.$message.warning('Please select a hook style!')
        return
      }

      // 开始生成动画
      this.generating = true
      this.generationProgress = 0
      this.generationComplete = false

      // 模拟生成进度
      const interval = setInterval(() => {
        this.generationProgress += Math.random() * 15
        if (this.generationProgress >= 100) {
          this.generationProgress = 100
          clearInterval(interval)
          
          // 生成完成
          setTimeout(() => {
            this.generating = false
            this.generationComplete = true
            this.generatedVideoUrl = '#' // 实际应用中这里是生成的视频URL
          }, 500)
        }
      }, 200)
    },

    // 处理视频上传
    handleVideoUpload(file) {
      if (file.size > 500 * 1024 * 1024) {
        this.$message.error('File size exceeds 500MB limit')
        return false
      }
      
      if (!file.type.startsWith('video/')) {
        this.$message.error('Please upload a video file')
        return false
      }
      
      this.uploadedVideo = file
      this.$message.success(`Video uploaded: ${file.name}`)
      return false
    },

    // 处理上传的视频
    processUploadedVideo() {
      if (!this.uploadedVideo) {
        this.$message.warning('Please upload a video first!')
        return
      }
      
      this.$message.success(`Processing video with Style: ${this.uploadStyleName}, Effect: ${this.uploadEffect}`)
      // 实际应用中这里实现视频处理逻辑
    },

    // 下载视频
    downloadVideo() {
      this.$message.success('Downloading your video hook...')
      // 实际应用中这里实现下载逻辑
    }
  },
  mounted() {
    // 初始化默认选中状态
    this.selectedEffect = 'none'
    this.uploadEffect = 'none'
  }
}
</script>

<style lang="scss" scoped>
@import './AIVideoHookGenerator.scss';
</style>
