import React, {useMemo, useState} from 'react';
import Tooltip from '@mui/material/Tooltip';
import useTranslation from 'hooks/use-translation';
import useToast from 'hooks/use-toast';
import useStyles from 'hooks/use-styles';

const CopyToClipboard = (props: { children: JSX.Element, copy: string }) => {
    const [t] = useTranslation();
    const [title, setTitle] = useState(t('Copy'));
    const [, showMessage] = useToast();
    const styles = useStyles();

    const clicked = async () => {
        await navigator.clipboard?.writeText(props.copy).then();
        setTitle(t('Copied'));
        setTimeout(() => {
            setTitle(t('Copy'));
        }, 2000);

        if (styles.canTouch()) {
            showMessage(t('Copied'), 'success', 1000);
        }
    }

    const clonedChildren = useMemo(() => {
        return React.cloneElement(props.children, {
            onClick: clicked,
            style: {cursor: 'pointer'}
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.children]);

    if (styles.canTouch()) {
        return clonedChildren;
    }

    return <Tooltip title={title}>{clonedChildren}</Tooltip>;
}

export default CopyToClipboard;
