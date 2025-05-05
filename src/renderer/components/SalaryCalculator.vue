<template>
  <div class="salary-calculator">
    
    <div class="calculator-layout">
      <!-- Left input section -->
      <div class="input-section">
        <div class="input-group">
          <label for="monthly-salary">{{ t('salary.monthly') }}</label>
          <el-input-number
            id="monthly-salary"
            v-model="monthlySalary"
            :min="0"
            :step="1000"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="input-group">
          <label for="working-days">{{ t('salary.days') }}</label>
          <el-input-number
            id="working-days"
            v-model="workingDays"
            :min="1"
            :max="31"
            :step="1"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="input-group">
          <label for="working-hours">{{ t('salary.hours') }}</label>
          <el-input-number
            id="working-hours"
            v-model="workingHours"
            :min="1"
            :max="24"
            :step="0.5"
            controls-position="right"
            @change="calculateSalary"
          />
        </div>
        
        <div class="input-group">
          <label for="currency">{{ t('salary.currency') }}</label>
          <el-select v-model="currency" @change="calculateSalary">
            <el-option value="USD" label="USD ($)" />
            <el-option value="EUR" label="EUR (€)" />
            <el-option value="GBP" label="GBP (£)" />
            <el-option value="JPY" label="JPY (¥)" />
            <el-option value="CNY" label="CNY (¥)" />
            <el-option value="TWD" label="TWD (NT$)" />
          </el-select>
        </div>
        
        <div class="advanced-settings">
          <div class="settings-header" @click="showAdvancedSettings = !showAdvancedSettings">
            <span>{{ t('settings.advanced') }}</span>
            <el-icon :class="{ 'is-rotate': showAdvancedSettings }"><ArrowDown /></el-icon>
          </div>
          
          <div class="settings-content" v-show="showAdvancedSettings">
            <div class="setting-item">
              <label for="decimal-places">{{ t('settings.decimalPlaces') }}</label>
              <el-slider
                v-model="decimalPlaces"
                :min="2"
                :max="6"
                :step="1"
                :marks="{2:'2', 3:'3', 4:'4', 5:'5', 6:'6'}"
                @change="calculateSalary"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right water effect visualization section -->
      <div class="visualization-section">
        <el-tooltip :content="t('salary.perSecondInfo')" placement="top">
          <el-icon class="info-icon-corner"><InfoFilled /></el-icon>
        </el-tooltip>
        
        <div class="earnings-rate-display">
          <el-tooltip placement="top" :content="getRatesDetails()" raw-content>
            <div class="earnings-rate-card">
              <div class="earnings-rate-value">{{ formatCurrency(secondRate) }}</div>
              <div class="earnings-rate-label">{{ t('salary.perSecond') }}</div>
            </div>
          </el-tooltip>
        </div>
        
        <div class="water-container" ref="waterContainer">
          <div class="water-circle">
            <div class="water-wave" :style="{ height: `${100 - fillPercentage}%` }">
              <div class="water-wave-back"></div>
              <div class="water-wave-front"></div>
            </div>
            <div class="earned-display">
              <div class="earned-amount">{{ formatCurrency(earnedAmount, true) }}</div>
              <div class="earned-label">{{ t('salary.earned') }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowDown, InfoFilled } from '@element-plus/icons-vue';

const { t } = useI18n();
const monthlySalary = ref(30000);
const workingDays = ref(22);
const workingHours = ref(8);
const earnedAmount = ref(0);
const isRunning = ref(false);
const currency = ref('USD');
const decimalPlaces = ref(2);
const showAdvancedSettings = ref(false);
const waterContainer = ref(null);
let countInterval = null;
let animationFrame = null;
let lastTimestamp = null;

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

