export module Logger {
    let isEnable = true;
    export function disable() {
        isEnable = false;
    }
    export function enable() {
        isEnable = true;
    }

    export function log(...args: any[]) {
        isEnable && console.log(...args);
    }
    export function warn(...args: any[]) {
        isEnable && console.warn(...args);
    }
    export function error(...args: any[]) {
        isEnable && console.error(...args);
    }
    export function debug(...args: any[]) {
        isEnable && console.debug(...args);
    }
}

export default Logger;