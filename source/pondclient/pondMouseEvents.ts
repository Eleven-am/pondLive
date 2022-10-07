import {Channel} from "./channel";
import {DomWatcher} from "./domWatcher";
import {dispatchEvent} from "./eventEmmiter";

const pondClick = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-click]', 'click', (element) => {
        dispatchEvent(channel, element, 'pond-click');
    });
}

const pondMouseEnter = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-mouseenter]', 'mouseenter', (element) => {
        dispatchEvent(channel, element, 'pond-mouseenter');
    });
}

const pondMouseLeave = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-mouseleave]', 'mouseleave', (element) => {
       dispatchEvent(channel, element, 'pond-mouseleave');
    });
}

const pondMouseMove = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-mousemove]', 'mousemove', (element) => {
        dispatchEvent(channel, element, 'pond-mousemove');
    });
}

const pondMouseDown = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-mousedown]', 'mousedown', (element) => {
        dispatchEvent(channel, element, 'pond-mousedown');
    });
}

const pondMouseUp = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-mouseup]', 'mouseup', (element) => {
        dispatchEvent(channel, element, 'pond-mouseup');
    });
}

const pondDoubleClick = (channel: Channel, watcher: DomWatcher) => {
    watcher.addEventListener('[pond-double-click]', 'dblclick', (element) => {
        dispatchEvent(channel, element, 'pond-double-click');
    });
}

export const pondMouseEvents = (channel: Channel, watcher: DomWatcher) => {
    pondClick(channel, watcher);
    pondMouseEnter(channel, watcher);
    pondMouseLeave(channel, watcher);
    pondMouseMove(channel, watcher);
    pondMouseDown(channel, watcher);
    pondMouseUp(channel, watcher);
    pondDoubleClick(channel, watcher);
}
