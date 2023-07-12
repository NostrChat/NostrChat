import React, {ReactNode} from 'react';
import {useAtom} from 'jotai';
import Box from '@mui/material/Box';
import Linkify from 'linkify-react';
import {useNavigate} from '@reach/router';
import {nip19} from 'nostr-tools';
import {IntermediateRepresentation} from 'linkifyjs';
import reactStringReplace from 'react-string-replace';
import Link from '@mui/material/Link';
import useModal from 'hooks/use-modal';
import ExternalLinkDialog from 'components/external-link-dialog';
import ProfileDialog from 'views/components/dialogs/profile';
import {Message} from 'types';
import {profilesAtom} from 'atoms';
import {notEmpty} from 'util/misc';

const imgReg = /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp)(\?[^\s[",><]*)?/;
const channelReg = new RegExp(`^${window.location.protocol}//${window.location.host}/channel/[a-f0-9]{64}$`, 'm');

const useRenderContent = () => {
    const [, showModal] = useModal();
    const navigate = useNavigate();
    const [profiles] = useAtom(profilesAtom);

    return (message: Message) => {
        const {content} = message;

        const renderLink = (args: IntermediateRepresentation) => {
            const {href} = args.attributes;

            if (href.match(channelReg)) {
                const s = href.split('/');
                const cid = s[s.length - 1];
                return <Link href={href} onClick={(e) => {
                    e.preventDefault();
                    navigate(`/channel/${cid}`).then();
                }}>{href}</Link>;
            }

            if (href.indexOf('https://') === 0) {
                if (imgReg.test(href)) {
                    return <Box>
                        <Link href={href} target="_blank" rel="noreferrer" onClick={(e) => {
                            e.preventDefault();
                            showModal({
                                body: <ExternalLinkDialog link={href}/>
                            });
                        }}>
                            <Box component="img" src={href} sx={{
                                maxWidth: '300px',
                                maxHeight: '300px',
                                pointerEvents: 'none'
                            }} onLoad={() => {
                                window.dispatchEvent(new Event('chat-media-loaded', {bubbles: true}))
                            }}/>
                        </Link>
                    </Box>
                }

                return <Link href={href} target="_blank" rel="noreferrer" onClick={(e) => {
                    e.preventDefault();
                    showModal({
                        body: <ExternalLinkDialog link={href}/>
                    });
                }}>{href}</Link>;
            }

            return <>{args.content}</>;
        };

        const renderBlock = (c: string) => {
            const {mentions} = message;
            const mentionedProfiles = mentions.map(m => profiles.find(p => p.creator === m)).filter(notEmpty);
            if (mentionedProfiles.length === 0) return c;

            let res: string | ReactNode[] = c;
            mentionedProfiles.forEach(profile => {
                res = reactStringReplace(res, `@${profile.name}`, (match, i) => {
                    return <Link href='#' onClick={(e) => {
                        e.preventDefault();
                        showModal({
                            body: <ProfileDialog profile={profile} pubkey={profile.creator} onDM={() => {
                                navigate(`/dm/${nip19.npubEncode(profile.creator)}`).then();
                            }}/>,
                            maxWidth: 'xs',
                            hideOnBackdrop: true
                        });
                    }} key={i}>{match}</Link>
                }) as ReactNode[];
            });
            return res;
        }

        return <Linkify options={{render: renderLink}}>{
            content.trim().split('\n').map((x, i) => (
                x.trim() === '' ? <Box sx={{height: '8px'}} key={i}/> :
                    <Box key={i} sx={{mb: '6px'}}>{renderBlock(x)}</Box>
            ))}
        </Linkify>
    }
}

export default useRenderContent;
