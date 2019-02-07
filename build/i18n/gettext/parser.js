"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("./logger"));
var GettextKeywordRegex = {
    MsgId: /^msgid \"(.+)\"$/,
    MsgIdPlural: /^msgid_plural \"(.+)\"$/,
    MsgStr: /^msgstr \"(.+)\"$/,
    MsgStrPlural: /^msgstr\[([0-9]+)\] \"(.+)\"$/,
    MsgStrConcat: /^\"(.+)\"$/,
};
var GettextKeyword = {
    MsgId: function (line) { return line.match(GettextKeywordRegex.MsgId); },
    MsgStr: function (line) { return line.match(GettextKeywordRegex.MsgStr); },
    MsgStrPlural: function (line) { return line ? line.match(GettextKeywordRegex.MsgStrPlural) : null; },
    MsgStrConcat: function (line) { return line ? line.match(GettextKeywordRegex.MsgStrConcat) : null; },
    MsgIdPlural: function (line) { return line.match(GettextKeywordRegex.MsgIdPlural); },
    MsgEmpty: function (line) { return !line; },
};
var GettextParser = /** @class */ (function () {
    function GettextParser(poFileContent) {
        this.poFileContent = poFileContent;
        this.currentLine = 0;
        this.eof = 0;
    }
    GettextParser.parse = function (poFileContent, cache) {
        if (cache === void 0) { cache = {}; }
        return new GettextParser(poFileContent).parse(cache);
    };
    GettextParser.prototype.parse = function (cache) {
        var poLines = this.poFileContent.split(/(\r\n|\n)+/g).map(GettextParser.cleanLine).filter(Boolean);
        this.eof = poLines.length;
        while (this.currentLine < this.eof) {
            var line = poLines[this.currentLine];
            if (GettextKeyword.MsgEmpty(line)) {
                ++this.currentLine;
                continue;
            }
            var msgIdMatch = GettextKeyword.MsgId(line);
            if (!msgIdMatch) {
                ++this.currentLine;
                continue;
            }
            var msgId = msgIdMatch[1];
            GettextParser.checkDuplicateMsgId(msgId, cache, this.currentLine);
            var msgItem = {
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
            var msgLine = poLines[this.currentLine];
            var hasMsgLine = GettextKeyword.MsgStr(msgLine);
            if (!hasMsgLine) {
                if (!this.checkPlurialStr(poLines, msgItem)) {
                    logger_1.default.warn("Found msgid(" + msgItem.msgid + ") on line " + msgItem._.line + " instruction with empty content.");
                }
                continue;
            }
            msgItem.value.push(this.extractConcatMessage([hasMsgLine[1]], poLines));
        }
        return cache;
    };
    GettextParser.prototype.checkPluralMsgId = function (poLines, msgItem, cache) {
        var pluralLine = poLines[++this.currentLine];
        var hasPluralMsgId = GettextKeyword.MsgIdPlural(pluralLine);
        if (!!hasPluralMsgId) {
            var pluralMsgId = hasPluralMsgId[1];
            GettextParser.checkDuplicateMsgId(pluralMsgId, cache, this.currentLine);
            var msgItemPlural = {
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
    };
    GettextParser.prototype.checkPlurialStr = function (poLines, msgItem) {
        var hasMatch = false;
        for (var hasMultiStr = GettextKeyword.MsgStrPlural(poLines[this.currentLine]); !!hasMultiStr; hasMultiStr = GettextKeyword.MsgStrPlural(poLines[this.currentLine])) {
            hasMatch = true;
            var index = parseInt(hasMultiStr[1], 10);
            msgItem.value[index] = this.extractConcatMessage([hasMultiStr[2]], poLines);
        }
        return hasMatch;
    };
    GettextParser.prototype.extractConcatMessage = function (fullMessage, poLines) {
        for (var concatMessage = GettextKeyword.MsgStrConcat(poLines[++this.currentLine]); !!concatMessage; concatMessage = GettextKeyword.MsgStrConcat(poLines[++this.currentLine])) {
            fullMessage.push(concatMessage[1]);
        }
        return fullMessage.join('');
    };
    GettextParser.checkDuplicateMsgId = function (msgId, cache, currentLine) {
        if (Reflect.apply(Object.prototype.hasOwnProperty, cache, [msgId])) {
            logger_1.default.warn("Duplicate msgid(" + msgId + ") on line " + currentLine + ". Previous msgid(" + msgId + ") on line " + cache[msgId]._.line + " will be overwrite");
            return false;
        }
        return true;
    };
    GettextParser.checkEof = function (line, eof, msgId) {
        if (line + 1 >= eof) {
            logger_1.default.warn("Found msgid(" + msgId + ") on line " + line + " instruction with empty content.");
            return false;
        }
        return true;
    };
    GettextParser.cleanLine = function (line) {
        return line.trim();
    };
    return GettextParser;
}());
exports.GettextParser = GettextParser;
