import {DeepDiffMapper} from "./deepDiff";
import {getChanges} from "./getChanged";
import {PondError} from "../../../pondbase";

const ENTITIES: {
    [key: string]: string
} = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
}

const ENT_REGEX = new RegExp(Object.keys(ENTITIES).join('|'), 'g');

type StaticParsed = Record<string, string[]>;
type DynamicParsed = Record<string, unknown>;

export type ParsedHTML = StaticParsed | DynamicParsed;

export function join(array: (string | HtmlSafeString)[], separator: string | HtmlSafeString) {
    if (separator === undefined || separator === null) {
        separator = ','
    }
    if (array.length <= 0) {
        return new HtmlSafeString([''], [])
    }
    return new HtmlSafeString(['', ...Array(array.length - 1).fill(separator), ''], array)
}

export function safe(value: unknown) {
    return new HtmlSafeString([String(value)], [])
}

function escapeHTML(unsafe: unknown): string {
    if (unsafe === undefined || unsafe === null) {
        return ''
    }
    if (unsafe instanceof HtmlSafeString) {
        return unsafe.toString()
    }
    if (Array.isArray(unsafe)) {
        return join(unsafe, '').toString()
    }
    return String(unsafe).replace(ENT_REGEX, (char) => ENTITIES[char])
}

export class HtmlSafeString {
    private readonly statics: readonly string[];
    private readonly dynamics: unknown[];

    constructor(statics: readonly string[], dynamics: unknown[]) {
        this.statics = statics;
        this.dynamics = dynamics;
    }

    public toString() {
        let result = this.statics[0];
        for (let i = 0; i < this.dynamics.length; i++) {
            result += escapeHTML(this.dynamics[i]) + this.statics[i + 1];
        }
        return result;
    }

    public getParts(): ParsedHTML {
        const result: ParsedHTML = {
            s: this.statics
        };
        for (let i = 0; i < this.dynamics.length; i++)
            if (this.dynamics[i] instanceof HtmlSafeString)
                result[i] = (this.dynamics[i] as HtmlSafeString).getParts();
            else if (Array.isArray(this.dynamics[i]))
                result[i] = join(this.dynamics[i] as any[], '').getParts();
            else {
                if (this.dynamics[i] === undefined)
                    throw new PondError('undefined value in html', 500, 'render');

                result[i] = this.dynamics[i];
            }
        return result;
    }

    public parsedHtmlToString(parsed: ParsedHTML): string {
        const data = parsed as StaticParsed;
        let result = ''
        if (Array.isArray(data))
            return join(data, '').toString();
        if (data.s) {
            const stat = data.s.filter(s => s !== undefined);
            result = data.s[0];
            for (let i = 0; i < stat.length - 1; i++) {
                if (typeof data[i] === 'object')
                    result += this.parsedHtmlToString(parsed[i] as ParsedHTML) + data.s[i + 1];
                else
                    result += escapeHTML(parsed[i]) + data.s[i + 1];
            }
        }
        return result;
    }

    public differentiate(parsed: HtmlSafeString): Record<string, any> {
        const newParsed = parsed.getParts();
        const oldParsed = this.getParts();

        const mapped = DeepDiffMapper(oldParsed, newParsed);
        return getChanges(mapped);
    }
}

export function html(statics: TemplateStringsArray, ...dynamics: unknown[]) {
    return new HtmlSafeString(statics, dynamics);
}
