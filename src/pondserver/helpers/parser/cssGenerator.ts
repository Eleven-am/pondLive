import {html, HtmlSafeString} from "./parser";

export type CSSOutput = {
    string: HtmlSafeString;
    classes: Record<string, string>;
}

export type CSSGenerator = (statics: TemplateStringsArray, ...dynamics: unknown[]) => CSSOutput;

export const CssGenerator = (id: string): CSSGenerator => {
    const scopeCss = (css: string) => {
        return css.replace(/(\.[a-zA-Z]+)/g, `$1-${id}`);
    }

    const getClasses = (css: string): Record<string, string> => {
        const classes = new Set<string>();
        css.replace(/\.([a-zA-Z0-9_-]+)/g, (_, className) => {
            classes.add(className);
            return '';
        });

        const result: Record<string, string> = {};
        for (const className of classes) {
            result[className] = `${className}-${id}`;
        }

        return result;
    }

    function css(statics: TemplateStringsArray, ...dynamics: unknown[]) {
        const oldCSS = html(statics, ...dynamics).toString();
        const newStatics = statics.map(css => scopeCss(css)) as any as TemplateStringsArray;
        const temp = html`<style>${new HtmlSafeString(newStatics, dynamics)}</style>`;
        return {
            string: temp,
            classes: getClasses(oldCSS.toString())
        }
    }

    return css;
}
