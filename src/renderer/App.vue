<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-expanded': sidebarExpanded }">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon><Setting /></el-icon>
      </div>
      
      <div class="sidebar-content" v-show="sidebarExpanded">
        <h3 class="sidebar-title">{{ t('settings.title') }}</h3>
        
        <div class="setting-group">
          <label>{{ t('settings.language') }}</label>
          <el-select v-model="currentLocale" @change="changeLanguage">
            <el-option value="en" label="English" />
            <el-option value="zh-TW" label="繁體中文" />
          </el-select>
        </div>
        
        <div class="setting-group">
          <label>{{ t('salary.monthly') }}</label>
          <el-input-number
            v-model="monthlySalary"
            :min="0"
            :step="1000"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="setting-group">
          <label>{{ t('salary.days') }}</label>
          <el-input-number
            v-model="workingDays"
            :min="1"
            :max="31"
            :step="1"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="setting-group">
          <label>{{ t('salary.hours') }}</label>
          <el-input-number
            v-model="workingHours"
            :min="1"
            :max="24"
            :step="0.5"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="setting-group">
          <label>{{ t('salary.currency') }}</label>
          <el-select v-model="currency" @change="calculateSalary">
            <el-option value="USD" label="USD ($)" />
            <el-option value="EUR" label="EUR (€)" />
            <el-option value="GBP" label="GBP (£)" />
            <el-option value="JPY" label="JPY (¥)" />
            <el-option value="CNY" label="CNY (¥)" />
            <el-option value="TWD" label="TWD (NT$)" />
          </el-select>
        </div>
        
        <div class="setting-group">
          <label>{{ t('settings.decimalPlaces') }}</label>
          <el-slider
            v-model="decimalPlaces"
            :min="2"
            :max="6"
            :step="1"
            :marks="{2:'2', 3:'3', 4:'4', 5:'5', 6:'6'}"
            @change="calculateSalary"
          />
        </div>
        
        <div class="rates-details">
          <div class="rate-item">
            <span class="rate-label">{{ t('salary.daily') }}:</span>
            <span class="rate-value">{{ formatCurrency(dailyRate) }}</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">{{ t('salary.hourly') }}:</span>
            <span class="rate-value">{{ formatCurrency(hourlyRate) }}</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">{{ t('salary.minute') }}:</span>
            <span class="rate-value">{{ formatCurrency(minuteRate) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <div class="calculator-container">
        <div class="earnings-rate-display">
          <div class="earnings-rate-card">
            <div class="earnings-rate-value">{{ formatCurrency(secondRate) }}</div>
            <div class="earnings-rate-label">{{ t('salary.perSecond') }}</div>
          </div>
        </div>
        
        <div class="water-container">
          <div class="progress-wrapper" :class="getProgressColor()">
            <div class="progress">
              <div class="inner">
                <div class="percent">
                  <span>{{ formatCurrency(earnedAmount, true) }}</span>
                  <div class="earned-label">{{ t('salary.earned') }}</div>
                </div>
                <div class="water" :style="{ top: 100 - fillPercentage + '%' }"></div>
                <div class="glare"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="control-buttons">
          <el-button 
            :type="isRunning ? 'danger' : 'success'"
            class="counter-button"
            size="large"
            @click="toggleCounter"
          >
            {{ isRunning ? t('button.stop') : t('button.start') }}
          </el-button>
          
          <el-button 
            type="warning" 
            class="reset-button"
            size="large"
            @click="resetEarnings"
            :disabled="earnedAmount === 0"
          >
            {{ t('button.reset') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Setting } from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const currentLocale = ref(locale.value);
const sidebarExpanded = ref(false);
const monthlySalary = ref(30000);
const workingDays = ref(22);
const workingHours = ref(8);
const earnedAmount = ref(0);
const isRunning = ref(false);
const currency = ref('USD');
const decimalPlaces = ref(2);
let countInterval = null;
let animationFrame = null;
let lastTimestamp = null;

// 切换语言
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('language', lang);
};

// 计算各种薪资率
const dailyRate = computed(() => {
  return monthlySalary.value / workingDays.value;
});

const hourlyRate = computed(() => {
  return dailyRate.value / workingHours.value;
});

const minuteRate = computed(() => {
  return hourlyRate.value / 60;
});

const secondRate = computed(() => {
  return minuteRate.value / 60;
});

// 计算水波填充百分比
const fillPercentage = computed(() => {
  // 假设最大值为月薪的1%
  const maxValue = monthlySalary.value * 0.01;
  return Math.min(earnedAmount.value / maxValue * 100, 100);
});

// 获取进度颜色
const getProgressColor = () => {
  const percentage = fillPercentage.value;
  if (percentage < 33) return 'red';
  if (percentage < 66) return 'orange';
  return 'green';
};

// 格式化货币显示
const formatCurrency = (value, isEarned = false, forTooltip = false) => {
  const places = forTooltip ? 6 : (isEarned ? decimalPlaces.value : 2);
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.value,
    minimumFractionDigits: places,
    maximumFractionDigits: places
  });
  return formatter.format(value);
};

