import {SuggestionProps} from '@tiptap/suggestion';

export type MentionListProps = { query: string } & Pick<SuggestionProps, 'command'>;

export type MentionListRef = {
    onKeyDown: (props: { event: { key: string } }) => boolean;
};
