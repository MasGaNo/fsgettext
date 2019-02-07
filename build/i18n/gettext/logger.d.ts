export declare module Logger {
    function disable(): void;
    function enable(): void;
    function log(...args: any[]): void;
    function warn(...args: any[]): void;
    function error(...args: any[]): void;
    function debug(...args: any[]): void;
}
export default Logger;
