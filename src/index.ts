import { Gettext } from "./i18n/gettext";

(function () {

    function testGettext(gettext: Gettext) {
        console.log(gettext);
        console.log(gettext.gettext('Brand'));
        console.log(gettext.ngettext('Track', 1));
        console.log(gettext.ngettext('Track', 3));
        console.log(gettext.gettext('Only for EN'));
        console.log(gettext.toJSON());
        console.log(gettext.toJSON({keepPluralMsgId: true}));
        console.log(gettext.toJSON({keepPluralValue: true}));
        console.log(gettext.toJSON({keepPluralValue: true, keepPluralMsgId: true}));
        return gettext;
    }

    Gettext
        .fromUri('./data/en.po')
        .then((enGettext) => {
            return testGettext(enGettext);
        }).then((enGettext) => {
            return enGettext.extendFromUri('./data/fr.po');
        }).then((frGettextWithEnFallback) => {
            return testGettext(frGettextWithEnFallback);
        }).catch((error) => {
            console.error(error);
        });
}());