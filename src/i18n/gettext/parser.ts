import { IGettext, Gettext, TGettextCache } from ".";
import Logger from "./logger";

const GettextKeywordRegex = {
    MsgId: /^msgid \"(.+)\"$/,
    MsgIdPlural: /^msgid_plural \"(.+)\"$/,
    MsgStr: /^msgstr \"(.+)\"$/,
    MsgStrPlural: /^msgstr\[([0-9]+)\] \"(.+)\"$/,
    MsgStrConcat: /^\"(.+)\"$/,
}

const GettextKeyword = {
    MsgId: (line: string) => line.match(GettextKeywordRegex.MsgId),
    MsgStr: (line: string) => line.match(GettextKeywordRegex.MsgStr),
    MsgStrPlural: (line: string) => line ? line.match(GettextKeywordRegex.MsgStrPlural) : null,
    MsgStrConcat: (line: string) => line ? line.match(GettextKeywordRegex.MsgStrConcat) : null,
    MsgIdPlural: (line: string) => line.match(GettextKeywordRegex.MsgIdPlural),
    MsgEmpty: (line: string) => !line,
}

export class GettextParser {
    public static parse(poFileContent: string, cache: TGettextCache = {}) {
        return new GettextParser(poFileContent).parse(cache);
    }

    private currentLine: number;
    private eof: number;
    private constructor(private poFileContent: string) {
        this.currentLine = 0;
        this.eof = 0;
    }

    private parse(cache: TGettextCache) {
        const poLines = this.poFileContent.split(/(\r\n|\n)+/g).map(GettextParser.cleanLine).filter(Boolean);
        this.eof = poLines.length;

        while (this.currentLine < this.eof) {
            const line = poLines[this.currentLine];

            if (GettextKeyword.MsgEmpty(line)) {
                ++this.currentLine;
                continue;
            }
            const msgIdMatch = GettextKeyword.MsgId(line);
            if (!msgIdMatch) {
                ++this.currentLine;
                continue;
            }

            const msgId = msgIdMatch[1];
            GettextParser.checkDuplicateMsgId(msgId, cache, this.currentLine);

            const msgItem: IGettext = {
                msgid: msgId,
                _: {
                    line: this.currentLine
                },
                value: [],
                isPlural: false
            };
            cache[msgId] = msgItem;

            if (!GettextParser.checkEof(this.currentLine, this.eof, msgId)) {
                return cache;
            }

            if (this.checkPluralMsgId(poLines, msgItem, cache) && !GettextParser.checkEof(this.currentLine, this.eof, msgId)) {
                return cache;
            }


            const msgLine = poLines[this.currentLine];
            const hasMsgLine = GettextKeyword.MsgStr(msgLine);
            if (!hasMsgLine) {
                if (!this.checkPlurialStr(poLines, msgItem)) {
                    Logger.warn(`Found msgid(${msgItem.msgid}) on line ${msgItem._.line} instruction with empty content.`);
                }
                continue;
            }

            msgItem.value.push(this.extractConcatMessage([hasMsgLine[1]], poLines));
        }

        return cache;
    }

    private checkPluralMsgId(poLines: Array<string>, msgItem: IGettext, cache: TGettextCache) {
        const pluralLine = poLines[++this.currentLine];
        const hasPluralMsgId = GettextKeyword.MsgIdPlural(pluralLine);
        if (!!hasPluralMsgId) {
            const pluralMsgId = hasPluralMsgId[1];
            GettextParser.checkDuplicateMsgId(pluralMsgId, cache, this.currentLine);

            const msgItemPlural: IGettext = {
                msgid: pluralMsgId,
                _: {
                    line: this.currentLine++
                },
                value: Object.create(msgItem.value),
                isPlural: true
            };
            cache[pluralMsgId] = msgItemPlural;
            return true;
        }
        return false;
    }

    private checkPlurialStr(poLines: Array<string>, msgItem: IGettext) {

        let hasMatch = false;
        for (
            let hasMultiStr = GettextKeyword.MsgStrPlural(poLines[this.currentLine]);
            !!hasMultiStr;
            hasMultiStr = GettextKeyword.MsgStrPlural(poLines[this.currentLine])) {
            hasMatch = true;

            const index = parseInt(hasMultiStr[1], 10);
            msgItem.value[index] = this.extractConcatMessage([hasMultiStr[2]], poLines);
        }

        return hasMatch;
    }

    private extractConcatMessage(fullMessage: Array<string>, poLines: Array<string>) {
        for (let concatMessage = GettextKeyword.MsgStrConcat(poLines[++this.currentLine]); !!concatMessage; concatMessage = GettextKeyword.MsgStrConcat(poLines[++this.currentLine])) {
            fullMessage.push(concatMessage[1]);
        }
        return fullMessage.join('')
    }

    private static checkDuplicateMsgId(msgId: string, cache: TGettextCache, currentLine: number) {
        if (Reflect.apply(Object.prototype.hasOwnProperty, cache, [msgId])) {
            Logger.warn(`Duplicate msgid(${msgId}) on line ${currentLine}. Previous msgid(${msgId}) on line ${cache[msgId]._.line} will be overwrite`);
            return false;
        }
        return true;
    }

    private static checkEof(line: number, eof: number, msgId: string) {
        if (line + 1 >= eof) {
            Logger.warn(`Found msgid(${msgId}) on line ${line} instruction with empty content.`);
            return false;
        }
        return true;
    }

    private static cleanLine(line: string) {
        return line.trim();
    }
}