import Box from '@mui/material/Box';
import {useNavigate} from '@reach/router';
import useTranslation from 'hooks/use-translation';
import AppContentHeaderBase from 'views/components/app-content-header-base';
import useStyle from 'hooks/use-styles';

const SettingsHeader = (props: { section?: string }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const styles = useStyle();

    return <AppContentHeaderBase>
        <Box sx={{
            fontFamily: 'Faktum, sans-serif',
            ...styles.ellipsis
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
