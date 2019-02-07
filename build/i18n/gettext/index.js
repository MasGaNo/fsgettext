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
