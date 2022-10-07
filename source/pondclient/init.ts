import {PondClientSocket as Socket} from "./socket";
import {informer, manageRoutes} from "./informer";
import {DomWatcher} from "./domWatcher";
import {pondMouseEvents} from "./pondMouseEvents";
import {router} from "./history";
import {pondKeyboardEvents} from "./pondKeyboardEvents";
import {pondFormInit} from "./pondFormEvents";
import {emitEvent} from "./eventEmmiter";

declare global {
    interface Window {
        token: string;
    }
}

export const init = () => {
    const socket = new Socket('/live');
    socket.connect();
    const watcher = new DomWatcher();
    const channel = socket.createChannel(`/live/${window.token}`, {clientId: window.token});

    channel.join();
    let emitted = false;

    channel.onConnectionChange((state) => {
        if (state) {
            informer(channel, watcher);
            pondMouseEvents(channel, watcher);
            pondKeyboardEvents(channel, watcher);
            pondFormInit(channel, watcher);
            router(watcher);
            manageRoutes(channel);
            if (!emitted) {
                emitted = true;
                emitEvent('pondReady', channel);
            }
        }
    });
}
