import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next) // Keep this in the chain
  .init({
    fallbackLng: 'en',
    debug: false, // Set to false in production
    supportedLngs: ['en', 'ja', 'zh-CN', 'zh-TW'],
    nonExplicitSupportedLngs: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;

