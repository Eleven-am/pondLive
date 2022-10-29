"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssGenerator = void 0;
const parser_1 = require("./parser");
const CssGenerator = (id) => {
    const scopeCss = (css) => {
        return css.replace(/(\.[a-zA-Z]+)/g, `$1-${id}`);
    };
    const getClasses = (css) => {
        const classes = new Set();
        css.replace(/\.([a-zA-Z0-9_-]+)/g, (_, className) => {
            classes.add(className);
            return '';
        });
        const result = {};
        for (const className of classes) {
            result[className] = `${className}-${id}`;
        }
        return result;
    };
    function css(statics, ...dynamics) {
        const oldCSS = (0, parser_1.html)(statics, ...dynamics).toString();
        const newStatics = statics.map(css => scopeCss(css));
        const temp = (0, parser_1.html) `<style>${new parser_1.HtmlSafeString(newStatics, dynamics)}</style>`;
        return {
            string: temp,
            classes: getClasses(oldCSS.toString())
        };
    }
    return css;
};
exports.CssGenerator = CssGenerator;
