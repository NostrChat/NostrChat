import React, {useMemo, useState} from 'react';
import Tooltip from '@mui/material/Tooltip';
import useTranslation from 'hooks/use-translation';

const CopyToClipboard = (props: { children: JSX.Element, copy: string }) => {
    const [t] = useTranslation();
    const [title, setTitle] = useState(t('Copy'));

    const clicked = async () => {
        await navigator.clipboard?.writeText(props.copy).then();
        setTitle(t('Copied'));
        setTimeout(() => {
            setTitle(t('Copy'));
        }, 2000);
    }

    const clonedChildren = useMemo(() => {
        return React.cloneElement(props.children, {
            onClick: clicked,
            style: {cursor: 'pointer'}
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.children])

    return <Tooltip title={title} enterTouchDelay={0}>{clonedChildren}</Tooltip>;
}

export default CopyToClipboard;
