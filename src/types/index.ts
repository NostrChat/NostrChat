export type Keys = {
    pub: string;
    priv: string;
} | {
    pub: string;
    priv: 'nip07';
} | null;


export type Metadata = {
    name: string,
    about: string,
    picture: string
}

export type Profile = { id: string, creator: string, created: number } & Metadata;

export type Channel = { id: string, creator: string, created: number } & Metadata;

export type ChannelUpdate = { channelId: string } & Channel;

export type EventDeletion = { eventId: string, why: string };

export type PublicMessage = { id: string, root: string, content: string, creator: string, mentions: string[], created: number };

export type DirectMessage = { id: string, content: string, peer: string, creator: string, created: number, decrypted: boolean };

export type Message = PublicMessage | DirectMessage;

export type ChannelMessageHide = { id: string, reason: string };

export type ChannelUserMute = { pubkey: string, reason: string };

export type RelayDict = Record<string, { read: boolean; write: boolean }>;

export type MuteList = { pubkeys: string[], encrypted: string };
