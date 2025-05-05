import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import enMessages from './locales/en.json'
import zhTWMessages from './locales/zh-TW.json'
import zhCNMessages from './locales/zh-CN.json'
import './styles/main.css'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en: enMessages,
    'zh-TW': zhTWMessages,
    'zh-CN': zhCNMessages
  }
})

// Create and mount the app
const app = createApp(App)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app') 