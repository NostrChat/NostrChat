import React from 'react';
import {ThemeProvider as MThemeProvider, createTheme, CssBaseline} from '@mui/material';
import {TypographyOptions} from '@mui/material/styles/createTypography';
import useAppTheme from 'hooks/use-app-theme';


declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        login: true;
    }
}

const typography: TypographyOptions = {
    allVariants: {
        fontFamily: 'Inter, sans-serif'
    },
    button: {
        textTransform: 'none'
    },
    fontSize: 16,
};

const shape  = {
    borderRadius: 4
}

const themes = {
    'light': createTheme({
        palette: {
            mode: 'light',
            divider: 'rgba(54, 49, 122, 0.09)',
            primary: {
                main: '#7166FF',
                dark: 'rgb(132, 132, 132)',
            },
            error: {
                main: '#F23047'
            },
            background: {
                default: 'rgb(255, 255, 255)',
                paper: 'rgb(237, 236, 243)',
            },
            text: {
                primary: 'rgb(89, 89, 89)',
                secondary: '#736d6d',
            }
        },
        typography,
        shape,
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
        typography,
        shape,
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
    const [appTheme,] = useAppTheme();

    return <MThemeProvider theme={themes[appTheme]}>{props.children}<CssBaseline/></MThemeProvider>;
}

export default ThemeProvider;
