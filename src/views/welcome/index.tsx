import {useEffect, useState} from 'react';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import MetadataForm from 'views/components/metadata-form';
import {keysAtom, profileAtom, ravenAtom} from 'store';

const WelcomePage = (_: RouteComponentProps) => {
    const {isSm} = useMediaBreakPoint();
    const [t,] = useTranslation();
    const navigate = useNavigate();
    const [profile] = useAtom(profileAtom);
    const [raven] = useAtom(ravenAtom);
    const [keys] = useAtom(keysAtom);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, [])

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
                {(() => {
                    if (loading) {
                        return <Box sx={{display: 'flex', justifyContent: 'center'}}><CircularProgress/></Box>
                    }

                    return <>
                        <Box component="img" src="/logo-large-white.png" sx={{
                            width: isSm ? '526px' : '100%',
                            height: isSm ? '132px' : null,
                            m: '20px 0 10px 0'
                        }}/>
                        <Divider sx={{m: '28px 0'}}/>
                        <Box sx={{color: 'text.secondary', mb: '28px'}}>{t('Setup your profile')}</Box>
                        <MetadataForm
                            skipButton={<Button onClick={skip}>{t('Skip')}</Button>}
                            submitBtnLabel={t('Next')}
                            onSubmit={(data) => {
                                raven?.updateProfile(data);
                            }}/>
                    </>
                })()}
            </Card>
        </Box>
    </>;
}


export default WelcomePage;
