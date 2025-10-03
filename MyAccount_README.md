# MyAccount Component Documentation | 账户页面组件说明文档

## 📋 Overview | 概述

This is a Vue2 + Element UI implementation of the MyAccount page, providing complete account management functionality including profile settings, subscription plans, usage tracking, and activity history.

这是一个基于 Vue2 + Element UI 开发的账户管理页面组件，完整复刻了原 HTML 版本的所有功能和样式。该组件提供了完整的账户管理功能，包括个人资料设置、订阅计划、使用量追踪和活动历史。

## 🎯 Features | 主要功能

### 1. Account Profile Management | 账户资料管理
- View and edit user information | 查看和编辑用户信息
- Change email address with verification | 更改邮箱地址（带验证）
- Update password securely | 安全更新密码
- Delete account with confirmation | 删除账户（带确认）
- Expandable account settings panel | 可展开的账户设置面板

### 2. Subscription Plans | 订阅计划
- Free, Pro, and Enterprise tiers | 免费、专业版和企业版
- Monthly/Yearly billing toggle | 月付/年付切换
- 20% discount for yearly plans | 年付享受20%折扣
- Dynamic pricing display | 动态价格显示
- Subscription expiration dates | 订阅到期日期显示
- Cancel subscription option | 取消订阅选项

### 3. Usage Tracking | 使用量追踪
- Daily usage limits display | 每日使用限制显示
- Real-time progress bars | 实时进度条
- Color-coded usage levels | 颜色编码的使用级别
  - Low (< 60%): Blue | 低使用量：蓝色
  - Medium (60-79%): Orange | 中等使用量：橙色
  - High (≥ 80%): Red | 高使用量：红色
- Cloud storage monitoring | 云存储监控

### 4. Activity History | 活动历史
- Recent project activities | 最近的项目活动
- Download completed files | 下载已完成的文件
- Status indicators | 状态指示器
- Time stamps | 时间戳

## 📦 Dependencies | 依赖项

```json
{
  "vue": "^2.6.14",
  "element-ui": "^2.15.14",
  "sass": "^1.32.7",
  "sass-loader": "^10.1.1"
}
```

## 🚀 Installation | 安装

### 1. Install dependencies | 安装依赖

```bash
# Using npm
npm install vue@2 element-ui sass sass-loader --save

# Using yarn
yarn add vue@2 element-ui sass sass-loader
```

### 2. Import Element UI in main.js | 在 main.js 中引入 Element UI

```javascript
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
```

### 3. Import the component | 引入组件

```javascript
import MyAccount from '@/components/MyAccount.vue'

export default {
  components: {
    MyAccount
  }
}
```

## 📁 File Structure | 文件结构

```
components/
├── MyAccount.vue        # Main component file | 主组件文件
├── MyAccount.scss       # Style file | 样式文件
└── README.md           # Documentation | 说明文档
```

## 🎨 Component Structure | 组件结构

### Data Properties | 数据属性

```javascript
data() {
  return {
    // User information | 用户信息
    userData: {
      name: String,
      email: String,
      accountCreated: String
    },
    
    // Current subscription plan | 当前订阅计划
    currentPlan: String, // 'FREE PLAN' | 'PRO PLAN' | 'ENTERPRISE PLAN'
    
    // Billing cycle | 计费周期
    isYearly: Boolean,
    
    // UI states | UI状态
    accountInfoExpanded: Boolean,
    
    // Plan expiry dates | 计划到期日期
    proExpiry: String,
    enterpriseExpiry: String,
    
    // Navigation menu items | 导航菜单项
    menuItems: Array,
    
    // Usage data | 使用量数据
    usageData: Array,
    
    // Recent activities | 最近活动
    activities: Array
  }
}
```

### Methods | 方法

| Method | Description | 说明 |
|--------|-------------|------|
| `toggleAccountInfo()` | Toggle account settings panel | 切换账户设置面板 |
| `handleMenuClick(index)` | Handle navigation menu clicks | 处理导航菜单点击 |
| `handleBillingChange(value)` | Handle billing cycle change | 处理计费周期更改 |
| `getProgressColor(percentage)` | Get progress bar color based on percentage | 根据百分比获取进度条颜色 |
| `upgradePlan(plan)` | Upgrade to selected plan | 升级到选定计划 |
| `cancelSubscription()` | Cancel current subscription | 取消当前订阅 |
| `editProfile()` | Edit user profile | 编辑用户资料 |
| `changeEmail()` | Change email address | 更改邮箱地址 |
| `changePassword()` | Change password | 更改密码 |
| `deleteAccount()` | Delete account | 删除账户 |
| `downloadFile(filename)` | Download activity file | 下载活动文件 |
| `scrollToTop()` | Scroll to page top | 滚动到页面顶部 |

