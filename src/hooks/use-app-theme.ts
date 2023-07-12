import {useAtom} from 'jotai';
import {PaletteMode} from '@mui/material';
import {themeAtom} from 'atoms';
import {DEFAULT_THEME} from 'const';

const useAppTheme = (): [PaletteMode, () => void] => {
    const [theme, setTheme] = useAtom(themeAtom);

    const toggleAppTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('app_theme', newTheme);
    }

    return [theme || DEFAULT_THEME, toggleAppTheme];
}

export default useAppTheme;
