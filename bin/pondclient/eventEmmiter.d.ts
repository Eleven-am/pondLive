import { Channel } from "./channel";
export declare const emitEvent: (event: string, data: any, element?: Element) => void;
export declare const dispatchEvent: (channel: Channel, element: Element, listener: string, event?: Event) => void;
