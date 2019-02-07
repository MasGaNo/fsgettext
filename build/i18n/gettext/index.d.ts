export declare type TGettextPluralRule = (input: number) => number;
export interface IGettext {
    msgid: string;
    msgidplural?: string;
    value: Array<string>;
    _: {
        line: number;
    };
    isPlural: boolean;
}
declare type TGettextJsonOptions = {
    keepPluralValue: boolean;
    keepPluralMsgId: boolean;
};
export declare type TGettextCache = Record<string, IGettext>;
export declare class Gettext {
    private poFileContent;
    static fromUri(uri: string): Promise<Gettext>;
    private static _fromUri;
    private cache;
    private pluralRule;
    private constructor();
    setPluralRules(pluralRule: TGettextPluralRule): this;
    gettext(text: string): string | null;
    ngettext(text: string, value: number): string | null;
    private _gettext;
    private parse;
    toJSON(options?: Partial<TGettextJsonOptions>): Record<string, string | string[]>;
    extendFromUri(uri: string): Promise<Gettext>;
}
export {};
