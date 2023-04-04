import React from 'react';
import {useAtom} from 'jotai';
import useModal from 'hooks/use-modal';
import usePopover from 'hooks/use-popover';
import ConfirmDialog from 'components/confirm-dialog';
import {muteListAtom, ravenAtom} from 'store';

const MuteBtn = (props: { pubkey: string, children: JSX.Element, }) => {
    const {pubkey, children} = props;
    const [, showModal] = useModal();
    const [, showPopover] = usePopover();
    const [raven] = useAtom(ravenAtom);
    const [muteList] = useAtom(muteListAtom);

    const clicked = () => {
        showModal({
            body: <ConfirmDialog onConfirm={() => {
                raven?.updateMuteList([...muteList.pubkeys, pubkey]);
                showPopover(null);
            }}/>
        });
    }

    return React.cloneElement(children, {
        onClick: clicked
    });
}

export default MuteBtn;
