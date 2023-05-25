import type { Channel } from '@eleven-am/pondsocket/types';


import { pondEventHandler } from './handler';
import { pondFormInit } from './pondFormEvents';
import { pondKeyboardEvents } from './pondKeyboardEvents';
import { pondMouseEvents } from './pondMouseEvents';
import { DomWatcher } from '../html/domWatcher';

export function initEventListeners (channel: Channel, watcher: DomWatcher): void {
    const handler = pondEventHandler(channel, watcher);

    pondMouseEvents(handler);
    pondKeyboardEvents(handler);
    pondFormInit(handler);
}
