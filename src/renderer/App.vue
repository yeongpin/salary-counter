<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }" @click="handleOutsideClick">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-expanded': sidebarExpanded || rainSettingsExpanded }">
      <!-- GitHub button -->
      <div class="sidebar-toggle" @click.stop="openGithub">
        <el-icon>
          <svg width="800" height="800" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.522 2.3 6.507 5.431 7.584.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076-.343-.93-.881-1.175-.881-1.175-.734-.489.048-.489.048-.489.783.049 1.224.832 1.224.832.734 1.223 1.859.88 2.3.685.048-.538.293-.88.489-1.076-1.762-.196-3.621-.881-3.621-3.964 0-.88.293-1.566.832-2.153-.05-.147-.343-.978.098-2.055 0 0 .685-.196 2.201.832.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.98 7.98 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0"/>
          </svg>
        </el-icon>
      </div>
      
      <!-- Currency Rain Settings button -->
      <div class="sidebar-toggle" @click.stop="toggleRainSettings">
        <el-icon>
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12v-2h-4V7h-2v3h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h6v3h-8v2h4v3h2v-3h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-6v-3Z"/>
            <path d="M16 4A12 12 0 1 1 4 16 12.035 12.035 0 0 1 16 4m0-2a14 14 0 1 0 14 14A14.04 14.04 0 0 0 16 2"/>
          </svg>
        </el-icon>
      </div>
      
      <!-- Settings button -->
      <div class="sidebar-toggle" @click.stop="toggleSidebar">
        <el-icon><Setting /></el-icon>
      </div>
      
      <!-- Main settings panel -->
      <div class="sidebar-content" v-show="sidebarExpanded" @click.stop>
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
      
      <!-- Currency Rain Settings Panel -->
      <div class="sidebar-content rain-settings" v-show="rainSettingsExpanded" @click.stop>
        <div class="sidebar-header">
          <h3 class="sidebar-title">{{ t('rainSettings.title') }}</h3>
          <el-button 
            class="reset-rain-button" 
            type="primary" 
            circle 
            @click="resetRainSettings"
            title="Reset to defaults"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        
        <div class="setting-group">
          <label>{{ t('rainSettings.enabled') }}</label>
          <el-switch
            v-model="rainEnabled"
            @change="toggleRainEnabled"
          />
        </div>
        
        <div class="setting-group" :class="{ 'disabled': !rainEnabled }">
          <label>{{ t('rainSettings.color') }}</label>
          <div class="setting-row">
            <el-color-picker
              v-model="rainColor"
              show-alpha
              @change="changeRainColor"
              :disabled="randomColor || !rainEnabled"
            />
            <div class="random-option">
              <el-checkbox v-model="randomColor" @change="toggleRandomColor" :disabled="!rainEnabled">
                {{ t('rainSettings.random') }}
              </el-checkbox>
            </div>
          </div>
        </div>
        
        <div class="setting-group" :class="{ 'disabled': !rainEnabled }">
          <label>{{ t('rainSettings.speed') }}</label>
          <el-slider
            v-model="rainSpeed"
            :min="0.5"
            :max="3"
            :step="0.1"
            @change="changeRainSpeed"
            :disabled="!rainEnabled"
          />
        </div>
        
        <div class="setting-group" :class="{ 'disabled': !rainEnabled }">
          <label>{{ t('rainSettings.size') }}</label>
          <el-slider
            v-model="rainSize"
            :min="0.5"
            :max="2"
            :step="0.1"
            @change="changeRainSize"
            :disabled="!rainEnabled"
          />
        </div>
        
        <div class="setting-group" :class="{ 'disabled': !rainEnabled }">
          <label>{{ t('rainSettings.density') }}</label>
          <el-slider
            v-model="rainDensity"
            :min="10"
            :max="200"
            :step="10"
            @change="changeRainDensity"
            :disabled="!rainEnabled"
          />
        </div>
        
        <div class="setting-group" :class="{ 'disabled': !rainEnabled }">
          <label>{{ t('rainSettings.autoStart') }}</label>
          <el-switch
            v-model="autoStartRain"
            @change="toggleAutoStartRain"
            :disabled="!rainEnabled"
          />
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
import { Setting, Refresh } from '@element-plus/icons-vue';

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
// default to dark mode, unless explicitly set to light mode in local storage
const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false');
let countInterval = null;
let animationFrame = null;
let lastTimestamp = null;

// currency rain settings
const rainSettingsExpanded = ref(false);
const rainColor = ref(localStorage.getItem('rainColor') || '#85bb65');
const rainSpeed = ref(Number(localStorage.getItem('rainSpeed')) || 1);
const rainSize = ref(Number(localStorage.getItem('rainSize')) || 1);
const rainDensity = ref(Number(localStorage.getItem('rainDensity')) || 100);
const randomColor = ref(localStorage.getItem('randomColor') === 'true');
const autoStartRain = ref(localStorage.getItem('autoStartRain') === 'true');
const rainEnabled = ref(localStorage.getItem('rainEnabled') !== 'false'); // default enabled

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
  // use daily rate as max value, so it takes a whole day to fill
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
  // save settings to local storage
  localStorage.setItem('monthlySalary', monthlySalary.value);
  localStorage.setItem('workingDays', workingDays.value);
  localStorage.setItem('workingHours', workingHours.value);
  localStorage.setItem('currency', currency.value);
  localStorage.setItem('decimalPlaces', decimalPlaces.value);
};

