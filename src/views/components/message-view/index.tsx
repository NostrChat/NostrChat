import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useAtom} from 'jotai';
import uniq from 'lodash.uniq';
import {darken} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import {useNavigate} from '@reach/router';
import {nip19} from 'nostr-tools';
import useContentRenderer from 'hooks/use-render-content';
import usePopover from 'hooks/use-popover';
import useMediaBreakPoint from 'hooks/use-media-break-point';
import useTranslation from 'hooks/use-translation';
import Avatar from 'views/components/avatar';
import ProfileCard from 'views/components/profile-card';
import MessageMenu from 'views/components/message-menu';
import {profilesAtom, threadRootAtom} from 'store';
import {Message,} from 'types';
import {formatMessageTime, formatMessageFromNow, formatMessageDateTime} from 'helper';
import ChevronRight from 'svg/chevron-right';
import {truncateMiddle} from 'util/truncate';

const MessageView = (props: { message: Message, compactView: boolean, dateFormat: 'time' | 'fromNow', inThreadView?: boolean }) => {
    const {message, compactView, dateFormat, inThreadView} = props;
    const theme = useTheme();
    const navigate = useNavigate();
    const [profiles] = useAtom(profilesAtom);
    const profile = profiles.find(x => x.creator === message.creator);
    const [, setThreadRoot] = useAtom(threadRootAtom);
    const [t] = useTranslation();
    const [, showPopover] = usePopover();
    const [, isMd] = useMediaBreakPoint();
    const renderer = useContentRenderer();
    const holderEl = useRef<HTMLDivElement | null>(null);
    const [menu, setMenu] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const renderedBody = useMemo(() => renderer(message.content), [message]);
    const profileName = useMemo(() => truncateMiddle((profile?.name || nip19.npubEncode(message.creator)), (isMd ? 40 : 26), ':'), [profile, message]);
    const messageTime = useMemo(() => dateFormat === 'time' ? formatMessageTime(message.created) : formatMessageFromNow(message.created), [message]);
    const messageDateTime = useMemo(() => formatMessageDateTime(message.created), [message]);
    const lastReply = useMemo(() => message.children && message.children.length > 0 ? formatMessageFromNow(message.children[message.children.length -1].created) : null, [message]);

    const profileClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        showPopover({
            body: <Box sx={{width: '220px', padding: '10px'}}>
                <ProfileCard profile={profile} pubkey={message.creator} onDM={() => {
                    navigate(`/dm/${nip19.npubEncode(message.creator)}`).then();
                }}/>
            </Box>,
            anchorEl: event.currentTarget
        });
    };

    useEffect(() => {
        if (!holderEl.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        });
        observer.observe(holderEl.current);

        return () => {
            observer.disconnect();
        }
    }, [isVisible]);

    const ps = isMd ? '24px' : '10px';
    return <Box
        data-visible={isVisible}
        data-id={message.id}
        className="message"
        ref={holderEl}
        sx={{
            display: 'flex',
            p: `${!compactView ? '15px' : '3px'} ${ps} 0 ${ps}`,
            position: 'relative',
            ':hover': {
                background: theme.palette.divider
            }
        }}
        onMouseEnter={() => {
            setMenu(true);
        }}
        onMouseLeave={() => {
            setMenu(false);
        }}>
        {menu && (<Box sx={{
            position: 'absolute',
            right: '10px',
            top: '-10px'
        }}><MessageMenu message={message} inThreadView={inThreadView}/></Box>)}
        <Box sx={{
            display: 'flex',
            width: '40px',
            flexGrow: 0,
            flexShrink: 0,
        }}>
            {compactView ? null :
                <Box sx={{cursor: 'pointer'}} onClick={profileClicked}>
                    <Avatar src={profile?.picture} seed={message.creator} size={40} type="user"/>
                </Box>}
        </Box>
        <Box sx={{flexGrow: 1, ml: '12px'}}>
            {!compactView && (<Box sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.8em',
                lineHeight: '1em',
                mr: '12px',
                mb: '12px'
            }}>
                <Box onClick={profileClicked} sx={{
                    fontWeight: '600',
                    mr: '5px',
                    cursor: 'pointer'
                }}>{profileName}</Box>
                <Tooltip title={messageDateTime} placement="right">
                    <Box sx={{
                        color: darken(theme.palette.text.secondary, 0.3),
                        fontSize: '90%',
                        cursor: 'default'
                    }}>{messageTime}</Box>
                </Tooltip>
            </Box>)}
            <Box sx={{
                fontSize: '0.9em',
                mt: '4px',
                wordBreak: 'break-word',
                lineHeight: '1.4em',
                color: theme.palette.text.secondary
            }}>{renderedBody}</Box>
            {(!inThreadView && message.children && message.children.length > 0) && (
                <Box sx={{
                    p: '6px',
                    mb: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                    color: darken(theme.palette.text.secondary, 0.3),
                    borderRadius: theme.shape.borderRadius,
                    'svg': {
                        display: 'none',
                    },
                    ':hover': {
                        borderColor: theme.palette.divider,
                        background: theme.palette.background.paper,
                        'svg': {
                            display: 'block',
                        },
                    }
                }} onClick={() => {
                    setThreadRoot(message);
                }}>
                    {uniq(message.children.map(m => m.creator)).slice(0, 4).map(c => {
                        const profile = profiles.find(x => x.creator === c);
                        return <Box sx={{
                            mr: '6px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <Avatar src={profile?.picture} seed={c} size={20} type='user'/>
                        </Box>
                    })}
                    <Box sx={{mr: '10px', color: theme.palette.primary.main, fontWeight: 'bold'}}>
                        {message.children.length === 1 ? t('1 reply') : t('{{n}} replies', {n: message.children.length})}
                    </Box>
                    <Box sx={{mr: '10px'}}>
                        {t('Last reply {{n}}', {n: lastReply!})}
                    </Box>
                    <ChevronRight height={20}/>
                </Box>
            )}
        </Box>
    </Box>;
}

export default MessageView;
