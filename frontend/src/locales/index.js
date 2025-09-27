import { I18n } from 'i18n-js';
import en from './en.json';
import ta from './ta.json';

const i18n = new I18n({ en, ta });

i18n.locale = 'en';
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;