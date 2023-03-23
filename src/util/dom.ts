export const focusElem = (el: HTMLDivElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
}

export const insertText = (t: string) => {
    document.execCommand("insertText", false, t);
}
