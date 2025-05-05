import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import enLocale from './locales/en.json'
import zhTWLocale from './locales/zh-TW.json'
import './styles/main.css';

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en: enLocale,
    'zh-TW': zhTWLocale
  }
})

// Create and mount the app
const app = createApp(App)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app') 