// Get detailed information for all salary rates, used for tooltip
const getRatesDetails = () => {
  return `<div class="tooltip-rates">
    <div class="tooltip-rate-item">
      <span class="tooltip-label">${t('salary.daily')}:</span>
      <span class="tooltip-value">${formatCurrency(dailyRate.value, false, true)}</span>
    </div>
    <div class="tooltip-rate-item">
      <span class="tooltip-label">${t('salary.hourly')}:</span>
      <span class="tooltip-value">${formatCurrency(hourlyRate.value, false, true)}</span>
    </div>
    <div class="tooltip-rate-item">
      <span class="tooltip-label">${t('salary.minute')}:</span>
      <span class="tooltip-value">${formatCurrency(minuteRate.value, false, true)}</span>
    </div>
    <div class="tooltip-rate-item">
      <span class="tooltip-label">${t('salary.perSecond')}:</span>
      <span class="tooltip-value">${formatCurrency(secondRate.value, false, true)}</span>
    </div>
  </div>`;
};

// Calculate water fill percentage
const fillPercentage = computed(() => {
  // Set maximum value to 1 hour of earnings
  const maxValue = hourlyRate.value;
  // If no earnings or max value is 0, return 0%
  if (earnedAmount.value === 0 || maxValue === 0) return 0;
  // Calculate percentage, max 95% (leave some space at the top)
  const percentage = Math.min((earnedAmount.value / maxValue) * 100, 95);
  return percentage;
});

