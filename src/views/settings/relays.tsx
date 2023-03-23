import React, {useEffect, useMemo, useState} from 'react';
import {useAtom} from 'jotai';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import {RouteComponentProps, useNavigate} from '@reach/router';
import {Helmet} from 'react-helmet';

import useTranslation from 'hooks/use-translation';
import useToast from 'hooks/use-toast';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useModal from 'hooks/use-modal';
import AppWrapper from 'views/components/app-wrapper';
import AppContent from 'views/components/app-content';
import SettingsMenu from 'views/settings/components/settings-menu';
import SettingsHeader from 'views/settings/components/settings-header';
import SettingsContent from 'views/settings/components/settings-content';
import ConfirmDialog from 'components/confirm-dialog';
import {keysAtom, ravenAtom} from 'store';
import {RelayDict} from 'types';
import {DEFAULT_RELAYS} from 'const';
import {getRelays} from 'helper';
import ShareIcon from 'svg/share';
import DeleteIcon from 'svg/delete';
import Plus from 'svg/plus';


const SettingsRelaysPage = (_: RouteComponentProps) => {
    const [keys] = useAtom(keysAtom);
    const navigate = useNavigate();
    const [t] = useTranslation();
    const [, showMessage] = useToast();
    const [, showModal] = useModal();
    const [isSm] = useMediaBreakPoint();
    const [raven] = useAtom(ravenAtom);
    const [data, setData] = useState<RelayDict>({});
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);


    const load = () => {
        setData(getRelays());
    }

    useEffect(() => {
        load();
    }, []);

    const canRestore = useMemo(() => JSON.stringify(DEFAULT_RELAYS) !== JSON.stringify(data), [data]);

    if (!keys) {
        return null;
    }

    const save = (d: RelayDict) => {
        localStorage.setItem('relays', JSON.stringify(d));
        load();
    }

    /*
    We might consider to enable this.

    const switchRead = (address: string) => {
        save({
            ...data,
            [address]: {read: !data[address].read, write: data[address].write}
        });
    }

    const switchWrite = (address: string) => {
        save({
            ...data,
            [address]: {read: data[address].read, write: !data[address].write}
        });
    }
    */

    const add = () => {
        let url;
        try {
            url = new URL(newAddress.trim())
        } catch (e) {
            showMessage(t('Invalid URL', {n: newAddress}), 'error');
            return;
        }

        if (!['ws:', 'wss:'].includes(url.protocol)) {
            showMessage(t('Invalid protocol. Must be "ws" or "wss"'), 'error');
            return;
        }

        const {href: address} = url

        if (data[address]) {
            showMessage(t('The address is already in the list'), 'error');
            return;
        }

        raven?.addRelay(address);

        save({
            ...data,
            [address]: {read: true, write: true}
        });

        setNewAddress('');
    }

    const restore = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                localStorage.removeItem('relays');
                window.location.reload();
            }}/>
        });
    }

    const remove = (address: string) => {
        if (Object.keys(data).length === 1) {
            showMessage(t('At least 1 relay required'), 'error');
            return;
        }

        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.removeRelay(address);
                const {[address]: _, ...nRelays} = data;
                save(nRelays);
            }}/>
        });
    }

    const recommend = (address: string) => {
        raven?.recommendRelay(address).then(() => {
            showMessage(t('Done'), 'success');
        });
    }

    return <>
        <Helmet><title>{t('NostrChat - Relays')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu/>
            <AppContent>
                <SettingsHeader section={t('Relays')}/>
                <SettingsContent>
                    <Box sx={{maxWidth: '800px'}}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableBody>
                                    {Object.keys(data).map(r => {
                                        return <TableRow key={r}>
                                            <TableCell>{r}</TableCell>
                                            {/*
                                            We might consider to enable this.
                                            <TableCell sx={{width: '40px'}}>
                                                <Switch size="small" checked={data[r].read} onChange={() => {
                                                    switchRead(r)
                                                }}/>
                                            </TableCell>
                                            <TableCell sx={{width: '40px'}}>
                                                <Switch size="small" checked={data[r].write} onChange={() => {
                                                    switchWrite(r)
                                                }}/>
                                            </TableCell>
                                            */}
                                            <TableCell sx={{width: '70px'}}>
                                                <Button size="small" startIcon={<ShareIcon height={20}/>}
                                                        onClick={() => {
                                                            recommend(r);
                                                        }}>{t('Share')}</Button>
                                            </TableCell>
                                            <TableCell sx={{width: '70px'}}>
                                                <IconButton size="small" color="primary"
                                                            onClick={() => {
                                                                remove(r);
                                                            }}>
                                                    <DeleteIcon height={20}/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{
                            mt: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: isSm ? 'row' : 'column'
                        }}>
                            <Box sx={{flexGrow: 1}}>
                                <OutlinedInput fullWidth
                                               size="small"
                                               value={newAddress}
                                               placeholder={t('Add a relay')}
                                               endAdornment={<InputAdornment position="end">
                                                   <IconButton onClick={add}>
                                                       <Plus height={20}/>
                                                   </IconButton>
                                               </InputAdornment>}
                                               onChange={(e) => {
                                                   setNewAddress(e.target.value);
                                               }}
                                               onKeyDown={(e) => {
                                                   if (e.key === 'Enter') {
                                                       add();
                                                   }
                                               }}/>
                            </Box>
                            {canRestore && (
                                <Box sx={{
                                    width: isSm ? '200px' : null,
                                    display: 'flex',
                                    justifyContent: isSm ? 'flex-end' : null,
                                    mt: !isSm ? '10px' : null
                                }}>
                                    <Button variant="outlined" onClick={restore}>{t('Restore defaults')}</Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </SettingsContent>
            </AppContent>
        </AppWrapper>
    </>;
}

export default SettingsRelaysPage;
