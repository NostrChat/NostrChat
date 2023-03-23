export const createLogger = (name: string) => {
    return {
        info: (message?: any, ...optionalParams: any[]) => {
            // eslint-disable-next-line
            console.log(name, message, ...optionalParams);
        }
    }
}
