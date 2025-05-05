const translations = {
  en: {
    tray: {
      show: 'Show',
      exit: 'Exit'
    },
    titleBar: {
      title: 'Salary Calculator'
    }
  },
  'zh-TW': {
    tray: {
      show: '顯示',
      exit: '退出'
    },
    titleBar: {
      title: '薪資計算器'
    }
  }
};

// Get user's language preference
const getUserLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch (error) {
    return 'en';
  }
};

// Translate function
const t = (key) => {
  const lang = getUserLanguage();
  const keys = key.split('.');
  
  let result = translations[lang];
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      // Fallback to English
      result = translations.en;
      for (const fallbackKey of keys) {
        if (result && result[fallbackKey]) {
          result = result[fallbackKey];
        } else {
          return key; // Return the key if translation not found
        }
      }
    }
  }
  
  return result;
};

module.exports = { t }; 