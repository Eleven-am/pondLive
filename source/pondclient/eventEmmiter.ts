import {Channel} from "./channel";

export const emitEvent = (event: string, data: any, element?: Element) => {
    const eventEmitter = new CustomEvent(event, {
        detail: data,
        bubbles: true,
        cancelable: true,
    });

    if (element)
        element.dispatchEvent(eventEmitter);
    else
        window.dispatchEvent(eventEmitter);
}

export const dispatchEvent = (channel: Channel, element: Element, listener: string, event?: Event) => {
    const closestRouter = element.closest('[pond-router]');
    let value = null;

    if (event) {
        const input = event.target as HTMLInputElement;
        value = input.value;
    }

    if (closestRouter) {
        const path = closestRouter.getAttribute('pond-router');
        const type = element.getAttribute(listener);
        const dataId = element.getAttribute('pond-data-id');
        if (path && type)
            channel.broadcastFrom(`event/${path}`, {type, value, dataId});
    }
}