## 🔧 Configuration | 配置

### Customizing Plans | 自定义计划

You can modify the subscription plans by updating the plan cards in the template:

```vue
<div class="plan-card">
  <div class="plan-name">Custom Plan</div>
  <div class="plan-price">$XX <span>/month</span></div>
  <div class="plan-desc">Description</div>
  <ul class="plan-features">
    <li class="plan-feature">Feature 1</li>
    <li class="plan-feature">Feature 2</li>
  </ul>
</div>
```

### Customizing Usage Limits | 自定义使用限制

Update the `usageData` array in the data property:

```javascript
usageData: [
  {
    type: 'custom',
    title: 'Custom Feature',
    used: 5,
    limit: 10,
    unit: 'used today',
    percentage: 50
  }
]
```

## 🔄 API Integration | API 集成

### Example API Calls | API 调用示例

```javascript
// Update profile | 更新资料
async editProfile() {
  try {
    const response = await this.$http.put('/api/user/profile', {
      name: this.userData.name
    })
    this.$message.success('Profile updated successfully!')
  } catch (error) {
    this.$message.error('Failed to update profile')
  }
}

// Upgrade subscription | 升级订阅
async upgradePlan(plan) {
  try {
    const response = await this.$http.post('/api/subscription/upgrade', {
      plan: plan,
      billingCycle: this.isYearly ? 'yearly' : 'monthly'
    })
    this.currentPlan = `${plan.toUpperCase()} PLAN`
    this.$message.success('Subscription upgraded successfully!')
  } catch (error) {
    this.$message.error('Failed to upgrade subscription')
  }
}
```

## 📱 Responsive Design | 响应式设计

The component includes responsive breakpoints:

- Desktop: Full sidebar + content | 桌面端：完整侧边栏+内容
- Tablet: Collapsed sidebar | 平板端：折叠侧边栏
- Mobile (< 768px): Hidden sidebar | 移动端：隐藏侧边栏

## 🎨 Styling Customization | 样式自定义

### Color Variables | 颜色变量

You can customize the color scheme by modifying these main colors:

```scss
// Primary gradient | 主渐变色
$primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

// Background colors | 背景色
$bg-dark: #1a1d23;        // Sidebar | 侧边栏
$bg-light: #f8f9fb;       // Main content | 主内容区
$bg-white: #ffffff;       // Cards | 卡片

// Text colors | 文字颜色
$text-primary: #1e293b;   // Primary text | 主文字
$text-secondary: #64748b; // Secondary text | 次要文字
$text-muted: #94a3b8;     // Muted text | 弱化文字
```

### Component Size | 组件尺寸

```scss
// Sidebar width | 侧边栏宽度
$sidebar-width: 260px;

// Content max width | 内容最大宽度
$content-max-width: 1400px;

// Card padding | 卡片内边距
$card-padding: 25px;
```

## ⚠️ Important Notes | 注意事项

1. **Element UI Version**: Ensure you're using Element UI 2.x for Vue2 compatibility | 确保使用 Element UI 2.x 版本以兼容 Vue2
2. **SCSS Support**: Project must have SCSS/Sass loader configured | 项目必须配置 SCSS/Sass 加载器
3. **Vue Router**: Navigation menu items can be connected to Vue Router | 导航菜单项可以连接到 Vue Router
4. **API Endpoints**: Replace mock functions with actual API calls in production | 在生产环境中用实际 API 调用替换模拟函数
5. **Authentication**: Implement proper authentication and authorization | 实施适当的认证和授权

## 🚩 Version History | 版本历史

### v1.0.0 (2024-01-25)
- Initial release | 初始发布
- Complete HTML to Vue2 conversion | 完整的 HTML 到 Vue2 转换
- Full Element UI integration | 完整的 Element UI 集成
- Responsive design implementation | 响应式设计实现

## 📞 Support | 支持

For issues or questions, please contact the development team or create an issue in the project repository.

如有问题或疑问，请联系开发团队或在项目仓库中创建 issue。

## 📄 License | 许可证

MIT License - Free to use and modify | MIT 许可证 - 可自由使用和修改
