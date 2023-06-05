import {useRef} from 'react';
import {Extension, ReactRenderer, useEditor} from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import {Mention} from '@tiptap/extension-mention';
import tippy, {GetReferenceClientRect, Instance} from 'tippy.js';
import {SuggestionProps} from '@tiptap/suggestion';
import MentionList from 'views/components/chat-input/editor/mention-list';
import {MentionListRef} from 'views/components/chat-input/editor/types';

const useMakeEditor = ({content, onUpdate}: { content: string, onUpdate: () => void }) => {
    const reactRenderer = useRef<ReactRenderer<MentionListRef> | null>(null);
    let saveTimer: any = null;

    return useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            History,
            Extension.create({
                name: 'ShiftEnterExtension',
                addKeyboardShortcuts() {
                    return {
                        'Shift-Enter': () => this.editor.commands.first(({commands}) => [
                            () => commands.createParagraphNear(),
                            () => commands.liftEmptyBlock(),
                            () => commands.splitBlock(),
                        ]),
                        'Enter': () => true,
                    };
                },
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention',
                },
                renderLabel({options, node}) {
                    const label = (options?.suggestion?.char as string) || '';
                    return `${label}${String(node?.attrs?.label)}`;
                },
                suggestion: {
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
                },
            }),
        ],
        content: content,
        onUpdate: () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                onUpdate();
            }, 200);
        },
    })
}

export default useMakeEditor;
