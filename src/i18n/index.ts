import i18n from 'i18next';
import moment from 'moment';

export const langOptions = [
    {
        code: 'en-US',
        name: 'English'
    }
];

const enUs = require('./locales/en-US.json');

const resources = {
    'en-US': {
        translation: enUs
    }
};

i18n.init({
    resources,
    fallbackLng: 'en-US',
    interpolation: {
        escapeValue: false
    },
});

i18n.on('languageChanged', function (lang) {
    moment.locale(lang);
});

export {i18n};

export const _t = (k: string, args = {}) => {
    return i18n.t(k, args);
};