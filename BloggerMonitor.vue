<template>
  <DashboardLayout
    page-class="blogger-monitor-page"
    :menu-items="menuItems"
    :locale="locale"
    :available-locales="availableLocales"
    :brand="translate('app.brand')"
    :title="translate('bloggerMonitor.header.title')"
    :subtitle="translate('bloggerMonitor.header.subtitle')"
    :user-name="translate('app.user.account')"
    :user-plan="translate('app.user.plan')"
    :translate="translate"
    @select-menu="handleMenuClick"
    @change-locale="handleLocaleChange"
  >
    <div class="stats-grid">
          <div class="stat-card" v-for="stat in statsData" :key="stat.id">
            <span class="stat-icon">{{ stat.icon }}</span>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ translate(stat.labelKey) }}</div>
          </div>
        </div>

    <div class="platform-sections">
          <div
            v-for="platform in platforms"
            :key="platform.id"
            class="platform-monitor-container"
          >
            <div class="platform-header">
              <span class="platform-icon-large">{{ platform.icon }}</span>
              <span class="platform-name">{{ translate(platform.nameKey) }}</span>
            </div>

            <div class="blogger-input-area">
              <div class="input-with-button">
                <el-input
                  v-model="platform.inputValue"
                  :placeholder="translate(platform.placeholderKey)"
                  class="custom-input"
                  @keyup.enter="addBlogger(platform.id)"
                />
                <el-button type="primary" class="add-btn" @click="addBlogger(platform.id)">
                  {{ translate('bloggerMonitor.actions.add') }}
                </el-button>
              </div>
              <div class="input-hint">{{ translate(platform.hintKey) }}</div>
            </div>

            <div class="monitored-list">
              <div
                v-for="(blogger, index) in platform.bloggers"
                :key="index"
                class="monitored-item"
              >
                <div class="monitored-info">
                  <span class="monitored-name">{{ blogger.name }}</span>
                </div>
                <div :class="['monitored-status', `status-${blogger.status}`]">
                  <span class="status-dot"></span>
                  <span>{{ translate(blogger.statusKey) }}</span>
                </div>
                <el-button
                  type="danger"
                  size="mini"
                  class="remove-btn"
                  @click="removeBlogger(platform.id, index)"
                >
                  {{ translate('bloggerMonitor.actions.remove') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

    <div class="updates-log-section">
          <div class="log-header">
            <h2 class="log-title">📝 {{ translate('bloggerMonitor.log.title') }}</h2>
            <div class="log-filter">
              <button
                v-for="filter in logFilters"
                :key="filter.value"
                :class="['filter-btn', { active: currentFilter === filter.value }]"
                @click="filterLog(filter.value)"
              >
                {{ translate(filter.labelKey) }}
              </button>
            </div>
          </div>

          <div class="log-container">
            <div
              v-for="(log, index) in filteredLogs"
              :key="index"
              class="log-item"
              :data-platform="log.platform"
            >
              <div class="log-time">{{ log.time }}</div>
              <div class="log-content">
                <span class="log-platform-badge">{{ log.platformIcon }} {{ translate(log.platformNameKey) }}</span>
                <div class="log-message">
                  <strong>{{ log.blogger }}</strong> {{ translate(log.messageKey) }}
                </div>
                <a href="#" class="log-link" @click.prevent="viewContent(log)">
                  {{ translate(log.linkTextKey) }} →
                </a>
              </div>
            </div>
          </div>
        </div>

    <div class="download-section">
          <div class="download-header">
            <h2 class="download-title">{{ translate('bloggerMonitor.downloader.title') }}</h2>
            <p class="download-subtitle">{{ translate('bloggerMonitor.downloader.subtitle') }}</p>
          </div>

          <div class="download-input-wrapper">
            <div class="url-input-group">
              <el-input
                v-model="videoUrl"
                :placeholder="translate('bloggerMonitor.downloader.placeholder')"
                class="url-input"
                @keyup.enter="downloadVideo"
              />
              <el-button
                type="primary"
                class="download-btn"
                :loading="downloading"
                @click="downloadVideo"
              >
                <span v-if="!downloading">⬇️ {{ translate('bloggerMonitor.downloader.button') }}</span>
                <span v-else>{{ translate('bloggerMonitor.downloader.processing') }}</span>
              </el-button>
            </div>

            <div class="supported-platforms">
              <div v-for="platform in supportedPlatforms" :key="platform.id" class="platform-tag">
                <span class="platform-tag-icon">{{ platform.icon }}</span>
                <span>{{ translate(platform.nameKey) }}</span>
              </div>
            </div>
          </div>

          <div v-if="downloading" class="process-status">
            <div class="process-icon">⚙️</div>
            <div class="process-text">{{ translate('bloggerMonitor.downloader.progress') }}</div>
          </div>

          <transition name="slide-down">
            <div v-if="showSuccessMessage" class="success-message show">
              <span>✅</span> {{ translate('bloggerMonitor.downloader.success') }}
            </div>
          </transition>
        </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from './components/dashboard/DashboardLayout.vue'
import { supportedLocales, translate as translateText } from './i18n'

export default {
  name: 'BloggerMonitor',
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
        { icon: '📡', labelKey: 'menu.bloggerMonitor', active: true },
        { icon: '🎨', labelKey: 'menu.styleTransfer', active: false },
        { icon: '📁', labelKey: 'menu.projects', active: false },
        { icon: '⚙️', labelKey: 'menu.settings', active: false }
      ],
      statsData: [
        { id: 'bloggers', icon: '👥', value: 8, labelKey: 'bloggerMonitor.stats.bloggers' },
        { id: 'updates', icon: '🔔', value: 12, labelKey: 'bloggerMonitor.stats.updates' },
        { id: 'platforms', icon: '📱', value: 4, labelKey: 'bloggerMonitor.stats.platforms' }
      ],
      platforms: [
        {
          id: 'tiktok',
          nameKey: 'bloggerMonitor.platforms.tiktok',
          icon: '🎵',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.tiktokPlaceholder',
          hintKey: 'bloggerMonitor.platforms.tiktokHint',
          bloggers: [
            { name: '@trendy_creator', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: '@fashionista', status: 'checking', statusKey: 'bloggerMonitor.status.checking' }
          ]
        },
        {
          id: 'douyin',
          nameKey: 'bloggerMonitor.platforms.douyin',
          icon: '🎭',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.douyinPlaceholder',
          hintKey: 'bloggerMonitor.platforms.douyinHint',
          bloggers: [
            { name: '美食达人', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        },
        {
          id: 'instagram',
          nameKey: 'bloggerMonitor.platforms.instagram',
          icon: '📷',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.instagramPlaceholder',
          hintKey: 'bloggerMonitor.platforms.instagramHint',
          bloggers: [
            { name: '@photography_pro', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: '@travel_diary', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        },
        {
          id: 'youtube',
          nameKey: 'bloggerMonitor.platforms.youtube',
          icon: '📺',
          inputValue: '',
          placeholderKey: 'bloggerMonitor.platforms.youtubePlaceholder',
          hintKey: 'bloggerMonitor.platforms.youtubeHint',
          bloggers: [
            { name: 'TechReviews', status: 'active', statusKey: 'bloggerMonitor.status.active' },
            { name: 'GamingChannel', status: 'active', statusKey: 'bloggerMonitor.status.active' }
          ]
        }
      ],
      logFilters: [
        { value: 'all', labelKey: 'bloggerMonitor.log.filters.all' },
        { value: 'tiktok', labelKey: 'bloggerMonitor.platforms.tiktok' },
        { value: 'douyin', labelKey: 'bloggerMonitor.platforms.douyin' },
        { value: 'instagram', labelKey: 'bloggerMonitor.platforms.instagram' },
        { value: 'youtube', labelKey: 'bloggerMonitor.platforms.youtube' }
      ],
      currentFilter: 'all',
      logs: [
        {
          time: '10:32 AM',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformNameKey: 'bloggerMonitor.platforms.tiktok',
          blogger: '@trendy_creator',
          messageKey: 'bloggerMonitor.log.entries.trendy',
          linkTextKey: 'bloggerMonitor.log.links.video'
        },
        {
          time: '09:45 AM',
          platform: 'youtube',
          platformIcon: '📺',
          platformNameKey: 'bloggerMonitor.platforms.youtube',
          blogger: 'TechReviews',
          messageKey: 'bloggerMonitor.log.entries.techReviews',
          linkTextKey: 'bloggerMonitor.log.links.video'
        },
        {
          time: '09:20 AM',
          platform: 'instagram',
          platformIcon: '📷',
          platformNameKey: 'bloggerMonitor.platforms.instagram',
          blogger: '@photography_pro',
          messageKey: 'bloggerMonitor.log.entries.photography',
          linkTextKey: 'bloggerMonitor.log.links.reel'
        },
        {
          time: '08:55 AM',
          platform: 'douyin',
          platformIcon: '🎭',
          platformNameKey: 'bloggerMonitor.platforms.douyin',
          blogger: '美食达人',
          messageKey: 'bloggerMonitor.log.entries.foodCreator',
          linkTextKey: 'bloggerMonitor.log.links.video'
        },
        {
          time: '08:30 AM',
          platform: 'tiktok',
          platformIcon: '🎵',
          platformNameKey: 'bloggerMonitor.platforms.tiktok',
          blogger: '@fashionista',
          messageKey: 'bloggerMonitor.log.entries.fashion',
          linkTextKey: 'bloggerMonitor.log.links.recording'
        },
        {
          time: 'Yesterday',
          platform: 'youtube',
          platformIcon: '📺',
          platformNameKey: 'bloggerMonitor.platforms.youtube',
          blogger: 'GamingChannel',
          messageKey: 'bloggerMonitor.log.entries.gaming',
          linkTextKey: 'bloggerMonitor.log.links.video'
        }
      ],
      supportedPlatforms: [
        { id: 'tiktok', icon: '🎵', nameKey: 'bloggerMonitor.platforms.tiktok' },
        { id: 'douyin', icon: '🎭', nameKey: 'bloggerMonitor.platforms.douyin' },
        { id: 'instagram', icon: '📷', nameKey: 'bloggerMonitor.platforms.instagramReels' },
        { id: 'youtube', icon: '📺', nameKey: 'bloggerMonitor.platforms.youtubeShorts' },
        { id: 'twitter', icon: '📱', nameKey: 'bloggerMonitor.platforms.twitter' },
        { id: 'snapchat', icon: '👻', nameKey: 'bloggerMonitor.platforms.snapchat' }
      ],
      videoUrl: '',
      downloading: false,
      showSuccessMessage: false
    }
  },
  computed: {
    filteredLogs() {
      if (this.currentFilter === 'all') {
        return this.logs
      }
      return this.logs.filter((log) => log.platform === this.currentFilter)
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
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = i === index
      })
    },
    filterLog(filter) {
      this.currentFilter = filter
    },
    addBlogger(platformId) {
      const platform = this.platforms.find((p) => p.id === platformId)
      if (!platform || !platform.inputValue.trim()) {
        this.$message.warning(this.translate('bloggerMonitor.messages.inputRequired'))
        return
      }
      const newBlogger = {
        name: platform.inputValue.trim(),
        status: 'checking',
        statusKey: 'bloggerMonitor.status.checking'
      }
      platform.bloggers.push(newBlogger)
      this.updateStats('bloggers', 1)
      platform.inputValue = ''
      this.$message.success(this.translate('bloggerMonitor.messages.bloggerAdded'))
      setTimeout(() => {
        newBlogger.status = 'active'
        newBlogger.statusKey = 'bloggerMonitor.status.active'
        this.addLogEntry(platformId, newBlogger.name)
      }, 1000)
    },
    removeBlogger(platformId, index) {
      const platform = this.platforms.find((p) => p.id === platformId)
      if (!platform) return
      platform.bloggers.splice(index, 1)
      this.updateStats('bloggers', -1)
      this.$message.info(this.translate('bloggerMonitor.messages.bloggerRemoved'))
    },
    updateStats(statId, delta) {
      const stat = this.statsData.find((item) => item.id === statId)
      if (stat) {
        stat.value = Math.max(0, stat.value + delta)
      }
    },
    addLogEntry(platformId, bloggerName) {
      const now = new Date()
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      const platformInfo = {
        tiktok: { icon: '🎵', nameKey: 'bloggerMonitor.platforms.tiktok' },
        douyin: { icon: '🎭', nameKey: 'bloggerMonitor.platforms.douyin' },
        instagram: { icon: '📷', nameKey: 'bloggerMonitor.platforms.instagram' },
        youtube: { icon: '📺', nameKey: 'bloggerMonitor.platforms.youtube' }
      }
      const entry = {
        time,
        platform: platformId,
        platformIcon: platformInfo[platformId].icon,
        platformNameKey: platformInfo[platformId].nameKey,
        blogger: bloggerName,
        messageKey: 'bloggerMonitor.log.entries.added',
        linkTextKey: 'bloggerMonitor.log.links.profile'
      }
      this.logs.unshift(entry)
      this.updateStats('updates', 1)
      this.$notify({
        title: this.translate('bloggerMonitor.notifications.title'),
        message: this.translate('bloggerMonitor.notifications.message'),
        type: 'success'
      })
    },
    viewContent(log) {
      this.$message.info(
        this.translateWithParams('bloggerMonitor.messages.opening', { blogger: log.blogger })
      )
    },
    downloadVideo() {
      if (!this.videoUrl.trim()) {
        this.$message.warning(this.translate('bloggerMonitor.messages.urlRequired'))
        return
      }
      if (!this.videoUrl.startsWith('http')) {
        this.$message.error(this.translate('bloggerMonitor.messages.invalidUrl'))
        return
      }
      this.downloading = true
      this.showSuccessMessage = false
      setTimeout(() => {
        this.downloading = false
        this.showSuccessMessage = true
        this.$message.success(this.translate('bloggerMonitor.messages.downloaded'))
        setTimeout(() => {
          this.showSuccessMessage = false
        }, 3000)
        this.videoUrl = ''
      }, 1500)
    }
  }
}
</script>

<style scoped lang="scss">
@import './BloggerMonitor.scss';
</style>
