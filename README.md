# fsgettext
a gettext implementation for FS.js.
For the moment, it's still a POC, so up-to-you to use it for your project, but should definitely be improved (see #TODO)

# Description
This is a basic implementation of [`gettext`](https://www.gnu.org/software/gettext/manual/html_node/index.html) by managing request to download the `PO` file, parse it with [`plural`](https://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html) management.

# Usage
Quick documentation based on `index.ts` example: 
```ts
Gettext
    .fromUri('./data/en.po')
    .then((enGettext) => {
        return testGettext(enGettext);
    }).then((enGettext) => {
        return enGettext.extendFromUri('./data/fr.po'); // Create fr gettext with en fallback
    }).then((frGettextWithEnFallback) => {
        return testGettext(frGettextWithEnFallback);
    }).catch((error) => {
        console.error(error);
    });

function testGettext(gettext: Gettext) {
    console.log(gettext);
    console.log(gettext.gettext('Brand'));
    console.log(gettext.ngettext('Track', 1));
    console.log(gettext.ngettext('Track', 3));
    console.log(gettext.gettext('Only for EN')); // In french, this key doesn't exist, so it will fallback to the english dictionary. Useful for having en -> en_us|en_en, or fr -> fr_fr|fr_be|fr_ca|...
    console.log(gettext.toJSON());
    console.log(gettext.toJSON({keepPluralMsgId: true}));
    console.log(gettext.toJSON({keepPluralValue: true}));
    console.log(gettext.toJSON({keepPluralValue: true, keepPluralMsgId: true}));
    return gettext;
}

```

# TODO
 * Fix line in debugger (because of the `filter(Boolean)`)
 * Implement Gettext.fromModule (with import)
 * Implement Gettext.fromString (with string content)
 * Implement universal fetch (for NodeJS)
 * Implement catalog and register each gettext instance to a specific name
 * Remove demo code from code base
 * Better npm script
 * Better documentation...
 * Test...
