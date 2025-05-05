<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <!-- Sidebar -->
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
            <el-option value="zh-CN" label="简体中文" />
            <el-option value="zh-TW" label="繁體中文" />
          </el-select>
        </div>
        
        <div class="setting-group">
          <label>{{ t('settings.theme') }}</label>
          <el-switch
            v-model="isDarkMode"
            :active-text="t('settings.darkMode')"
            :inactive-text="t('settings.lightMode')"
            @change="toggleTheme"
          />
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
    
    <!-- Main content area -->
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
// Default to dark mode, unless explicitly set to light mode in local storage
const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false');
let countInterval = null;
let animationFrame = null;
let lastTimestamp = null;

// Switch language
const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('language', lang);
};

// Switch theme
const toggleTheme = (value) => {
  isDarkMode.value = value;
  localStorage.setItem('darkMode', value ? 'true' : 'false');
};

// Calculate various salary rates
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

// Calculate water wave fill percentage
const fillPercentage = computed(() => {
  // 使用日薪作为最大值，这样需要工作一整天才能填满
  const maxValue = dailyRate.value;
  return Math.min(earnedAmount.value / maxValue * 100, 100);
});

// Get progress color
const getProgressColor = () => {
  const percentage = fillPercentage.value;
  if (percentage < 33) {
    return 'red';
  } else if (percentage < 66) {
    return 'orange';
  } else {
    return 'green';
  }
};

// Format currency display
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

// Calculate salary
const calculateSalary = () => {
  // Save settings to local storage
  localStorage.setItem('monthlySalary', monthlySalary.value);
  localStorage.setItem('workingDays', workingDays.value);
  localStorage.setItem('workingHours', workingHours.value);
  localStorage.setItem('currency', currency.value);
  localStorage.setItem('decimalPlaces', decimalPlaces.value);
};

// Toggle sidebar
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
};

// Toggle counter
const toggleCounter = () => {
  if (isRunning.value) {
    stopCounter();
  } else {
    startCounter();
  }
};

// Start counter
const startCounter = () => {
  if (isRunning.value) return;
  
  isRunning.value = true;
  lastTimestamp = Date.now();
  
  // Use requestAnimationFrame for smoother updates
  const updateEarnings = () => {
    const now = Date.now();
    const elapsed = now - lastTimestamp;
    lastTimestamp = now;
    
    earnedAmount.value += (secondRate.value * elapsed / 1000);
    
    if (isRunning.value) {
      animationFrame = requestAnimationFrame(updateEarnings);
    }
  };
  
  animationFrame = requestAnimationFrame(updateEarnings);
};

// Stop counter
const stopCounter = () => {
  isRunning.value = false;
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  // Save earned amount to local storage
  localStorage.setItem('earnedAmount', earnedAmount.value);
};

// Reset earnings
const resetEarnings = () => {
  earnedAmount.value = 0;
  localStorage.setItem('earnedAmount', 0);
};

// When component mounts
onMounted(() => {
  // Check language setting in local storage
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
    currentLocale.value = savedLanguage;
  }
  
  // Check theme setting in local storage
  // If not set, default to dark mode
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === null) {
    localStorage.setItem('darkMode', 'true');
    isDarkMode.value = true;
  } else {
    isDarkMode.value = savedTheme !== 'false';
  }
  
  // Load settings from local storage
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
});

// Before component unmounts
onBeforeUnmount(() => {
  if (isRunning.value) {
    stopCounter();
  }
});
</script>

<style scoped>
/* Base styles */
.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: var(--background-color);
  overflow: hidden;
  transition: all 0.3s ease;
  color: var(--text-color);
}

/* Dark mode */
.dark-mode {
  --background-color: #1a1a1a;
  --text-color: #f5f5f5;
  --border-color: #333;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --card-background: #2a2a2a;
  --primary-color: #6c8cff;
  --secondary-color: #4caf50;
  --input-background: #333;
  --slider-background: #444;
  --scrollbar-thumb: #555;
  --scrollbar-track: #333;
}

/* Light mode - default */
:root {
  --background-color: #f5f7fa;
  --text-color: #333;
  --border-color: #e4e7ed;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --card-background: #ffffff;
  --primary-color: #3b46d3;
  --secondary-color: #4caf50;
  --input-background: #ffffff;
  --slider-background: #e4e7ed;
  --scrollbar-thumb: #c0c4cc;
  --scrollbar-track: #f5f7fa;
}

/* Sidebar styles */
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
  box-shadow: 0 4px 12px var(--shadow-color);
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
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: 0 6px 16px var(--shadow-color);
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
  color: var(--text-color);
}

/* Custom scrollbar */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
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
  color: var(--text-color);
}

/* Custom Element Plus component styles */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background-color: var(--input-background) !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

:deep(.el-input__inner) {
  color: var(--text-color) !important;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--input-background) !important;
}

:deep(.el-popper) {
  background-color: var(--card-background) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--text-color) !important;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: var(--primary-color) !important;
  color: white !important;
}

:deep(.el-slider__runway) {
  background-color: var(--slider-background) !important;
}

:deep(.el-slider__bar) {
  background-color: var(--primary-color) !important;
}

:deep(.el-slider__button) {
  border-color: var(--primary-color) !important;
  background-color: white !important;
}

:deep(.el-switch__core) {
  background-color: var(--slider-background) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--primary-color) !important;
}

:deep(.el-switch__label) {
  color: var(--text-color) !important;
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
  color: var(--text-color);
  opacity: 0.8;
}

.rate-value {
  font-weight: 500;
  color: var(--primary-color);
}

/* Main content area styles */
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
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px var(--shadow-color);
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
  color: var(--text-color);
  opacity: 0.8;
}

/* Water wave container styles */
.water-container {
  margin-bottom: 30px;
}

.progress-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  border: 5px solid var(--primary-color);
  box-shadow: 0 0 20px var(--shadow-color);
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
  background-color: var(--card-background);
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
  color: var(--text-color);
  opacity: 0.8;
  font-weight: normal;
}

/* Button styles */
:deep(.el-button) {
  border-color: transparent;
}

:deep(.el-button--success) {
  background-color: var(--secondary-color);
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
}

:deep(.el-button--warning) {
  background-color: #e6a23c;
}

:deep(.el-button:disabled) {
  background-color: var(--slider-background);
  color: var(--text-color);
  opacity: 0.6;
}

/* Color change */
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

/* Responsive design */
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