import { IGettext, TGettextCache } from ".";
export declare class GettextParser {
    private poFileContent;
    static parse(poFileContent: string, cache?: TGettextCache): Record<string, IGettext>;
    private currentLine;
    private eof;
    private constructor();
    private parse;
    private checkPluralMsgId;
    private checkPlurialStr;
    private extractConcatMessage;
    private static checkDuplicateMsgId;
    private static checkEof;
    private static cleanLine;
}
