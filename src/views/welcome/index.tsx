import {useEffect} from 'react';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import MetadataForm from 'views/components/metadata-form';
import {keysAtom, profileAtom, ravenAtom} from '../../store';
import Plus from 'svg/plus';
import Close from 'svg/close';

const WelcomePage = (_: RouteComponentProps) => {
    const [isSm,] = useMediaBreakPoint();
    const [t,] = useTranslation();
    const navigate = useNavigate();
    const [profile] = useAtom(profileAtom);
    const [raven] = useAtom(ravenAtom);
    const [keys] = useAtom(keysAtom);

    useEffect(() => {
        if (profile) {
            navigate('/').then();
        }
    }, [profile]);

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);

    const skip = () => {
        navigate('/').then();
    }

    return <>
        <Helmet><title>{t('NostrChat - Welcome')}</title></Helmet>
        <Box sx={{
            width: isSm ? '590px' : '96%'
        }}>
            <Card sx={{
                p: '26px 32px 26px 32px',
            }}>
                <Plus width={44}/><Close width={44} style={{marginLeft: '-14px'}}/>
                <Box sx={{
                    fontFamily: 'Faktum, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '2.5em',
                    textAlign: 'center'
                }}>
                    {isSm ? t('Welcome to NostrChat') : t('Welcome')}
                </Box>
                <Divider sx={{m: '28px 0'}}/>
                <Box sx={{color: 'text.secondary', mb: '28px'}}>{t('Setup your profile')}</Box>
                <MetadataForm
                    skipButton={<Button onClick={skip}>{t('Skip')}</Button>}
                    submitBtnLabel={t('Next')}
                    onSubmit={(data) => {
                        raven?.updateProfile(data);
                    }}/>
            </Card>
        </Box>
    </>;
}


export default WelcomePage;
