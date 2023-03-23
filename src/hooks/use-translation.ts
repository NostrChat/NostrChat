import {_t, i18n} from '../i18n';

const useTranslation = (): [(k: string, args?: {}) => string, typeof i18n] => {
    const t = (k: string, args = {}):string => {
        return _t(k, args);
    }
    return [t, i18n];
}

export default useTranslation;