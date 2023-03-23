import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import {useNavigate} from '@reach/router';
import useTranslation from 'hooks/use-translation';

const SettingsHeader = (props: { section?: string }) => {
    const theme = useTheme();
    const [t] = useTranslation();
    const navigate = useNavigate();

    return <Box>
        <Box sx={{
            height: '88px',
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            alignItems: 'center',
            pl: '20px',
        }}>
            <Box sx={{
                fontFamily: 'Faktum, sans-serif',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
            }}>
                {(() => {
                    if (props.section) {
                        return <>
                            <Box component="span" sx={{
                                cursor: 'pointer',
                                ':hover': {
                                    textDecoration: 'underline'
                                }
                            }} onClick={() => {
                                navigate('/settings').then();
                            }}>{t('Settings')}</Box> {` > ${props.section} `}
                        </>
                    }

                    return t('Settings');
                })()}
            </Box>
        </Box>
    </Box>
}

export default SettingsHeader;
