export const createLogger = (name: string) => {
    return {
        info: (message?: any, ...optionalParams: any[]) => {
            console.log(name, message, ...optionalParams);
        }
    }
}
