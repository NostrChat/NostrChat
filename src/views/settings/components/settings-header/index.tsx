import Box from '@mui/material/Box';
import {useNavigate} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import AppContentHeaderBase from 'views/components/app-content-header-base';

const SettingsHeader = (props: { section?: string }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    return <AppContentHeaderBase>
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
    </AppContentHeaderBase>
}

export default SettingsHeader;
