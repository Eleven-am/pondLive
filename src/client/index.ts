import { initEventListeners } from './events';
import { initPondActors } from './events/pondActors';
import { DomWatcher } from './html/domWatcher';
import { ClientRouter } from './routing/router';

window.onload = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const state = window.__STATE__;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = window.__USER_ID__;
    const domWatcher = new DomWatcher();
    const router = ClientRouter.connect(userId, domWatcher, state);

    initEventListeners(router.channel, domWatcher);
    initPondActors(domWatcher);
};
