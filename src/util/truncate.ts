export const truncateMiddle = (str: string, max: number, sep: string) => {
    max = max || 10;
    const len = str.length;
    if (len > max) {
        sep = sep || '...';
        const seplen = sep.length;
        if (seplen > max) {
            return str.substring(len - max)
        }
        const n = -0.5 * (max - len - seplen);
        const center = len / 2;
        return str.substring(0, center - n) + sep + str.substring(len - center + n);
    }
    return str;
}

export const truncate = (str: string, num: number): string => {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
};

