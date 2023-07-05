import React, {useEffect} from 'react';
import {useAtom} from 'jotai';
import {ThemeProvider as MThemeProvider, createTheme, CssBaseline} from '@mui/material';
import {getAppTheme} from 'storage';
import {themeAtom} from 'atoms';
import {DEFAULT_THEME} from 'const';

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        login: true;
    }
}

const themes = {
    'light': createTheme({
        palette: {
            mode: 'light',
        }
    }),
    'dark': createTheme({
        palette: {
            mode: 'dark',
            divider: 'rgba(255, 255, 255, 0.08)',
            primary: {
                main: '#7166FF',
                dark: 'rgb(132, 132, 132)',
            },
            error: {
                main: '#F23047'
            },
            background: {
                default: '#141414',
                paper: '#1F1F1F',
            },
            text: {
                primary: '#ffffff',
                secondary: 'rgb(189, 189, 189)',
            }
        },
        typography: {
            allVariants: {
                fontFamily: 'Inter, sans-serif'
            },
            button: {
                textTransform: 'none'
            },
            fontSize: 16,
        },
        shape: {
            borderRadius: 4,
        },
        components: {
            MuiLink: {
                variants: [
                    {
                        props: {variant: 'inherit'},
                        style: {
                            color: '#FFD60A',
                            textDecorationColor: '#FFD60A'
                        },
                    },
                ],
            },
            MuiButton: {
                variants: [
                    {
                        props: {variant: 'login'},
                        style: {
                            background: 'rgba(255, 255, 255, 0.08)',
                            ':hover': {
                                background: 'rgba(255, 255, 255, 0.12)',
                            }
                        },
                    },
                ],
            },
        },
    })
}


const ThemeProvider = (props: { children: React.ReactNode }) => {
    const [appTheme, setAppTheme] = useAtom(themeAtom);

    useEffect(() => {
        getAppTheme().then(s => {
            setAppTheme(['dark', 'light'].includes(s) ? s : DEFAULT_THEME);
        });
    }, []);

    if (appTheme === undefined) return null;  // Wait until we find theme from storage

    return <MThemeProvider theme={themes[appTheme]}>{props.children}<CssBaseline/></MThemeProvider>;
}

export default ThemeProvider;
