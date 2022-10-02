declare type StaticParsed = Record<string, string[]>;
declare type DynamicParsed = Record<string, unknown>;
export declare type ParsedHTML = StaticParsed | DynamicParsed;
export declare function join(array: (string | HtmlSafeString)[], separator: string | HtmlSafeString): HtmlSafeString;
export declare function safe(value: unknown): HtmlSafeString;
export declare class HtmlSafeString {
    constructor(statics: readonly string[], dynamics: unknown[]);
    toString(): string;
    getParts(): ParsedHTML;
    parsedHtmlToString(parsed: ParsedHTML): string;
    differentiate(parsed: HtmlSafeString): Record<string, any>;
}
export declare function html(statics: TemplateStringsArray, ...dynamics: unknown[]): HtmlSafeString;
export {};
