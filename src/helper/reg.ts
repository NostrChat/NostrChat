
export const imgReg = /(https:\/\/)([^\s(["<,>/]*)(\/)[^\s[",><]*(.png|.jpg|.jpeg|.gif|.webp)(\?[^\s[",><]*)?/;
export const channelReg = new RegExp(`^${window.location.protocol}//${window.location.host}/channel/[a-f0-9]{64}$`, 'm');