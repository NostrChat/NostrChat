import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useAtom} from 'jotai';
import {darken} from '@mui/material';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
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
import {formatMessageTime} from 'helper';
import {truncateMiddle} from 'util/truncate';

const MessageView = (props: { message: Message, compactView: boolean, }) => {
    const {message, compactView} = props;
    const [profiles] = useAtom(profilesAtom);
    const profile = profiles.find(x => x.creator === message.creator);
    const [, setThreadRoot] = useAtom(threadRootAtom);
    const theme = useTheme();
    const navigate = useNavigate();
    const [, showPopover] = usePopover();
    const [, isMd] = useMediaBreakPoint();
    const holderEl = useRef<HTMLDivElement | null>(null);
    const renderedBody = useContentRenderer(message.content);
    const profileName = useMemo(() => truncateMiddle((profile?.name || nip19.npubEncode(message.creator)), (isMd ? 40 : 26), ':'), [profile, message]);
    const [menu, setMenu] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [t] = useTranslation();

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

    const hasReply = message.children && message.children.length > 0;

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
        }}><MessageMenu message={message}/></Box>)}
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
                <Box sx={{
                    color: darken(theme.palette.text.secondary, 0.3),
                    fontSize: '90%'
                }}>{formatMessageTime(message.created)}</Box>
            </Box>)}
            <Box sx={{
                fontSize: '0.9em',
                mt: '4px',
                wordBreak: 'break-word',
                lineHeight: '1.4em',
                color: theme.palette.text.secondary
            }}>{renderedBody}</Box>
            {hasReply && (
                <Box sx={{
                    color: theme.palette.primary.main,
                    display: 'inline-flex',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    ':hover': {
                        textDecoration: 'underline'
                    }
                }} onClick={() => {
                    setThreadRoot(message);
                }}>
                    {t('{{n}} replies', {n: message.children?.length})}
                </Box>
            )}
        </Box>
    </Box>;
}

export default MessageView;
