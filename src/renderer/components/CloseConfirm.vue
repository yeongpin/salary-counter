<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('closeConfirm.title')"
    width="300px"
    :show-close="false"
    center
    append-to-body
    class="close-confirm-dialog"
    :modal-class="'global-dialog-modal'"
  >
    <span class="confirm-message">{{ t('closeConfirm.message') }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleMinimize">{{ t('closeConfirm.minimize') }}</el-button>
        <el-button type="danger" @click="handleExit">{{ t('closeConfirm.exit') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dialogVisible = ref(false);

const emit = defineEmits(['minimize', 'exit']);

const show = () => {
  dialogVisible.value = true;
};

const handleMinimize = () => {
  dialogVisible.value = false;
  emit('minimize');
};

const handleExit = () => {
  dialogVisible.value = false;
  emit('exit');
};

defineExpose({
  show
});
</script>

<style>
.close-confirm-dialog {
  z-index: 3000 !important;
}

.global-dialog-modal {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

.close-confirm-dialog .el-dialog {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.close-confirm-dialog .el-dialog__header {
  padding: 16px;
  background-color: var(--el-color-primary-light-9);
  margin-right: 0;
  text-align: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.close-confirm-dialog .el-dialog__title {
  font-weight: 500;
  font-size: 16px;
  color: var(--el-color-primary);
}

.close-confirm-dialog .el-dialog__body {
  padding: 24px;
  text-align: center;
}

.confirm-message {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.close-confirm-dialog .el-dialog__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.dialog-footer .el-button {
  min-width: 80px;
}
</style> 