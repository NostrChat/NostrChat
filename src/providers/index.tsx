import React from 'react'
import ThemeProvider from 'providers/theme';
import ToastProvider from 'providers/toast';
import ModalProvider from 'providers/modal';
import PopoverProvider from 'providers/popover';
import RavenProvider from 'providers/raven';
import KeysProvider from 'providers/keys';

const Providers = (props: { children: React.ReactNode }) => {
    return (
        <ThemeProvider>
            <ModalProvider>
                <ToastProvider>
                    <PopoverProvider>
                        <KeysProvider>
                            <RavenProvider>
                                {props.children}
                            </RavenProvider>
                        </KeysProvider>
                    </PopoverProvider>
                </ToastProvider>
            </ModalProvider>
        </ThemeProvider>
    );
}

export default Providers;
