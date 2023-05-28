import { DomWatcher } from '../html/domWatcher';

const pondValue = (watcher: DomWatcher) => {
    watcher.onAttributeChange('[pond-value]', (element, _, currentValue) => {
        const input = element as HTMLInputElement;

        input.value = currentValue || '';
    });
};


export const initPondActors = (watcher: DomWatcher) => {
    pondValue(watcher);
};
