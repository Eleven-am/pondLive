import {Channel} from "./channel";
import {DomWatcher} from "./domWatcher";
import {dispatchEvent} from "./eventEmmiter";

const pondKeyUp = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-keyup]', 'keyup', (element, event) => {
        dispatchEvent(channel, element, 'pond-keyup', event);
    });
}

const pondKeyDown = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-keydown]', 'keydown', (element, event) => {
        dispatchEvent(channel, element, 'pond-keydown', event);
    });
}

const pondKeyPress = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-keypress]', 'keypress', (element, event) => {
        dispatchEvent(channel, element, 'pond-keypress', event);
    });
}

const pondChange = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-change]', 'change', (element, event) => {
        dispatchEvent(channel, element, 'pond-change', event);
    });
}

const pondWindowKeyUp = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-window-keyup]', 'keyup', (element, event: KeyboardEvent) => {
        const closestRouter = element.closest('[pond-router]');
        const key = event.key;
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-window-keyup');
            if (path && event && key)
                channel.broadcastFrom(`event/${path}`, {type: event, key});
        }
    });
}

const pondWindowKeyDown = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-window-keydown]', 'keydown', (element, event: KeyboardEvent) => {
        const closestRouter = element.closest('[pond-router]');
        const key = event.key;
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-window-keydown');
            if (path && event && key)
                channel.broadcastFrom(`event/${path}`, {type: event, key});
        }
    });
}

const pondWindowKeyPress = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-window-keypress]', 'keypress', (element, event: KeyboardEvent) => {
        const closestRouter = element.closest('[pond-router]');
        const key = event.key;
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-window-keypress');
            if (path && event && key)
                channel.broadcastFrom(`event/${path}`, {type: event, key});
        }
    });
}

export const pondKeyboardEvents = (channel: Channel, watcher: DomWatcher) => {
    pondKeyUp(channel, watcher);
    pondKeyDown(channel, watcher);
    pondKeyPress(channel, watcher);
    pondChange(channel, watcher);
    pondWindowKeyUp(channel, watcher);
    pondWindowKeyDown(channel, watcher);
    pondWindowKeyPress(channel, watcher);
}
