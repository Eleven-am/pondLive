/// <reference types="node" />
import { IncomingHttpHeaders, ServerResponse } from "http";
declare function parseCookies(headers: IncomingHttpHeaders): Record<string, string>;
declare function setCookie(res: ServerResponse, name: string, value: string, options?: any): void;
declare function deleteCookie(res: ServerResponse, name: string): void;
export { parseCookies, setCookie, deleteCookie };
