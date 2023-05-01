import React from 'react';
import useTranslation from 'hooks/use-translation';
import Account from 'svg/account';
import Server from 'svg/server';
import KeyChain from 'svg/key-chain';
import Lock from 'svg/lock';
import LinkVariant from '../svg/link-variant';

const useSettingsSections = () => {
    const [t] = useTranslation();

    return [
        {
            icon: <Account height={40}/>,
            title: t('Profile'),
            description: t('Edit your profile'),
            href: '/settings/profile',
        },
        {
            icon: <KeyChain height={40}/>,
            title: t('Keys'),
            description: t('View your private & public keys'),
            href: '/settings/keys'
        },
        {
            icon: <Lock height={40}/>,
            title: t('Password protection'),
            description: t('Secure your private key with a password'),
            href: '/settings/password',
            hidden: true //keys?.priv === 'nip07'
        },
        {
            icon: <Server height={40}/>,
            title: t('Relays'),
            description: t('Manage your preferred relay list'),
            href: '/settings/relays'
        },
        {
            icon: <LinkVariant height={40}/>,
            title: t('Public DM page'),
            description: t('Get your public DM page link'),
            href: '/settings/dm'
        },
    ].filter(x => !x.hidden);
}

export default useSettingsSections;