// 计算薪资
const calculateSalary = () => {
  // 保存设置到本地存储
  localStorage.setItem('monthlySalary', monthlySalary.value);
  localStorage.setItem('workingDays', workingDays.value);
  localStorage.setItem('workingHours', workingHours.value);
  localStorage.setItem('currency', currency.value);
  localStorage.setItem('decimalPlaces', decimalPlaces.value);
};

// 切换计数器
const toggleCounter = () => {
  if (isRunning.value) {
    stopCounter();
  } else {
    startCounter();
  }
};

// 开始计数器
const startCounter = () => {
  if (isRunning.value) return;
  
  isRunning.value = true;
  lastTimestamp = Date.now();
  
  // 使用requestAnimationFrame实现更平滑的更新
  const updateEarnings = () => {
    const now = Date.now();
    const elapsed = now - lastTimestamp;
    lastTimestamp = now;
    
    // 计算这段时间内赚取的金额
    earnedAmount.value += (secondRate.value * elapsed / 1000);
    
    // 保存到本地存储
    localStorage.setItem('earnedAmount', earnedAmount.value);
    
    if (isRunning.value) {
      animationFrame = requestAnimationFrame(updateEarnings);
    }
  };
  
  animationFrame = requestAnimationFrame(updateEarnings);
};

// 停止计数器
const stopCounter = () => {
  isRunning.value = false;
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
};

// 重置收益
const resetEarnings = () => {
  earnedAmount.value = 0;
  localStorage.setItem('earnedAmount', 0);
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
};

// 从本地存储加载设置
const loadSettings = () => {
  const savedMonthlySalary = localStorage.getItem('monthlySalary');
  const savedWorkingDays = localStorage.getItem('workingDays');
  const savedWorkingHours = localStorage.getItem('workingHours');
  const savedCurrency = localStorage.getItem('currency');
  const savedDecimalPlaces = localStorage.getItem('decimalPlaces');
  const savedEarnedAmount = localStorage.getItem('earnedAmount');
  
  if (savedMonthlySalary) monthlySalary.value = Number(savedMonthlySalary);
  if (savedWorkingDays) workingDays.value = Number(savedWorkingDays);
  if (savedWorkingHours) workingHours.value = Number(savedWorkingHours);
  if (savedCurrency) currency.value = savedCurrency;
  if (savedDecimalPlaces) decimalPlaces.value = Number(savedDecimalPlaces);
  if (savedEarnedAmount) earnedAmount.value = Number(savedEarnedAmount);
};

