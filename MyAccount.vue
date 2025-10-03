<template>
  <div class="my-account-page">
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
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </nav>
      <div class="user-info-section">
        <div class="nav-item active user-account-nav">
          <span>👤</span>
          <div class="user-nav-info">
            <div class="user-nav-title">My Account</div>
            <div class="user-nav-plan">{{ currentPlan }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-container">
      <!-- 右上角用户头像 -->
      <div class="top-user-avatar" @click="scrollToTop">{{ userInitials }}</div>

      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="header">
          <h1>My Account</h1>
          <p>Manage your profile, monitor usage statistics, and upgrade your plan to unlock unlimited creative possibilities.</p>
        </div>

        <!-- 账户概览卡片 -->
        <el-card class="card-container">
          <div class="section-title">Account Overview</div>
          
          <!-- 点击展开账户信息 -->
          <div class="user-profile" @click="toggleAccountInfo">
            <div class="avatar">{{ userInitials }}</div>
            <div class="user-info">
              <div class="user-name">{{ userData.name }}</div>
              <div class="user-email">{{ userData.email }}</div>
              <el-tag 
                :type="currentPlan === 'FREE PLAN' ? 'warning' : 'primary'"
                effect="plain"
                class="user-badge"
              >
                {{ currentPlan }}
              </el-tag>
            </div>
            <div class="expand-indicator">
              <span>View Account Settings</span>
              <i :class="['el-icon-arrow-down', 'expand-arrow', { expanded: accountInfoExpanded }]"></i>
            </div>
          </div>

          <!-- 可折叠的账户设置 -->
          <el-collapse-transition>
            <div v-show="accountInfoExpanded" class="account-settings">
              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">Full Name</span>
                  <span class="setting-value">{{ userData.name }}</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="editProfile">Edit</el-button>
                </div>
              </div>
              
              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">Email Address</span>
                  <span class="setting-value">{{ userData.email }}</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="changeEmail">Change Email</el-button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">Password</span>
                  <span class="setting-value">••••••••••••</span>
                </div>
                <div class="setting-action">
                  <el-button size="small" @click.stop="changePassword">Change Password</el-button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-label">
                  <span class="setting-title">Account Created</span>
                  <span class="setting-value">{{ userData.accountCreated }}</span>
                </div>
                <div class="setting-action">
                  <el-button type="danger" size="small" @click.stop="deleteAccount">Delete Account</el-button>
                </div>
              </div>
            </div>
          </el-collapse-transition>
        </el-card>

        <!-- 每日使用限制 -->
        <el-card class="card-container">
          <div class="section-title">Daily Usage Limits</div>
          
          <div v-for="usage in usageData" :key="usage.type" class="usage-item">
            <div class="usage-header">
              <span class="usage-title">{{ usage.title }}</span>
              <span class="usage-count">{{ usage.used }} / {{ usage.limit }} {{ usage.unit }}</span>
            </div>
            <el-progress 
              :percentage="usage.percentage" 
              :stroke-width="8"
              :show-text="false"
              :color="getProgressColor(usage.percentage)"
            />
          </div>

          <p class="usage-notice">
            Daily limits reset at 12:00 AM UTC • Upgrade to Pro for unlimited usage
          </p>
        </el-card>

        <!-- 订阅计划 -->
        <el-card class="card-container">
          <div class="section-title">Subscription Plans</div>
          
          <!-- 计费周期切换 -->
          <div class="billing-toggle">
            <span :class="['billing-option', { active: !isYearly }]">Monthly</span>
            <el-switch 
              v-model="isYearly"
              active-color="#6366f1"
              inactive-color="#e2e8f0"
              @change="handleBillingChange"
            />
            <span :class="['billing-option', { active: isYearly }]">Yearly</span>
            <el-tag type="success" size="mini" class="save-badge">Save 20%</el-tag>
          </div>

          <el-row :gutter="20" class="plans-grid">
            <!-- 免费计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', { current: currentPlan === 'FREE PLAN' }]">
                <div class="plan-name">Free</div>
                <div class="plan-price">
                  $0 <span>/month</span>
                </div>
                <div class="plan-desc">Perfect for personal projects and testing</div>
                <el-tag type="warning" effect="plain" class="plan-expiry">
                  No Expiration
                </el-tag>
                <ul class="plan-features">
                  <li class="plan-feature">5 video enhancements per day</li>
                  <li class="plan-feature">10 watermark removals per day</li>
                  <li class="plan-feature">3 style transfers per day</li>
                  <li class="plan-feature">5 GB cloud storage</li>
                  <li class="plan-feature">Standard processing speed</li>
                </ul>
                <el-button 
                  :disabled="currentPlan === 'FREE PLAN'"
                  class="plan-btn"
                >
                  {{ currentPlan === 'FREE PLAN' ? 'Current Plan' : 'Downgrade' }}
                </el-button>
              </div>
            </el-col>

            <!-- Pro计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', 'recommended', { current: currentPlan === 'PRO PLAN' }]">
                <el-tag type="success" class="plan-badge">RECOMMENDED</el-tag>
                <div class="plan-name">Pro</div>
                <div class="plan-price">
                  {{ isYearly ? '$15.20' : '$19' }} <span>/month</span>
                  <span v-if="isYearly" class="original-price">$19</span>
                </div>
                <div class="plan-desc">For professionals and content creators</div>
                <el-tag 
                  v-if="currentPlan === 'PRO PLAN'" 
                  type="warning" 
                  effect="plain" 
                  class="plan-expiry"
                >
                  Expires: {{ proExpiry }}
                </el-tag>
                <ul class="plan-features">
                  <li class="plan-feature">Unlimited video enhancements</li>
                  <li class="plan-feature">Unlimited watermark removals</li>
                  <li class="plan-feature">Unlimited style transfers</li>
                  <li class="plan-feature">100 GB cloud storage</li>
                  <li class="plan-feature">Priority processing speed</li>
                  <li class="plan-feature">4K resolution support</li>
                </ul>
                <el-button 
                  type="primary"
                  class="plan-btn"
                  @click="upgradePlan('pro')"
                  :disabled="currentPlan === 'PRO PLAN'"
                >
                  {{ currentPlan === 'PRO PLAN' ? 'Current Plan' : 'Upgrade to Pro' }}
                </el-button>
              </div>
            </el-col>

            <!-- Enterprise计划 -->
            <el-col :xs="24" :sm="24" :md="8">
              <div :class="['plan-card', { current: currentPlan === 'ENTERPRISE PLAN' }]">
                <div class="plan-name">Enterprise</div>
                <div class="plan-price">
                  {{ isYearly ? '$79.20' : '$99' }} <span>/month</span>
                  <span v-if="isYearly" class="original-price">$99</span>
                </div>
                <div class="plan-desc">For teams and businesses</div>
                <el-tag 
                  v-if="currentPlan === 'ENTERPRISE PLAN'" 
                  type="warning" 
                  effect="plain" 
                  class="plan-expiry"
                >
                  Expires: {{ enterpriseExpiry }}
                </el-tag>
                <ul class="plan-features">
                  <li class="plan-feature">Everything in Pro</li>
                  <li class="plan-feature">Unlimited team members</li>
                  <li class="plan-feature">1 TB cloud storage</li>
                  <li class="plan-feature">API access</li>
                  <li class="plan-feature">Priority support</li>
                  <li class="plan-feature">Custom integrations</li>
                </ul>
                <el-button 
                  type="primary"
                  class="plan-btn"
                  @click="upgradePlan('enterprise')"
                  :disabled="currentPlan === 'ENTERPRISE PLAN'"
                >
                  {{ currentPlan === 'ENTERPRISE PLAN' ? 'Current Plan' : 'Upgrade to Enterprise' }}
                </el-button>
              </div>
            </el-col>
          </el-row>

          <!-- 取消订阅按钮 -->
          <div v-if="currentPlan !== 'FREE PLAN'" class="cancel-section">
            <el-button type="danger" @click="cancelSubscription">
              Cancel Subscription
            </el-button>
            <p class="cancel-notice">
              Your subscription will remain active until the end of the billing period
            </p>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="card-container">
          <div class="section-title">Recent Activity</div>
          <div class="activity-list">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div 
                class="activity-icon"
                :style="{ background: activity.iconBg, color: activity.iconColor }"
              >
                {{ activity.icon }}
              </div>
              <div class="activity-details">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <el-tag :type="activity.status === 'Completed' ? 'success' : 'warning'" size="mini">
                {{ activity.status }}
              </el-tag>
              <el-button 
                type="primary" 
                size="mini" 
                @click="downloadFile(activity.file)"
              >
                Download
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'MyAccount',
  data() {
    return {
      // 用户数据
      userData: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        accountCreated: 'January 15, 2024'
      },
      
      // 当前计划
      currentPlan: 'FREE PLAN',
      
      // 计费周期
      isYearly: true,
      
      // 账户信息展开状态
      accountInfoExpanded: false,
      
      // 计划到期日期
      proExpiry: '',
      enterpriseExpiry: '',
      
      // 菜单项
      menuItems: [
        { icon: '📊', label: 'Dashboard', active: false },
        { icon: '✨', label: 'Video/Image Enhancer', active: false },
        { icon: '🧹', label: 'Watermark Remover', active: false },
        { icon: '🎨', label: 'Style Transfer', active: false },
        { icon: '🔊', label: 'Audio Enhancement', active: false },
        { icon: '📁', label: 'My Projects', active: false },
        { icon: '⚙️', label: 'Settings', active: false }
      ],
      
      // 使用量数据
      usageData: [
        { type: 'video', title: 'Video Enhancement', used: 3, limit: 5, unit: 'used today', percentage: 60 },
        { type: 'watermark', title: 'Watermark Removal', used: 8, limit: 10, unit: 'used today', percentage: 80 },
        { type: 'style', title: 'Style Transfer', used: 1, limit: 3, unit: 'used today', percentage: 33 },
        { type: 'audio', title: 'Audio Enhancement', used: 2, limit: 5, unit: 'used today', percentage: 40 },
        { type: 'storage', title: 'Cloud Storage', used: 2.4, limit: 5, unit: 'GB used', percentage: 48 }
      ],
      
      // 最近活动
      activities: [
        {
          id: 1,
          icon: '✨',
          iconBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          iconColor: '#1e40af',
          title: 'Video Enhanced - summer_vacation.mp4',
          time: '2 hours ago',
          status: 'Completed',
          file: 'summer_vacation_enhanced.mp4'
        },
        {
          id: 2,
          icon: '🧹',
          iconBg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          iconColor: '#065f46',
          title: 'Watermark Removed - product_photo.jpg',
          time: '4 hours ago',
          status: 'Completed',
          file: 'product_photo_clean.jpg'
        },
        {
          id: 3,
          icon: '🎨',
          iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          iconColor: '#5b21b6',
          title: 'Style Transfer - portrait.png',
          time: 'Yesterday at 3:45 PM',
          status: 'Completed',
          file: 'portrait_styled.png'
        },
        {
          id: 4,
          icon: '🔊',
          iconBg: 'linear-gradient(135deg, #fed7aa, #fdba74)',
          iconColor: '#9a3412',
          title: 'Audio Enhanced - podcast_episode.mp3',
          time: 'Yesterday at 10:30 AM',
          status: 'Completed',
          file: 'podcast_episode_enhanced.mp3'
        },
        {
          id: 5,
          icon: '✨',
          iconBg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          iconColor: '#1e40af',
          title: 'Video Enhanced - presentation.mp4',
          time: '2 days ago',
          status: 'Completed',
          file: 'presentation_enhanced.mp4'
        }
      ]
    }
  },
  
  computed: {
    // 计算用户名缩写
    userInitials() {
      return this.userData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }
  },
  
  methods: {
    // 切换账户信息展开/折叠
    toggleAccountInfo() {
      this.accountInfoExpanded = !this.accountInfoExpanded
    },
    
    // 处理菜单点击
    handleMenuClick(index) {
      this.menuItems.forEach((item, i) => {
        item.active = false
      })
      this.menuItems[index].active = true
      // 这里可以添加路由跳转
      // this.$router.push(this.menuItems[index].route)
    },
    
    // 处理计费周期切换
    handleBillingChange(value) {
      // 计费周期改变时的逻辑
      console.log('Billing changed to:', value ? 'Yearly' : 'Monthly')
    },
    
    // 获取进度条颜色
    getProgressColor(percentage) {
      if (percentage >= 80) return '#ef4444'
      if (percentage >= 60) return '#f59e0b'
      return '#6366f1'
    },
    
    // 升级计划
    upgradePlan(plan) {
      const planNames = {
        'pro': 'Pro',
        'enterprise': 'Enterprise'
      }
      
      const planPrices = {
        'pro': this.isYearly ? '$182.40/year' : '$19/month',
        'enterprise': this.isYearly ? '$950.40/year' : '$99/month'
      }
      
      this.$confirm(
        `Price: ${planPrices[plan]}<br>Billing: ${this.isYearly ? 'Yearly' : 'Monthly'}<br>You can cancel anytime.`,
        `Upgrade to ${planNames[plan]} Plan?`,
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          dangerouslyUseHTMLString: true,
          type: 'info'
        }
      ).then(() => {
        // 模拟支付流程
        this.$message.info('Redirecting to secure payment page...')
        
        setTimeout(() => {
          // 更新当前计划
          this.currentPlan = `${planNames[plan].toUpperCase()} PLAN`
          
          // 计算到期日期
          const today = new Date()
          const expiryDate = new Date(today)
          if (this.isYearly) {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1)
          } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1)
          }
          const expiryString = expiryDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
          
          if (plan === 'pro') {
            this.proExpiry = expiryString
          } else {
            this.enterpriseExpiry = expiryString
          }
          
          this.$message.success(`Successfully upgraded to ${planNames[plan]} Plan!`)
        }, 1500)
      }).catch(() => {
        console.log('Upgrade cancelled')
      })
    },
    
    // 取消订阅
    cancelSubscription() {
      this.$confirm(
        'Your subscription will remain active until the end of the current billing period.',
        'Are you sure you want to cancel your subscription?',
        {
          confirmButtonText: 'Yes, Cancel',
          cancelButtonText: 'Keep Subscription',
          type: 'warning'
        }
      ).then(() => {
        this.currentPlan = 'FREE PLAN'
        this.proExpiry = ''
        this.enterpriseExpiry = ''
        this.$message.success('Your subscription has been cancelled.')
      }).catch(() => {
        console.log('Cancellation aborted')
      })
    },
    
    // 编辑个人资料
    editProfile() {
      this.$prompt('Enter your new name:', 'Edit Profile', {
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        inputValue: this.userData.name,
        inputPattern: /^.{2,}$/,
        inputErrorMessage: 'Name must be at least 2 characters'
      }).then(({ value }) => {
        this.userData.name = value
        this.$message.success('Profile updated successfully!')
      }).catch(() => {
        console.log('Edit cancelled')
      })
    },
    
    // 更改邮箱
    changeEmail() {
      this.$prompt('Enter your new email address:', 'Change Email', {
        confirmButtonText: 'Send Verification',
        cancelButtonText: 'Cancel',
        inputValue: this.userData.email,
        inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        inputErrorMessage: 'Please enter a valid email address'
      }).then(({ value }) => {
        this.$message.success(`Verification email sent to ${value}`)
      }).catch(() => {
        console.log('Email change cancelled')
      })
    },
    
    // 更改密码
    changePassword() {
      this.$prompt('Enter your current password:', 'Change Password', {
        confirmButtonText: 'Next',
        cancelButtonText: 'Cancel',
        inputType: 'password'
      }).then(() => {
        return this.$prompt('Enter your new password:', 'New Password', {
          confirmButtonText: 'Change Password',
          cancelButtonText: 'Cancel',
          inputType: 'password',
          inputPattern: /^.{8,}$/,
          inputErrorMessage: 'Password must be at least 8 characters'
        })
      }).then(() => {
        this.$message.success('Password changed successfully!')
      }).catch(() => {
        console.log('Password change cancelled')
      })
    },
    
    // 删除账户
    deleteAccount() {
      this.$confirm(
        'This action is irreversible and will permanently delete:<br>• All your projects<br>• Processing history<br>• Stored files<br>• Account settings',
        'Are you sure you want to delete your account?',
        {
          confirmButtonText: 'Delete Account',
          cancelButtonText: 'Cancel',
          type: 'error',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        return this.$prompt('Type "DELETE" to confirm account deletion:', 'Confirm Deletion', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          inputPattern: /^DELETE$/,
          inputErrorMessage: 'Please type DELETE to confirm'
        })
      }).then(() => {
        this.$message.warning('Account deletion initiated. Your account will be permanently deleted in 30 days.')
      }).catch(() => {
        console.log('Account deletion cancelled')
      })
    },
    
    // 下载文件
    downloadFile(filename) {
      this.$message.info(`Downloading: ${filename}`)
      // 实际应用中这里会触发真实的下载
      console.log('Download initiated for:', filename)
    },
    
    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },
  
  mounted() {
    // 组件挂载后的初始化
    console.log('MyAccount component mounted')
  }
}
</script>

<style lang="scss" scoped>
@import './MyAccount.scss';
</style>
