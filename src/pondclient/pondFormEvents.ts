import {Channel} from "./channel";
import {DomWatcher} from "./domWatcher";

const pondFocus = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-focus]', 'focus', (element) => {
        const closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-focus');
            if (path && event)
                channel.broadcastFrom(`event/${path}`, {type: event});
        }
    });
}

const pondBlur = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-blur]', 'blur', (element) => {
        const closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-blur');
            if (path && event)
                channel.broadcastFrom(`event/${path}`, {type: event});
        }
    });
}

const pondChange = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-change]', 'change', (element) => {
        const closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-change');
            if (path && event)
                channel.broadcastFrom(`event/${path}`, {type: event});
        }
    });
}

const pondInput = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-input]', 'input', (element) => {
        const closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-input');
            if (path && event)
                channel.broadcastFrom(`event/${path}`, {type: event});
        }
    });
}

const pondSubmit = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-submit]', 'submit', (element) => {
        const closestRouter = element.closest('[pond-router]');
        if (closestRouter) {
            const path = closestRouter.getAttribute('pond-router');
            const event = element.getAttribute('pond-submit');
            if (path && event)
                channel.broadcastFrom(`event/${path}`, {type: event});
        }
    });
}

export const pondFormInit = (channel: Channel, watcher: DomWatcher) => {
    pondFocus(channel, watcher);
    pondBlur(channel, watcher);
    pondChange(channel, watcher);
    pondInput(channel, watcher);
    pondSubmit(channel, watcher);
}
