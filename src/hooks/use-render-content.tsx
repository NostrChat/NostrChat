import React from 'react';
import Box from '@mui/material/Box';
import Linkify from 'linkify-react';
import {IntermediateRepresentation} from 'linkifyjs';
import Link from '@mui/material/Link';
import useModal from 'hooks/use-modal';
import ExternalLinkDialog from 'components/external-link-dialog';
import {truncateMiddle} from 'util/truncate';

const useRenderContent = () => {
    const [, showModal] = useModal();

    return (content: string) => {
        const renderLink = (args: IntermediateRepresentation) => {
            const {href} = args.attributes;
            if (href.indexOf('https://') === 0) {

                if (/(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp)(\?[^\s[",><]*)?/.test(href)) {
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
                }}>{truncateMiddle(args.content, 60, '...')}</Link>;
            }

            return <>{args.content}</>;
        };

        return <Linkify options={{render: renderLink}}>{
            content.split('\n').map((x, i) => <Box key={i} sx={{mb: '6px'}}>{x}</Box>)
        }</Linkify>
    }
}

export default useRenderContent;