// Toggle sidebar
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
  if (sidebarExpanded.value) {
    rainSettingsExpanded.value = false;
  }
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

// Open GitHub repository
const openGithub = () => {
  window.open('https://github.com/yeongpin/salary-counter', '_blank');
};

// toggle currency rain settings panel
const toggleRainSettings = () => {
  rainSettingsExpanded.value = !rainSettingsExpanded.value;
  if (rainSettingsExpanded.value) {
    sidebarExpanded.value = false;
  }
};

// change currency rain color
const changeRainColor = (color) => {
  localStorage.setItem('rainColor', color);
  if (window.currencyRain) {
    window.currencyRain.setColor(color);
  } else {
    window.postMessage({ type: 'setColor', data: color }, '*');
  }
};

// change currency rain speed
const changeRainSpeed = (speed) => {
  localStorage.setItem('rainSpeed', speed);
  if (window.currencyRain) {
    window.currencyRain.setSpeed(speed);
  } else {
    window.postMessage({ type: 'setSpeed', data: speed }, '*');
  }
};

// change currency rain size
const changeRainSize = (size) => {
  localStorage.setItem('rainSize', size);
  if (window.currencyRain) {
    window.currencyRain.setSize(size);
  } else {
    window.postMessage({ type: 'setSize', data: size }, '*');
  }
};

// change currency rain density
const changeRainDensity = (density) => {
  localStorage.setItem('rainDensity', density);
  if (window.currencyRain) {
    window.currencyRain.setDensity(density);
  } else {
    window.postMessage({ type: 'setDensity', data: density }, '*');
  }
};

// toggle random color
const toggleRandomColor = (value) => {
  localStorage.setItem('randomColor', value);
  if (window.currencyRain) {
    window.currencyRain.setRandomColor(value);
  } else {
    window.postMessage({ type: 'setRandomColor', data: value }, '*');
  }
};

// toggle auto start
const toggleAutoStartRain = (value) => {
  localStorage.setItem('autoStartRain', value);
};

// toggle currency rain enabled
const toggleRainEnabled = (value) => {
  localStorage.setItem('rainEnabled', value);
  
  if (window.currencyRain) {
    window.currencyRain.setEnabled(value);
  } else {
    window.postMessage({ type: 'setEnabled', data: value }, '*');
  }
  
  // if disabled, stop rain
  if (!value) {
    if (window.currencyRain) {
      window.currencyRain.setRunning(false);
    } else {
      window.postMessage({ type: 'setRunning', data: false }, '*');
    }
  } else if (isRunning.value || autoStartRain.value) {
    // if enabled, and counter is running or auto start is enabled, then start rain
    if (window.currencyRain) {
      window.currencyRain.setRunning(true);
    } else {
      window.postMessage({ type: 'setRunning', data: true }, '*');
    }
  }
};

// reset currency rain settings
const resetRainSettings = () => {
  rainColor.value = '#85bb65';
  rainSpeed.value = 1;
  rainSize.value = 1;
  rainDensity.value = 100;
  randomColor.value = false;
  autoStartRain.value = false;
  rainEnabled.value = true;
  
  // save to local storage
  localStorage.setItem('rainColor', rainColor.value);
  localStorage.setItem('rainSpeed', rainSpeed.value);
  localStorage.setItem('rainSize', rainSize.value);
  localStorage.setItem('rainDensity', rainDensity.value);
  localStorage.setItem('randomColor', randomColor.value);
  localStorage.setItem('autoStartRain', autoStartRain.value);
  localStorage.setItem('rainEnabled', rainEnabled.value);
  
  // update currency rain effect
  if (window.currencyRain) {
    window.currencyRain.resetSettings();
  } else {
    window.postMessage({ type: 'resetSettings', data: null }, '*');
  }
};

// listen to currency change
watch(() => currency.value, (newCurrency) => {
  if (window.currencyRain) {
    window.currencyRain.setCurrency(newCurrency);
  } else {
    window.postMessage({ type: 'setCurrency', data: newCurrency }, '*');
  }
});

// listen to running status change
watch(() => isRunning.value, (newRunning) => {
  if (window.currencyRain) {
    window.currencyRain.setRunning(newRunning);
  } else {
    window.postMessage({ type: 'setRunning', data: newRunning }, '*');
  }
});

// listen to theme change
watch(() => isDarkMode.value, (isDark) => {
  // only set color when user doesn't set custom color
  if (rainColor.value === '#85bb65' || rainColor.value === '#53fc53') {
    const color = isDark ? '#85bb65' : '#53fc53';
    rainColor.value = color;
    if (window.currencyRain) {
      window.currencyRain.setColor(color);
    } else {
      window.postMessage({ type: 'setColor', data: color }, '*');
    }
  }
});

