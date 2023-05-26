// eslint-disable-next-line import/no-unresolved
import PondClient from '@eleven-am/pondsocket/client';


import { initEventListeners } from './events';
import { updateTheDom } from './html/clone';
import { DomWatcher } from './html/domWatcher';
import { Html } from '../server/parser/parser';

const connect = (channel: string, initialState: Html) => {
    const watcher = new DomWatcher();

    const client = new PondClient('ws://localhost:3000/live');

    client.connect();

    const chat = client.createChannel(`/${channel}`, {
        address: window.location.toString(),
    });

    chat.join();

    chat.onMessage((event, message) => {
        if (event === 'update') {
            const newState = initialState.reconstruct(message.diff as Record<string, any>);

            updateTheDom(newState.toString());
        }
    });

    initEventListeners(chat, watcher);
};

window.onload = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const initialState = Html.parse(window.__STATE__);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    connect(window.__USER_ID__, initialState);
};
