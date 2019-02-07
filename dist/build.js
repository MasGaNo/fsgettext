(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gettext_1 = require("./localization/gettext");
(function () {
    function testGettext(gettext) {
        console.log(gettext);
        console.log(gettext.gettext('Brand'));
        console.log(gettext.ngettext('Track', 1));
        console.log(gettext.ngettext('Track', 3));
        console.log(gettext.gettext('Only for EN'));
        console.log(gettext.toJSON());
        console.log(gettext.toJSON({ keepPluralMsgId: true }));
        console.log(gettext.toJSON({ keepPluralValue: true }));
        console.log(gettext.toJSON({ keepPluralValue: true, keepPluralMsgId: true }));
        return gettext;
    }
    gettext_1.Gettext
        .fromUri('./data/en.po')
        .then(function (enGettext) {
        return testGettext(enGettext);
    }).then(function (enGettext) {
        return enGettext.extendFromUri('./data/fr.po');
    }).then(function (frGettextWithEnFallback) {
        return testGettext(frGettextWithEnFallback);
    }).catch(function (error) {
        console.error(error);
    });
}());

},{"./localization/gettext":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
var Gettext = /** @class */ (function () {
    function Gettext(poFileContent, cache) {
        this.poFileContent = poFileContent;
        this.pluralRule = function (n) { return n > 1 ? 1 : 0; };
        this.cache = cache;
        this.parse();
    }
    Gettext.fromUri = function (uri) {
        // return new Promise((resolve, reject) => {
        //     const xhr = new XMLHttpRequest();
        //     xhr.open('GET', uri);
        //     xhr.onreadystatechange = function(e) {
        //         if (xhr.readyState === 4 && xhr.status === 200) {
        //             resolve(new Gettext(xhr.responseText));
        //         }
        //     };
        //     xhr.onerror = function(e) {
        //         reject(e);
        //     }
        //     xhr.send();
        // }) as Promise<Gettext>;
        return Gettext._fromUri(uri, Object.create(null));
    };
    Gettext._fromUri = function (uri, cache) {
        return fetch(uri) // replace by env
            .then(function (response) { return response.text(); })
            .then(function (content) { return new Gettext(content, cache); });
    };
    Gettext.prototype.setPluralRules = function (pluralRule) {
        this.pluralRule = pluralRule;
        return this;
    };
    Gettext.prototype.gettext = function (text) {
        return this._gettext(text, 0);
    };
    Gettext.prototype.ngettext = function (text, value) {
        return this._gettext(text, this.pluralRule(value || 0));
    };
    Gettext.prototype._gettext = function (text, index) {
        return text in this.cache ? this.cache[text].value[index] : null;
    };
    Gettext.prototype.parse = function () {
        this.cache = parser_1.GettextParser.parse(this.poFileContent, this.cache);
    };
    Gettext.prototype.toJSON = function (options) {
        if (options === void 0) { options = {}; }
        var finalOptions = Object.assign({
            keepPluralMsgId: false,
            keepPluralValue: false
        }, options);
        return Object.values(this.cache).reduce(function (json, currentGettextItem) {
            if (currentGettextItem.isPlural && !finalOptions.keepPluralMsgId) {
                return json;
            }
            json[currentGettextItem.msgid] = finalOptions.keepPluralValue ? currentGettextItem.value : currentGettextItem.value[0];
            return json;
        }, {});
    };
    Gettext.prototype.extendFromUri = function (uri) {
        return Gettext._fromUri(uri, Object.create(this.cache));
    };
    return Gettext;
}());
exports.Gettext = Gettext;

},{"./parser":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger;
(function (Logger) {
    var isEnable = true;
    function disable() {
        isEnable = false;
    }
    Logger.disable = disable;
    function enable() {
        isEnable = true;
    }
    Logger.enable = enable;
    function log() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.log.apply(console, args);
    }
    Logger.log = log;
    function warn() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.warn.apply(console, args);
    }
    Logger.warn = warn;
    function error() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.error.apply(console, args);
    }
    Logger.error = error;
    function debug() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        isEnable && console.debug.apply(console, args);
    }
    Logger.debug = debug;
})(Logger = exports.Logger || (exports.Logger = {}));
exports.default = Logger;

},{}],4:[function(require,module,exports){
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

},{"./logger":3}]},{},[1]);
