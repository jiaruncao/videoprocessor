<template>
  <div :class="[pageClass, 'dashboard-shell']">
    <aside class="sidebar">
      <div class="logo">{{ brand }}</div>
      <nav class="nav-menu">
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          :class="['nav-item', { active: isActive(index, item) }]"
          @click="$emit('select-menu', index)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ resolveLabel(item) }}</span>
        </div>
      </nav>
      <div class="user-info">
        <div class="nav-item user-account">
          <span class="nav-icon">👤</span>
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="user-plan">{{ userPlan }}</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-container">
      <div class="content-wrapper">
        <div class="header">
          <div class="language-switcher">
            <label :for="languageSelectId" class="language-label">
              {{ translate('language.label') }}
            </label>
            <select
              :id="languageSelectId"
              :value="locale"
              class="language-select"
              @change="handleLocaleChange"
            >
              <option
                v-for="code in availableLocales"
                :key="code"
                :value="code"
              >
                {{ translate(`language.options.${code}`) }}
              </option>
            </select>
          </div>
          <h1 class="header-title">{{ title }}</h1>
          <p class="header-subtitle">{{ subtitle }}</p>
          <slot name="header-extra" />
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'DashboardLayout',
  props: {
    pageClass: {
      type: String,
      default: 'dashboard-page'
    },
    menuItems: {
      type: Array,
      default: () => []
    },
    locale: {
      type: String,
      required: true
    },
    availableLocales: {
      type: Array,
      default: () => []
    },
    brand: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    },
    userPlan: {
      type: String,
      default: ''
    },
    translate: {
      type: Function,
      required: true
    }
  },
  computed: {
    languageSelectId() {
      return `${this.pageClass}-locale`
    }
  },
  methods: {
    handleLocaleChange(event) {
      const value = event.target.value
      this.$emit('change-locale', value)
    },
    isActive(index, item) {
      if (typeof item.active !== 'undefined') {
        return item.active
      }
      return index === 0
    },
    resolveLabel(item) {
      if (item.label) {
        return item.label
      }
      if (item.labelKey) {
        return this.translate(item.labelKey)
      }
      return ''
    }
  }
}
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 260px;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.logo {
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 32px;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.2);
  color: #fff;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.16);
}

.nav-icon {
  font-size: 18px;
}

.user-info {
  margin-top: 24px;
}

.user-account {
  background: rgba(148, 163, 184, 0.16);
}

.main-container {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.1);
}

.header-title {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 28px;
  color: #0f172a;
}

.header-subtitle {
  margin: 0 0 32px;
  color: #475569;
  font-size: 16px;
}

.language-switcher {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: #475569;
}

.language-label {
  font-size: 14px;
  font-weight: 500;
}

.language-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5f5;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
}

.language-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
</style>
