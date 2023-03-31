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
import TableHead from '@mui/material/TableHead';
import Switch from '@mui/material/Switch';
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
    const [prevData, setPrevData] = useState<RelayDict>({});
    const [data, setData] = useState<RelayDict>({});
    const [newAddress, setNewAddress] = useState('');

    useEffect(() => {
        if (!keys) {
            navigate('/login').then();
        }
    }, [keys]);


    const load = () => {
        const d = getRelays();
        setPrevData(d);
        setData(d);
    }

    useEffect(() => {
        load();
    }, []);

    const canSave = useMemo(() => JSON.stringify(prevData) !== JSON.stringify(data), [data, prevData]);
    const canRestore = useMemo(() => localStorage.getItem('relays') !== null, []);

    if (!keys) {
        return null;
    }

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

        setData({
            ...data,
            [address]: {read: true, write: true}
        });

        setNewAddress('');
    }

    const remove = (address: string) => {
        let {[address]: _, ...nRelays} = data;
        setData(nRelays);
    }

    const switchRead = (address: string) => {
        setData({
            ...data,
            [address]: {read: !data[address].read, write: data[address].write}
        });
    }

    const switchWrite = (address: string) => {
        setData({
            ...data,
            [address]: {read: data[address].read, write: !data[address].write}
        });
    }

    const save = () => {
        const read = Object.keys(data).filter(d => data[d].read);
        if (read.length === 0) {
            showMessage(t('At least 1 read relay is required'), 'error');
            return;
        }

        const write = Object.keys(data).filter(d => data[d].write);
        if (write.length === 0) {
            showMessage(t('At least 1 write relay is required'), 'error');
            return;
        }

        localStorage.setItem('relays', JSON.stringify(data));
        window.location.reload();
    }

    const discard = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                setData(prevData);
            }}/>
        });
    }

    const restore = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                localStorage.removeItem('relays');
                window.location.reload();
            }}/>
        });
    }

    const recommend = (address: string) => {
        raven?.recommendRelay(address).then(() => {
            showMessage(t('Done'), 'success');
        }).catch(e => {
            showMessage(e, 'error');
        })
    }

    return <>
        <Helmet><title>{t('NostrChat - Relays')}</title></Helmet>
        <AppWrapper>
            <SettingsMenu/>
            <AppContent>
                <SettingsHeader section={t('Relays')}/>
                <SettingsContent>
                    <Box sx={{maxWidth: '800px'}}>
                        {canRestore && (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mb: '20px'
                            }}>
                                <Button variant="outlined" onClick={restore}>{t('Restore defaults')}</Button>
                            </Box>
                        )}
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('Address')}</TableCell>
                                        <TableCell>{t('Read')}</TableCell>
                                        <TableCell>{t('Write')}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(data).map(r => {
                                        return <TableRow key={r}>
                                            <TableCell>{r}</TableCell>
                                            <TableCell sx={{width: '40px'}}>
                                                <Switch size="small"
                                                        checked={data[r].read}
                                                        onChange={() => {
                                                            switchRead(r);
                                                        }}/>
                                            </TableCell>
                                            <TableCell sx={{width: '40px'}}>
                                                <Switch size="small"
                                                        checked={data[r].write}
                                                        onChange={() => {
                                                            switchWrite(r);
                                                        }}/>
                                            </TableCell>
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
                            {canSave && (
                                <Box sx={{
                                    width: isSm ? '200px' : null,
                                    display: 'flex',
                                    justifyContent: isSm ? 'flex-end' : null,
                                    mt: !isSm ? '10px' : null
                                }}>
                                    <Button variant="contained" onClick={save} sx={{mr: '6px'}}>{t('Save')}</Button>
                                    <Button variant="outlined" onClick={discard}>{t('Discard')}</Button>
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
