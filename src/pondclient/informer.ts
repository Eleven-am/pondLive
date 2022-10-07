import {Subscription} from "rxjs";
import {Channel} from "./channel";
import {DomWatcher} from "./domWatcher";
import {manageHistory} from "./history";
import {DomDiff} from "./domDiff";
import {emitEvent} from "./eventEmmiter";
import {html, mergeObjects} from "../pondserver";

export const informer = (channel: Channel, watcher: DomWatcher) => {
    const subscriptions: { [p: string]: Subscription } = {};
    const renders: { [p: string]: any } = {};

    const onMount = (element: HTMLElement) => {
        const path = element.getAttribute('pond-router');
        if (path && !subscriptions[path]) {
            subscriptions[path] = channel.onMessage(async (event, message) => {
                if (message.path === path) {
                    if (event === 'rendered') {
                        const parser = html``;
                        renders[path] = message.rendered;
                        const htmlString = parser.parsedHtmlToString(message.rendered);
                        DomDiff(element, htmlString, path, message.headers);
                    }

                    if (event === 'updated') {
                        const parser = html``;
                        const updated = mergeObjects(renders[path], message.rendered);
                        renders[path] = updated;
                        const htmlString = parser.parsedHtmlToString(updated);
                        DomDiff(element, htmlString, path, message.headers);
                    }

                    if (message.headers) {
                        if (message.headers.pageTitle)
                            document.title = message.headers.pageTitle;

                        else if (message.headers.flashMessage)
                            emitEvent('flash-message', {
                                flashMessage: message.headers.flashMessage
                            });
                    }
                }
            });

            channel.broadcastFrom(`mount/${path}`, {});
        }
    }

    const onUnmount = (_element: HTMLElement, oldValue: string | null) => {
        const path = oldValue;
        if (path && subscriptions[path]) {
            channel.broadcastFrom(`unmount/${path}`, {});
            subscriptions[path].unsubscribe();
            delete subscriptions[path];
            delete renders[path];
        }
    }

    const onUpdate = (element: HTMLElement, oldValue: string | null) => {
        const newValue = element.getAttribute('pond-router');
        if (oldValue && newValue) {
            if (oldValue !== newValue) {
                onUnmount(element, oldValue);
                onMount(element);

            } else if (subscriptions[newValue])
                channel.broadcastFrom(`update/${newValue}`, {});
        }

        else if (oldValue && subscriptions[oldValue])
            onUnmount(element, oldValue);

        else if (newValue && !subscriptions[newValue])
            onMount(element);
    }

    watcher.watch('[pond-router]', {
        onAdd: onMount,
        onRemove: onUnmount,
        onUpdated: onUpdate
    });
}

export const manageRoutes = (channel: Channel) => {
    channel.onMessage(async (event, message) => {
        if (event === 'router') {
            const {action, path} = message;
            await manageHistory(path, action);

        } else if (event === 'emit')
            emitEvent(message.event, message.data);
    });
}
