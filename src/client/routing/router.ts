// eslint-disable-next-line import/no-unresolved
import PondClient from '@eleven-am/pondsocket/client';
import type { Channel } from '@eleven-am/pondsocket/types';

import { UpdateData } from '../../server/context/context';
import { Html } from '../../server/parser/parser';
import { emitEvent } from '../events/eventEmmiter';
import { updateTheDom } from '../html/clone';
import { DomWatcher } from '../html/domWatcher';

export enum PondLiveHeaders {
    LIVE_USER_ID = 'x-pond-live-user-id',
    LIVE_ROUTER = 'x-pond-live-router',
    LIVE_PAGE_TITLE = 'x-pond-live-page-title',
    LIVE_ROUTER_ACTION = 'x-pond-live-router-action',
}

export enum PondLiveActions {
    LIVE_ROUTER_NAVIGATE = 'navigate',
    LIVE_ROUTER_UPDATE = 'update',
    LIVE_ROUTER_REDIRECT = 'redirect',
    LIVE_ROUTER_RELOAD = 'reload',
}

export class ClientRouter {
    readonly #userId: string;

    readonly #channel: Channel;

    #virtualDom: Html;

    constructor (channel: Channel, virtualDom: Html, userId: string) {
        this.#userId = userId;
        this.#channel = channel;
        this.#virtualDom = virtualDom;
    }

    get channel () {
        return this.#channel;
    }

    public static connect (userId: string, watcher: DomWatcher, initialState: any) {
        const client = new PondClient('ws://localhost:3000/live');

        client.connect();

        const channel = client.createChannel(`/${userId}`, {
            address: window.location.toString(),
        });

        channel.join();

        const virtualDom = Html.parse(initialState);

        const router = new ClientRouter(channel, virtualDom, userId);

        router.#init(watcher);

        return router;
    }

    async navigateTo (url: string) {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            [PondLiveHeaders.LIVE_ROUTER]: 'true',
            [PondLiveHeaders.LIVE_USER_ID]: this.#userId,
            // TODO add x-csrf-token header
        };

        const response = await fetch(url, {
            headers,
            method: 'GET',
            redirect: 'follow',
            credentials: 'same-origin',
        });

        try {
            const message: UpdateData = await response.json();

            this.#updateDom(message);
        } catch (e) {
            console.error(e);
        }
    }

    #init (watcher: DomWatcher) {
        this.#channel.onMessage((event, message) => {
            if (event === 'update') {
                this.#updateDom(message as UpdateData);
            }
        });

        watcher.delegateEvent('a', 'click', async (anchor, event) => {
            event.preventDefault();
            const target = anchor as HTMLAnchorElement;
            const url = target.href;

            emitEvent('navigate-start', { url });

            await this.navigateTo(url);
            history.pushState(null, '', url);
            emitEvent('navigate-end', { url });
        });
    }

    #updateDom (message: UpdateData) {
        if (message.diff) {
            this.#virtualDom = this.#virtualDom.reconstruct(message.diff);
            updateTheDom(this.#virtualDom.toString());
        }

        if (message[PondLiveHeaders.LIVE_PAGE_TITLE]) {
            document.title = message[PondLiveHeaders.LIVE_PAGE_TITLE];
        }

        if (message[PondLiveHeaders.LIVE_ROUTER_ACTION]) {
            switch (message[PondLiveHeaders.LIVE_ROUTER_ACTION]) {
                case PondLiveActions.LIVE_ROUTER_RELOAD:
                    window.location.reload();
                    break;
                case PondLiveActions.LIVE_ROUTER_REDIRECT:
                    // TODO
                    break;
                case PondLiveActions.LIVE_ROUTER_UPDATE:
                    // TODO
                    break;
                case PondLiveActions.LIVE_ROUTER_NAVIGATE:
                    // TODO
                    break;
                default:
                    break;
            }
        }
    }
}
