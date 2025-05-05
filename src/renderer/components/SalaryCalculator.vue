<template>
  <div class="salary-calculator">
    <h2 class="calculator-title">{{ t('calculator.title') }}</h2>
    
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
    
    <el-button 
      type="primary" 
      class="calculate-button" 
      @click="calculateSalary"
    >
      {{ t('button.calculate') }}
    </el-button>
    
    <div class="results">
      <div class="result-item">
        <span class="result-label">Daily Rate:</span>
        <span class="result-value">{{ formatCurrency(dailyRate) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Hourly Rate:</span>
        <span class="result-value">{{ formatCurrency(hourlyRate) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Minute Rate:</span>
        <span class="result-value">{{ formatCurrency(minuteRate) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">{{ t('salary.perSecond') }}</span>
        <span class="result-value">{{ formatCurrency(secondRate) }}</span>
      </div>
    </div>
    
    <div class="earned-section" v-if="secondRate > 0">
      <div class="earned-amount">
        <div class="earned-label">{{ t('salary.earned') }}</div>
        <div class="earned-value">{{ formatCurrency(earnedAmount) }}</div>
      </div>
      
      <el-button 
        :type="isRunning ? 'danger' : 'success'"
        class="counter-button"
        @click="toggleCounter"
      >
        {{ isRunning ? t('button.stop') : t('button.start') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const monthlySalary = ref(30000);
const workingDays = ref(22);
const workingHours = ref(8);
const earnedAmount = ref(0);
const isRunning = ref(false);
let countInterval = null;

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

// 格式化货币
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(value);
};

const calculateSalary = () => {
  // 保存到本地存储
  localStorage.setItem('monthlySalary', monthlySalary.value);
  localStorage.setItem('workingDays', workingDays.value);
  localStorage.setItem('workingHours', workingHours.value);
};

// 开始/停止计数器
const toggleCounter = () => {
  if (isRunning.value) {
    stopCounter();
  } else {
    startCounter();
  }
};

// 开始计数器
const startCounter = () => {
  if (!countInterval) {
    isRunning.value = true;
    countInterval = setInterval(() => {
      earnedAmount.value += secondRate.value;
    }, 1000);
  }
};

// 停止计数器
const stopCounter = () => {
  if (countInterval) {
    clearInterval(countInterval);
    countInterval = null;
    isRunning.value = false;
    localStorage.setItem('earnedAmount', earnedAmount.value);
  }
};

onMounted(() => {
  // 从本地存储加载数据
  const savedMonthlySalary = localStorage.getItem('monthlySalary');
  const savedWorkingDays = localStorage.getItem('workingDays');
  const savedWorkingHours = localStorage.getItem('workingHours');
  const savedEarnedAmount = localStorage.getItem('earnedAmount');
  
  if (savedMonthlySalary) monthlySalary.value = Number(savedMonthlySalary);
  if (savedWorkingDays) workingDays.value = Number(savedWorkingDays);
  if (savedWorkingHours) workingHours.value = Number(savedWorkingHours);
  if (savedEarnedAmount) earnedAmount.value = Number(savedEarnedAmount);
});

onBeforeUnmount(() => {
  stopCounter();
});
</script>

<style scoped>
.salary-calculator {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.calculator-title {
  text-align: center;
  margin-bottom: 24px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
}

.calculate-button {
  width: 100%;
  margin-bottom: 20px;
}

.results {
  margin-top: 10px;
  padding: 16px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.result-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.result-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.result-value {
  font-family: monospace;
  font-size: 1.1em;
  color: var(--el-color-primary);
}

.earned-section {
  margin-top: 20px;
  padding: 16px;
  border-radius: 4px;
  background-color: var(--el-color-success-light-9);
  text-align: center;
}

.earned-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.earned-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-success);
  margin-bottom: 16px;
  font-family: monospace;
}

.counter-button {
  width: 100%;
}
</style> 