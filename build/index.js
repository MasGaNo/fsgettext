"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gettext_1 = require("./i18n/gettext");
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
