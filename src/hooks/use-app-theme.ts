import {useAtom} from 'jotai';
import {PaletteMode} from '@mui/material';
import {themeAtom} from 'store';

const useAppTheme = (): [PaletteMode, () => void] => {
    const [theme, setTheme] = useAtom(themeAtom);

    const toggleAppTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('app_theme', newTheme);
    }

    return [theme, toggleAppTheme];
}

export default useAppTheme;