// 组件挂载时
onMounted(() => {
  loadSettings();
  calculateSalary();
  
  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

// 组件卸载前
onBeforeUnmount(() => {
  stopCounter();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// 处理页面可见性变化
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面不可见时暂停计数
    if (isRunning.value) {
      stopCounter();
    }
  } else {
    // 页面可见时恢复计数
    if (isRunning.value) {
      startCounter();
    }
  }
};
</script>

<style>
:root {
  --sidebar-width: 60px;
  --sidebar-expanded-width: 320px;
  --primary-color: #3b46d3;
  --primary-light: #e6e9fc;
  --text-color: #333;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --transition-speed: 0.3s;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: var(--background-color);
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 100;
  transition: all 0.3s ease;
}

.sidebar-toggle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  z-index: 101;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
}

.sidebar-toggle .el-icon {
  font-size: 24px;
}

.sidebar-content {
  position: absolute;
  bottom: 60px;
  left: 0;
  width: 300px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
}

.sidebar-title {
  margin-bottom: 20px;
  color: var(--primary-color);
  font-size: 20px;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.setting-group .el-input-number,
.setting-group .el-select {
  width: 100%;
}

.rates-details {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.rate-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rate-label {
  color: #666;
}

.rate-value {
  font-weight: 500;
  color: var(--primary-color);
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.calculator-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.earnings-rate-display {
  margin-bottom: 30px;
}

.earnings-rate-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.earnings-rate-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.earnings-rate-label {
  font-size: 16px;
  color: #666;
}

/* 水波进度圆圈样式 */
.water-container {
  margin-bottom: 30px;
}

.progress-wrapper {
  margin-top: 15px;
}

.progress {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  border: 5px solid var(--primary-color);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  transition: all 1s ease;
}

.progress .inner {
  position: absolute;
  overflow: hidden;
  z-index: 2;
  border-radius: 50%;
  width: 240px;
  height: 240px;
  border: 5px solid var(--background-color);
  transition: all 1s ease;
}

.progress .inner .water {
  position: absolute;
  z-index: 1;
  width: 200%;
  height: 200%;
  left: -50%;
  border-radius: 40%;
  background: rgba(59, 70, 211, 0.5);
  transition: all 1s ease;
  animation: wave 10s linear infinite;
  box-shadow: 0 0 20px rgba(59, 70, 211, 0.3);
}

.progress .inner .glare {
  position: absolute;
  top: -120%;
  left: -120%;
  z-index: 5;
  width: 200%;
  height: 200%;
  transform: rotate(45deg);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  transition: all 1s ease;
}

.progress .inner .percent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-weight: bold;
  text-align: center;
  font-size: 28px;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: all 1s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.progress .inner .percent span {
  display: block;
  font-size: 32px;
  margin-bottom: 5px;
  margin-top: 10px;
}

.progress .inner .percent .earned-label {
  font-size: 16px;
  color: #666;
  font-weight: normal;
}

/* 颜色变化 */
.red .progress {
  border-color: #ed3b3b;
}

.red .progress .inner .water {
  background: rgba(237, 59, 59, 0.5);
  box-shadow: 0 0 20px rgba(237, 59, 59, 0.3);
}

.red .progress .inner .percent {
  color: #ed3b3b;
}

.orange .progress {
  border-color: #f07c3e;
}

.orange .progress .inner .water {
  background: rgba(240, 124, 62, 0.5);
  box-shadow: 0 0 20px rgba(240, 124, 62, 0.3);
}

.orange .progress .inner .percent {
  color: #f07c3e;
}

.green .progress {
  border-color: #53fc53;
}

.green .progress .inner .water {
  background: rgba(83, 252, 83, 0.5);
  box-shadow: 0 0 20px rgba(83, 252, 83, 0.3);
}

.green .progress .inner .percent {
  color: #53fc53;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.control-buttons {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 320px;
}

.counter-button,
.reset-button {
  flex: 1;
  height: 50px;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress {
    width: 200px;
    height: 200px;
  }
  
  .progress .inner {
    width: 190px;
    height: 190px;
  }
  
  .progress .inner .percent {
    font-size: 24px;
  }
  
  .progress .inner .percent span {
    font-size: 26px;
    margin-top: 8px;
  }
  
  .control-buttons {
    max-width: 280px;
  }
}

@media (max-width: 576px) {
  .sidebar-content {
    width: 260px;
  }
  
  .progress {
    width: 180px;
    height: 180px;
  }
  
  .progress .inner {
    width: 170px;
    height: 170px;
  }
  
  .progress .inner .percent {
    font-size: 22px;
  }
  
  .progress .inner .percent span {
    font-size: 24px;
    margin-top: 6px;
  }
  
  .control-buttons {
    max-width: 240px;
    gap: 12px;
  }
  
  .counter-button,
  .reset-button {
    height: 44px;
    font-size: 16px;
  }
}
</style> 