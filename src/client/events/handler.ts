import type { Channel } from '@eleven-am/pondsocket/types';

import { streamLinedBroadcaster, broadcaster } from './eventEmmiter';
import { DomWatcher } from '../html/domWatcher';
import { LiveEvent } from '../types';


type Response = ((Omit<LiveEvent, 'action' | 'dataId'> & { event?: string }) | null);

export type HandlerCallback<GenericEvent extends Event = Event> = (event: GenericEvent, element: HTMLElement, eventType: string) => Promise<Response> | Response;

export type HandlerFunction<GenericEvent extends Event = Event> = (selector: string, event: string, callback: HandlerCallback<GenericEvent>) => void;

const handlerFunction = async (channel: Channel, selector: string, callback: HandlerCallback, element: HTMLElement, evt: Event) => {
    evt.preventDefault();
    const attribute = selector.replace('[', '').replace(']', '');
    const eventType = element.getAttribute(attribute);
    const dataId = element.getAttribute('pond-data-id');

    if (eventType) {
        // eslint-disable-next-line callback-return
        const data = await callback(evt, element, eventType);

        if (data) {
            if (data.event) {
                streamLinedBroadcaster(channel, data.event, {
                    ...data,
                    dataId,
                    action: eventType,
                    address: window.location.toString(),
                });
            } else {
                broadcaster(channel, 'event', {
                    ...data,
                    dataId,
                    action: eventType,
                    address: window.location.toString(),
                });
            }
        }
    }
};

export const pondEventHandler = (channel: Channel, watcher: DomWatcher) => (selector: string, event: string, callback: HandlerCallback<any>) => {
    watcher.addEventListener(selector, event, async (element, evt) => {
        await handlerFunction(channel, selector, callback, element, evt);
    });
};

