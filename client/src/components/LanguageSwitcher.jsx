import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Directly import the i18n instance
import DropdownMenu from './DropdownMenu';
import { LanguageIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'zh-TW', name: '繁體中文' },
  ];

  return (
    <DropdownMenu
      trigger={
        <button className="flex items-center space-x-1 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-150">
          <LanguageIcon className="h-5 w-5" />
          <span className="text-sm">{i18n.language.toUpperCase()}</span>
        </button>
      }
    >
      {languages.map((lang) => (
        <div
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          {lang.name}
        </div>
      ))}
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
