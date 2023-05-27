import { LiveContext } from '../context/liveContext';

type CSSProperties = Record<string, string | number>;

function hyphenate (string: string): string {
    return string.replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
}

function styleToCSS (style: CSSProperties): string {
    return Object.keys(style).map((key) => `${hyphenate(key)}:${style[key]}`)
        .join(';');
}

type CSSClasses = Record<string, CSSProperties>;

function classesToCSS (refId: string, classes: CSSClasses): string {
    return Object.keys(classes).map((key) => `.${refId}-${key}{${styleToCSS(classes[key])}}`)
        .join('');
}

interface CSSObject {
    css: string;
    classes: Record<string, string>;
}

function classesToObj (refId: string, classes: CSSClasses): CSSObject {
    const css = classesToCSS(refId, classes);
    const classesObj: Record<string, string> = {};

    Object.keys(classes).forEach((key) => {
        classesObj[key] = `${refId}-${key}`;
    });

    return {
        css,
        classes: classesObj,
    };
}


/* export const makeStyles = <B, A extends CSSClasses = CSSClasses> (classes: (A | ((props: B) => A))): UseStyles<A> => (context, props?: B) => {
    const { css, classes: classesObj } = classesToObj(context.manager.id, typeof classes === 'function' ? classes(props as B) : classes);

    context.addCSS(css);

    return classesObj as { [K in keyof A]: string };
};*/

type CSSGenerator = (props: any) => CSSClasses;
export function makeStyles<A extends CSSClasses> (classes: A): (context: LiveContext) => { [K in keyof A]: string };
export function makeStyles<B extends CSSGenerator> (classes: B): (context: LiveContext, props: Parameters<B>[0]) => { [K in keyof ReturnType<B>]: string };

export function makeStyles (classes: CSSGenerator | CSSClasses) {
    return (context: LiveContext, props?: any) => {
        const { css, classes: classesObj } = classesToObj(context.manager.id, typeof classes === 'function' ? classes(props) : classes);

        context.addCSS(css);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return classesObj as { [K in keyof ReturnType<typeof classes>]: string };
    };
}
