import {SuggestionProps} from '@tiptap/suggestion';

import {Profile} from 'types';

export type MentionListProps = { items: Profile[] } & Pick<SuggestionProps, 'command'>;

export type MentionListRef = {
    onKeyDown: (props: { event: { key: string } }) => boolean;
};