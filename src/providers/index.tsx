import React from 'react'
import ThemeProvider from 'providers/theme';
import ToastProvider from 'providers/toast';
import ModalProvider from 'providers/modal';
import PopoverProvider from 'providers/popover';
import RavenProvider from 'providers/raven';

const Providers = (props: { children: React.ReactNode }) => {
    return (
        <ThemeProvider>
            <ModalProvider>
                <ToastProvider>
                    <PopoverProvider>
                        <RavenProvider>
                            {props.children}
                        </RavenProvider>
                    </PopoverProvider>
                </ToastProvider>
            </ModalProvider>
        </ThemeProvider>
    );
}

export default Providers;
