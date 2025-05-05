<template>
  <div class="app-container">
    <TitleBar :title="t('app.title')" />
    <div class="content-container">
      <SalaryCalculator />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import TitleBar from './components/TitleBar.vue';
import SalaryCalculator from './components/SalaryCalculator.vue';

const { t } = useI18n();
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-bg-color);
}

.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style> 