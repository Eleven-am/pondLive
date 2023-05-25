import type { Channel } from '@eleven-am/pondsocket/types';

import { LiveEvent } from '../types';

export const emitEvent = (event: string, data: any, element?: Element) => {
    const eventEmitter = new CustomEvent(event, {
        detail: data,
        bubbles: true,
        cancelable: true,
    });

    if (element) {
        element.dispatchEvent(eventEmitter);
    } else {
        window.dispatchEvent(eventEmitter);
    }
};

export const broadcaster = (channel: Channel, path: string, data: LiveEvent) => {
    channel.broadcastFrom('event', data as unknown as any);
};

export const streamLinedBroadcaster = (channel: Channel, event: string, data: LiveEvent) => {
    channel.broadcastFrom(event, data as unknown as any);
};
