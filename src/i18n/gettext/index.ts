import Logger from "./logger";
import { GettextParser } from "./parser";

export type TGettextPluralRule = (input: number) => number;

export interface IGettext {
    msgid: string;
    msgidplural?: string;
    value: Array<string>;
    _: {
        line: number;
    };
    isPlural: boolean;
}

type TGettextJsonOptions = {
    keepPluralValue: boolean;
    keepPluralMsgId: boolean;
}

export type TGettextCache = Record<string, IGettext>;
export class Gettext {
    static fromUri(uri: string) {

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
    }

    private static _fromUri(uri: string, cache: TGettextCache) {
        return fetch(uri) // replace by env
        .then(response => response.text())
        .then(content => new Gettext(content, cache));
    }

    private cache: TGettextCache;

    private pluralRule: TGettextPluralRule = n => n > 1 ? 1 : 0;

    private constructor(private poFileContent: string, cache: TGettextCache) {
        this.cache = cache;
        this.parse();
    }

    public setPluralRules(pluralRule: TGettextPluralRule) {
        this.pluralRule = pluralRule;
        return this;
    }

    public gettext(text: string) {
        return this._gettext(text, 0);
    }

    public ngettext(text: string, value: number) {
        return this._gettext(text, this.pluralRule(value || 0));
    }

    private _gettext(text: string, index: number) {
        return text in this.cache ? this.cache[text].value[index] : null;
    }

    private parse() {
        this.cache = GettextParser.parse(this.poFileContent, this.cache);
    }

    public toJSON(options: Partial<TGettextJsonOptions> = {}) {
        const finalOptions = Object.assign({
            keepPluralMsgId: false,
            keepPluralValue: false
        } as TGettextJsonOptions, options);
        return Object.values(this.cache).reduce((json, currentGettextItem) => {
            if (currentGettextItem.isPlural && !finalOptions.keepPluralMsgId) {
                return json;
            }
            json[currentGettextItem.msgid] = finalOptions.keepPluralValue ? currentGettextItem.value : currentGettextItem.value[0];
            return json;
        }, {} as Record<string, string | Array<string>>);
    }

    public extendFromUri(uri: string) {
        return Gettext._fromUri(uri, Object.create(this.cache));
    }
}