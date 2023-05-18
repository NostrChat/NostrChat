import {MutableRefObject} from 'react';
import {ReactRenderer} from '@tiptap/react';
import tippy, {GetReferenceClientRect, Instance} from 'tippy.js';
import {SuggestionProps} from '@tiptap/suggestion';
import MentionList from 'views/components/chat-input/mention-list';
import {MentionListRef} from 'views/components/chat-input/types';
import {Profile} from 'types';

const useSuggestion = ({reactRenderer, mentionSuggestions}: {
    reactRenderer: MutableRefObject<ReactRenderer<MentionListRef> | null>,
    mentionSuggestions: Profile[]
}) => {

    return {
        render: () => {
            let popup: Instance[];

            return {
                onStart: (props: Pick<SuggestionProps, 'editor' | 'clientRect'>) => {
                    reactRenderer.current = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) {
                        return;
                    }

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                        appendTo: () => document.body,
                        content: reactRenderer.current.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'top-start',
                    });
                },
                onUpdate(props: Pick<SuggestionProps, 'clientRect'>) {
                    if (reactRenderer.current) {
                        reactRenderer.current.updateProps(props);
                    }

                    if (!props.clientRect) {
                        return;
                    } else {
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                        });
                    }
                },
                onKeyDown(props: { event: KeyboardEvent }) {
                    props.event.stopPropagation();
                    if (props.event.key === 'Escape') {
                        popup[0].hide();

                        return true;
                    }

                    if (reactRenderer.current && reactRenderer.current.ref) {
                        return reactRenderer.current.ref?.onKeyDown(props);
                    } else {
                        return false;
                    }
                },
                onExit() {
                    if (popup) {
                        popup[0]?.destroy();
                    }
                    setTimeout(() => {
                        if (reactRenderer.current) {
                            reactRenderer.current.destroy();
                        }
                        reactRenderer.current = null;
                    }, 0);
                },
            };
        },
    }
};

export default useSuggestion;