// handle click outside area
const handleOutsideClick = () => {
  if (sidebarExpanded.value) {
    sidebarExpanded.value = false;
  }
  if (rainSettingsExpanded.value) {
    rainSettingsExpanded.value = false;
  }
};

// When component mounts
onMounted(() => {
  // Load settings from local storage
  const savedLocale = localStorage.getItem('language');
  const savedMonthlySalary = localStorage.getItem('monthlySalary');
  const savedWorkingDays = localStorage.getItem('workingDays');
  const savedWorkingHours = localStorage.getItem('workingHours');
  const savedCurrency = localStorage.getItem('currency');
  const savedDecimalPlaces = localStorage.getItem('decimalPlaces');
  const savedEarnedAmount = localStorage.getItem('earnedAmount');
  
  if (savedLocale) {
    currentLocale.value = savedLocale;
    locale.value = savedLocale;
  }
  
  if (savedMonthlySalary) monthlySalary.value = Number(savedMonthlySalary);
  if (savedWorkingDays) workingDays.value = Number(savedWorkingDays);
  if (savedWorkingHours) workingHours.value = Number(savedWorkingHours);
  if (savedCurrency) currency.value = savedCurrency;
  if (savedDecimalPlaces) decimalPlaces.value = Number(savedDecimalPlaces);
  if (savedEarnedAmount) earnedAmount.value = Number(savedEarnedAmount);
  
  // Apply dark mode
  document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
  
  // load currency rain settings
  const savedRainColor = localStorage.getItem('rainColor');
  const savedRainSpeed = localStorage.getItem('rainSpeed');
  const savedRainSize = localStorage.getItem('rainSize');
  const savedRainDensity = localStorage.getItem('rainDensity');
  const savedRandomColor = localStorage.getItem('randomColor');
  const savedAutoStartRain = localStorage.getItem('autoStartRain');
  const savedRainEnabled = localStorage.getItem('rainEnabled');
  
  if (savedRainColor) rainColor.value = savedRainColor;
  if (savedRainSpeed) rainSpeed.value = Number(savedRainSpeed);
  if (savedRainSize) rainSize.value = Number(savedRainSize);
  if (savedRainDensity) rainDensity.value = Number(savedRainDensity);
  if (savedRandomColor) randomColor.value = savedRandomColor === 'true';
  if (savedAutoStartRain) autoStartRain.value = savedAutoStartRain === 'true';
  if (savedRainEnabled !== null) rainEnabled.value = savedRainEnabled !== 'false';
  
  // initialize currency rain settings
  setTimeout(() => {
    if (window.currencyRain) {
      window.currencyRain.setCurrency(currency.value);
      window.currencyRain.setColor(rainColor.value);
      window.currencyRain.setSpeed(rainSpeed.value);
      window.currencyRain.setSize(rainSize.value);
      window.currencyRain.setDensity(rainDensity.value);
      window.currencyRain.setRandomColor(randomColor.value);
      window.currencyRain.setEnabled(rainEnabled.value);
      
      // if enabled and auto start, then start rain
      if (rainEnabled.value && autoStartRain.value) {
        window.currencyRain.setRunning(true);
      } else {
        window.currencyRain.setRunning(isRunning.value && rainEnabled.value);
      }
    } else {
      window.postMessage({ type: 'setCurrency', data: currency.value }, '*');
      window.postMessage({ type: 'setColor', data: rainColor.value }, '*');
      window.postMessage({ type: 'setSpeed', data: rainSpeed.value }, '*');
      window.postMessage({ type: 'setSize', data: rainSize.value }, '*');
      window.postMessage({ type: 'setDensity', data: rainDensity.value }, '*');
      window.postMessage({ type: 'setRandomColor', data: randomColor.value }, '*');
      window.postMessage({ type: 'setEnabled', data: rainEnabled.value }, '*');
      
      // if enabled and auto start, then start rain
      if (rainEnabled.value && autoStartRain.value) {
        window.postMessage({ type: 'setRunning', data: true }, '*');
      } else {
        window.postMessage({ type: 'setRunning', data: isRunning.value && rainEnabled.value }, '*');
      }
    }
  }, 500);
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
  display: flex;
  flex-direction: column;
  gap: 10px; /* 按鈕間距 */
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
  z-index: 1000;
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
  align-content: center;
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

/* 货币雨设置面板样式 */
.rain-settings {
  max-width: 300px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 var(--shadow-color);
}

/* 货币雨图标样式 */
.sidebar-toggle svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 设置面板标题栏 */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 重置按钮 */
.reset-rain-button {
  font-size: 14px;
  padding: 6px;
}

/* 设置行样式 */
.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flex-grow {
  flex-grow: 1;
}

/* 随机选项样式 */
.random-option {
  white-space: nowrap;
}

/* 禁用状态样式 */
.setting-group.disabled {
  opacity: 0.6;
}
</style> 