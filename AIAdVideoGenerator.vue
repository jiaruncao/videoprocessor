<template>
  <div class="ai-video-generator-page">
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
          <h1>AI Ad Video Generator</h1>
          <p>Create stunning product advertisement videos using AI. Transform your product images into engaging TikTok, Instagram Reels, or YouTube Shorts in seconds.</p>
        </div>

        <!-- 模板选择区域 - 占满双栏 -->
        <div class="template-section">
          <div class="section-header">
            <h2 class="section-title-large">Choose Your Video Template</h2>
            <p class="section-subtitle">Select from our professionally designed templates for TikTok, Instagram Reels, or YouTube Shorts</p>
          </div>
          
          <!-- 分类标签 -->
          <div class="template-categories">
            <div class="category-tabs">
              <button 
                v-for="category in categories"
                :key="category.value"
                :class="['category-tab', { active: currentCategory === category.value }]"
                @click="filterTemplates(category.value)"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <!-- 模板网格 -->
          <div class="template-grid-large">
            <div 
              v-for="template in filteredTemplates"
              :key="template.id"
              :class="['template-card', { 
                'selected': selectedTemplate === template.id,
                'horizontal-template': template.horizontal 
              }]"
              :data-category="template.category"
              @click="selectTemplate(template.id)"
            >
              <div class="template-preview-wrapper">
                <img class="template-preview" :src="template.preview" :alt="template.name">
                <div class="template-overlay">
                  <span class="play-icon">▶</span>
                </div>
              </div>
              <div class="template-info">
                <h3 class="template-name">{{ template.name }}</h3>
                <p class="template-desc">{{ template.description }}</p>
                <div class="template-tags">
                  <span class="tag">{{ template.platform }}</span>
                  <span v-if="template.badge" :class="['tag', template.badgeType]">{{ template.badge }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要工作区 -->
        <div class="workspace">
          <!-- 左侧：产品上传 -->
          <div class="workspace-left">
            <!-- 产品上传 -->
            <div class="upload-container">
              <div class="upload-header">
                <span class="section-title">Replace A Product Image</span>
                <el-button type="text" class="reset-btn" @click="resetUpload">
                  <i class="el-icon-refresh-left"></i> Reset
                </el-button>
              </div>
              <p class="upload-hint">Upload a JPG or PNG image, within 10MB each.</p>
              
              <el-upload
                class="upload-area"
                drag
                action="#"
                :show-file-list="false"
                :before-upload="handleFileUpload"
                accept="image/jpeg,image/jpg,image/png"
              >
                <div v-if="!productImage" class="upload-content">
                  <div class="upload-icon">📤</div>
                  <div class="upload-title">Product</div>
                  <div class="upload-subtitle">Click to upload or drag and drop</div>
                  <el-button class="upload-btn">Choose Image</el-button>
                </div>
                <img v-else :src="productImage" class="uploaded-image">
              </el-upload>

              <div class="tip-box">
                <strong>Tip:</strong> Upload product images with a simple or transparent background. Try generating multiple times for the best results.
              </div>

              <!-- 示例产品 -->
              <div class="sample-products">
                <div 
                  v-for="sample in sampleProducts"
                  :key="sample.type"
                  class="sample-product"
                  @click="loadSampleProduct(sample.type)"
                >
                  <img :src="sample.image" :alt="sample.type">
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：运动文案和设置 -->
          <div class="workspace-right">
            <!-- 运动文案 -->
            <div class="settings-container">
              <div class="section-title">Motion Description</div>
              <el-input
                type="textarea"
                v-model="motionText"
                :rows="5"
                placeholder="A slow push-in shot, first, this red gift box appears..."
                class="motion-input"
              ></el-input>
              <div class="motion-preset">
                <el-button
                  v-for="preset in motionPresets"
                  :key="preset.type"
                  size="small"
                  class="preset-btn"
                  @click="setMotionPreset(preset.type)"
                >
                  {{ preset.label }}
                </el-button>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="actions-container">
              <el-button
                type="primary"
                class="generate-btn"
                :disabled="!productImage || isGenerating"
                :loading="isGenerating"
                @click="generateVideo"
              >
                <span v-if="!isGenerating">Generate 🎬 <span class="credit-count">1</span></span>
                <span v-else>Generating...</span>
              </el-button>

              <!-- 进度信息 -->
              <div v-if="isGenerating" class="process-info">
                <div class="process-status">
                  <div class="status-icon">⏳</div>
                  <div class="status-text">Generating your ad video...</div>
                  <div class="status-percent">{{ processPercent }}%</div>
                </div>
                <el-progress 
                  :percentage="processPercent" 
                  :stroke-width="8"
                  :show-text="false"
                ></el-progress>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="preview-header">
            <h2 class="preview-title">Video Preview</h2>
          </div>
          <div class="preview-container">
            <div v-if="!generatedVideo" class="preview-placeholder">
              <div class="preview-placeholder-icon">🎥</div>
              <p class="placeholder-title">No video generated yet</p>
              <p class="placeholder-text">Select a template, upload your product image, and click Generate to create your ad video</p>
            </div>
            <div v-else class="generated-content">
              <div class="video-mockup">
                <div class="mockup-icon">🎬</div>
                <div>Video Generated Successfully!</div>
                <div class="mockup-info">Template: {{ selectedTemplate }}</div>
              </div>
              <div class="preview-actions">
                <el-button type="success" @click="downloadVideo">
                  <i class="el-icon-download"></i> Download
                </el-button>
                <el-button type="primary" @click="regenerateVideo">
                  <i class="el-icon-refresh"></i> Regenerate
                </el-button>
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
  name: 'AIAdVideoGenerator',
  data() {
    return {
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🎯', label: 'AI Ad Generator', active: true },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],

      // 分类
      categories: [
        { value: 'all', label: 'All Templates' },
        { value: 'tiktok', label: 'TikTok (9:16)' },
        { value: 'youtube', label: 'YouTube (16:9)' },
        { value: 'trending', label: '🔥 Trending' }
      ],
      currentCategory: 'all',

      // 模板数据
      templates: [
        {
          id: 'unboxing',
          name: 'Unboxing Experience',
          description: 'Perfect for product reveals',
          category: 'tiktok trending',
          platform: 'TikTok',
          badge: 'HOT',
          badgeType: 'hot',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23ff69b4" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">📦%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'product-reveal',
          name: 'Product Reveal',
          description: 'Dramatic product showcase',
          category: 'tiktok',
          platform: 'TikTok',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%236366f1" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">✨%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'before-after',
          name: 'Before & After',
          description: 'Show transformation results',
          category: 'tiktok',
          platform: 'TikTok',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%2310b981" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🔄%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'lifestyle',
          name: 'Lifestyle',
          description: 'Daily life product integration',
          category: 'tiktok trending',
          platform: 'TikTok',
          badge: 'TRENDING',
          badgeType: 'trending',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23fbbf24" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🌟%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'testimonial',
          name: 'Customer Testimonial',
          description: 'Social proof & reviews',
          category: 'tiktok',
          platform: 'TikTok',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23a855f7" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">💬%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'flash-sale',
          name: 'Flash Sale',
          description: 'Urgency & special offers',
          category: 'tiktok trending',
          platform: 'TikTok',
          badge: 'NEW',
          badgeType: 'new',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"%3E%3Crect fill="%23ef4444" width="9" height="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">⚡%3C/text%3E%3C/svg%3E',
          horizontal: false
        },
        {
          id: 'youtube-intro',
          name: 'YouTube Intro',
          description: 'Professional video opening',
          category: 'youtube',
          platform: 'YouTube',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%23dc2626" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">▶️%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'comparison',
          name: 'Product Comparison',
          description: 'Side-by-side analysis',
          category: 'youtube',
          platform: 'YouTube',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%230891b2" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">⚖️%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'tutorial',
          name: 'How-To Tutorial',
          description: 'Step-by-step guide',
          category: 'youtube',
          platform: 'YouTube',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%2316a34a" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">📚%3C/text%3E%3C/svg%3E',
          horizontal: true
        },
        {
          id: 'showcase',
          name: 'Product Showcase',
          description: 'Cinematic presentation',
          category: 'youtube trending',
          platform: 'YouTube',
          badge: 'HOT',
          badgeType: 'hot',
          preview: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Crect fill="%237c3aed" width="16" height="9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white" font-size="2">🎬%3C/text%3E%3C/svg%3E',
          horizontal: true
        }
      ],

      // 示例产品
      sampleProducts: [
        {
          type: 'cosmetic',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🧴%3C/text%3E%3C/svg%3E'
        },
        {
          type: 'perfume',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fce7f3" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🍾%3C/text%3E%3C/svg%3E'
        },
        {
          type: 'skincare',
          image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23dcfce7" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" font-size="40">🧪%3C/text%3E%3C/svg%3E'
        }
      ],

      // 运动预设
      motionPresets: [
        { type: 'dramatic', label: 'Dramatic Reveal' },
        { type: 'smooth', label: 'Smooth Transition' },
        { type: 'energetic', label: 'Energetic Pop' },
        { type: 'elegant', label: 'Elegant Flow' }
      ],

      presetTexts: {
        dramatic: 'A dramatic slow zoom-in, the product emerges from darkness with spotlights, rotating 360 degrees to showcase every angle, finishing with a burst of light effects...',
        smooth: 'Smooth camera movement gliding across the product, soft focus transitions, elegant text overlays appearing with gentle fade-ins...',
        energetic: 'Fast-paced cuts, dynamic zooms, vibrant color pulses, product bouncing with energy, explosive particle effects surrounding the item...',
        elegant: 'Graceful floating motion, soft lighting sweeps across the product, delicate particle effects, minimalist text animations with sophisticated timing...'
      },

      // 状态
      selectedTemplate: 'unboxing',
      productImage: '',
      motionText: 'A slow push-in shot, first, this red gift box appears with a gentle bounce animation, then sparkles surround it as the lid opens revealing the product inside...',
      isGenerating: false,
      processPercent: 0,
      generatedVideo: false
    }
  },

  computed: {
    // 过滤后的模板
    filteredTemplates() {
      if (this.currentCategory === 'all') {
        return this.templates
      }
      return this.templates.filter(template => 
        template.category.includes(this.currentCategory)
      )
    }
  },

  methods: {
    // 处理菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },

    // 筛选模板
    filterTemplates(category) {
      this.currentCategory = category
    },

    // 选择模板
    selectTemplate(templateId) {
      this.selectedTemplate = templateId
    },

    // 文件上传处理
    handleFileUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        this.$message.error('Only JPG/PNG images are supported!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('Image size must be less than 10MB!')
        return false
      }

      // 读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        this.productImage = e.target.result
      }
      reader.readAsDataURL(file)
      return false // 阻止默认上传
    },

    // 加载示例产品
    loadSampleProduct(type) {
      const sample = this.sampleProducts.find(s => s.type === type)
      if (sample) {
        this.productImage = sample.image
      }
    },

    // 重置上传
    resetUpload() {
      this.productImage = ''
      this.generatedVideo = false
    },

    // 设置运动预设
    setMotionPreset(type) {
      this.motionText = this.presetTexts[type] || ''
    },

    // 生成视频
    generateVideo() {
      if (!this.productImage) {
        this.$message.warning('Please upload a product image first!')
        return
      }

      this.isGenerating = true
      this.processPercent = 0

      // 模拟生成进度
      const interval = setInterval(() => {
        this.processPercent += Math.floor(Math.random() * 15)
        if (this.processPercent >= 100) {
          this.processPercent = 100
          clearInterval(interval)
          
          setTimeout(() => {
            this.isGenerating = false
            this.generatedVideo = true
            this.$message.success('Video generated successfully!')
          }, 500)
        }
      }, 300)
    },

    // 下载视频
    downloadVideo() {
      this.$message.success('Downloading video...')
      // 实际实现下载逻辑
    },

    // 重新生成
    regenerateVideo() {
      this.generatedVideo = false
      this.generateVideo()
    }
  },

  mounted() {
    // 默认选中第一个模板
    if (this.templates.length > 0) {
      this.selectedTemplate = this.templates[0].id
    }
  }
}
</script>

<style lang="scss" scoped>
@import './AIAdVideoGenerator.scss';
</style>