// Format currency
const formatCurrency = (value, isEarned = false, isTooltip = false) => {
  // For tooltips, use more decimal places
  const places = isTooltip ? 6 : (isEarned ? 2 : decimalPlaces.value);
  
  let symbol = '';
  switch (currency.value) {
    case 'USD': symbol = '$'; break;
    case 'EUR': symbol = '€'; break;
    case 'GBP': symbol = '£'; break;
    case 'JPY': symbol = '¥'; break;
    case 'CNY': symbol = '¥'; break;
    case 'TWD': symbol = 'NT$'; break;
    default: symbol = '$';
  }
  
  // Use toFixed instead of Intl.NumberFormat to ensure all decimal places are shown
  if (isTooltip) {
    return `${symbol}${value.toFixed(places)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value,
    currencyDisplay: 'symbol',
    minimumFractionDigits: places,
    maximumFractionDigits: places
  }).format(value);
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
  lastTimestamp = performance.now();
  
  // Use requestAnimationFrame for smoother animation
  const updateCounter = (timestamp) => {
    if (!isRunning.value) return;
    
    const elapsed = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Calculate amount earned during this time period
    const earned = (secondRate.value * elapsed) / 1000;
    earnedAmount.value += earned;
    
    animationFrame = requestAnimationFrame(updateCounter);
  };
  
  animationFrame = requestAnimationFrame(updateCounter);
};

// Stop counter
const stopCounter = () => {
  isRunning.value = false;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
};

// Reset earnings
const resetEarnings = () => {
  stopCounter();
  earnedAmount.value = 0;
};

// When component is mounted
onMounted(() => {
  // Load settings from local storage
  const savedMonthlySalary = localStorage.getItem('monthlySalary');
  const savedWorkingDays = localStorage.getItem('workingDays');
  const savedWorkingHours = localStorage.getItem('workingHours');
  const savedCurrency = localStorage.getItem('currency');
  const savedDecimalPlaces = localStorage.getItem('decimalPlaces');
  
  if (savedMonthlySalary) monthlySalary.value = parseFloat(savedMonthlySalary);
  if (savedWorkingDays) workingDays.value = parseInt(savedWorkingDays);
  if (savedWorkingHours) workingHours.value = parseFloat(savedWorkingHours);
  if (savedCurrency) currency.value = savedCurrency;
  if (savedDecimalPlaces) decimalPlaces.value = parseInt(savedDecimalPlaces);
  
  calculateSalary();
});

// Before component is unmounted
onBeforeUnmount(() => {
  stopCounter();
});
</script>

<style>
/* Global styles, not scoped, to ensure tooltip styles work */
.tooltip-rates {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.tooltip-rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-label {
  font-weight: normal;
  color: #ffffff;
}

.tooltip-value {
  font-weight: bold;
  color: #ffffff;
}

/* Ensure Element Plus tooltips allow HTML content */
.el-tooltip__popper {
  max-width: none !important;
}
</style>

<style scoped>
.salary-calculator {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.calculator-title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.calculator-layout {
  display: flex;
  flex-direction: row;
  gap: 30px;
  margin-bottom: 20px;
  min-height: 500px; /* ensure enough height */
}

.input-section {
  width: 50%;
  padding: 20px;
  background-color: var(--el-fill-color-blank);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.visualization-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-blank);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.input-group .el-input-number,
.input-group .el-select {
  width: 100%;
}

.advanced-settings {
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: var(--el-fill-color-light);
  cursor: pointer;
  transition: background-color 0.3s;
}

.settings-header:hover {
  background-color: var(--el-fill-color);
}

.settings-header .is-rotate {
  transform: rotate(180deg);
}

.settings-content {
  padding: 15px;
  border-top: 1px solid var(--el-border-color-light);
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* New salary rate card styles */
.rates-summary {
  margin-top: 20px;
}

.rates-card {
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
  padding: 15px;
  position: relative;
  cursor: help;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rates-card:hover {
  background-color: var(--el-color-primary-light-8);
}

.rates-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.rates-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.per-second {
  font-size: 14px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}

.info-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 16px;
  color: var(--el-color-info);
}

.water-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.water-circle {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.water-wave {
  position: absolute;
  width: 220px;
  bottom: 0;
  left: 0;
  right: 0;
  top: auto;
  transition: height 0.5s ease;
  background-color: rgba(var(--el-color-primary-rgb), 0.8);
  border-radius: 0 0 50% 50%;
  overflow: hidden;
}

.water-wave-back {
  position: absolute;
  width: 440px;
  height: 440px;
  top: 0;
  left: -110px;
  background: rgba(var(--el-color-primary-rgb), 0.8);
  border-radius: 45%;
  animation: rotate 10s linear infinite;
}

.water-wave-front {
  position: absolute;
  width: 440px;
  height: 440px;
  top: 0;
  left: -110px;
  background: rgba(var(--el-color-primary-rgb), 0.6);
  border-radius: 45%;
  animation: rotate 6s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.earned-display {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.earned-amount {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary-dark-2);
  margin-bottom: 5px;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.earned-label {
  font-size: 16px;
  color: var(--el-text-color-primary);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.info-icon-corner {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 20px;
  color: var(--el-color-info);
  cursor: help;
  z-index: 20;
  transition: color 0.3s;
}

.info-icon-corner:hover {
  color: var(--el-color-primary);
}

.control-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 300px;
  margin-top: 20px;
}

.counter-button,
.reset-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

/* Keep horizontal layout instead of responsive layout */
@media (max-width: 768px) {
  .calculator-layout {
    flex-direction: row; /* maintain horizontal layout */
    gap: 15px; /* reduce gap */
  }
  
  .input-section, 
  .visualization-section {
    padding: 15px; /* reduce padding */
  }
  
  .water-circle {
    width: 180px;
    height: 180px;
  }
  
  .water-wave {
    width: 180px;
  }
  
  .water-wave-back,
  .water-wave-front {
    width: 360px;
    height: 360px;
    left: -90px;
  }
  
  .earned-amount {
    font-size: 20px;
  }
  
  .earned-label {
    font-size: 14px;
  }
  
  .control-buttons {
    max-width: 250px;
  }
}

/* Extra small screen adaptation */
@media (max-width: 576px) {
  .calculator-layout {
    gap: 10px;
  }
  
  .input-section, 
  .visualization-section {
    padding: 10px;
  }
  
  .water-circle {
    width: 150px;
    height: 150px;
  }
  
  .water-wave {
    width: 150px;
  }
  
  .water-wave-back,
  .water-wave-front {
    width: 300px;
    height: 300px;
    left: -75px;
  }
  
  .earned-amount {
    font-size: 18px;
  }
  
  .control-buttons {
    max-width: 200px;
    gap: 10px;
  }
  
  .counter-button,
  .reset-button {
    height: 40px;
    font-size: 14px;
  }
}

.earnings-rate-display {
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.earnings-rate-card {
  background-color: var(--el-color-primary-light-9);
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: help;
  transition: transform 0.3s, box-shadow 0.3s;
}

.earnings-rate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.earnings-rate-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.earnings-rate-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style> 