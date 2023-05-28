type Watcher = (element: HTMLElement, oldValue: string | null, currentValue: string | null) => void;

type TagName = keyof HTMLElementTagNameMap;

type ModificationWatcher = {
    onAdd?: Watcher;
    onUpdated?: Watcher;
    onRemove?: Watcher;
}

export class DomWatcher {
    private readonly _observer: MutationObserver;

    private readonly _modifiers: {[p: string]: ModificationWatcher[]} = {};

    constructor () {
        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];

                switch (mutation.type) {
                    case 'childList':
                        for (let j = 0; j < mutation.removedNodes.length; j++) {
                            const node = mutation.removedNodes[j];

                            if (node instanceof HTMLElement) {
                                const element = node as HTMLElement;

                                for (const selector in this._modifiers) {
                                    if (element.matches(selector)) {
                                        const modifier = this._modifiers[selector];

                                        modifier.forEach((object) => {
                                            object.onRemove && object.onRemove(element, null, null);
                                        });
                                    }
                                }
                            }
                        }

                        for (let j = 0; j < mutation.addedNodes.length; j++) {
                            const node = mutation.addedNodes[j];

                            if (node instanceof HTMLElement) {
                                const element = node as HTMLElement;

                                this._addNewElement(element);
                            }
                        }
                        break;

                    case 'attributes':
                        const element = mutation.target as HTMLElement;
                        const name = `[${mutation.attributeName}]`;

                        for (const selector in this._modifiers) {
                            if (name === selector) {
                                if (mutation.oldValue === null) {
                                    const modifier = this._modifiers[selector];
                                    const current = element.getAttribute(mutation.attributeName!);

                                    modifier.forEach((object) => {
                                        object.onAdd && object.onAdd(element, null, current);
                                    });
                                } else {
                                    const modifier = this._modifiers[selector];
                                    const valuePresent = element.getAttribute(mutation.attributeName!);

                                    modifier.forEach((object) => {
                                        if (valuePresent) {
                                            object.onUpdated && object.onUpdated(element, mutation.oldValue, valuePresent);
                                        } else {
                                            object.onRemove && object.onRemove(element, mutation.oldValue, null);
                                        }
                                    });
                                }
                            }
                        }
                        break;

                    default:
                        break;
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
        });
        this._observer = observer;
    }

    public watch (selector: string, object: ModificationWatcher): void {
        const elements = document.querySelectorAll(selector);

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            const attribute = element.getAttribute(selector);

            object.onAdd && object.onAdd(element, null, attribute);
        }

        const modifier = this._modifiers[selector] || [];

        modifier.push(object);
        this._modifiers[selector] = modifier;
    }

    public unwatch (selector: string): void {
        delete this._modifiers[selector];
    }

    public isWatching (selector: string): boolean {
        return Boolean(this._modifiers[selector]);
    }

    public addEventListener<S extends Event> (selector: string, event: string, callback: (node: HTMLElement, event: S) => void): void {
        this.watch(selector, {
            onAdd: (element) => {
                element.addEventListener(event, (event) => {
                    callback(element, event as S);
                }, { capture: true });
            },
            onRemove: (element) => {
                element.removeEventListener(event, (event) => {
                    callback(element, event as S);
                }, { capture: true });
            },
        });
    }

    public delegateEvent<S extends Event> (tagName: TagName, event: string, callback: (node: HTMLElement, event: S) => void): void {
        document.body.addEventListener(event, (event) => {
            const element = event.target as HTMLElement;

            if (element.tagName.toLowerCase() === tagName.toLowerCase()) {
                return callback(element, event as S);
            }

            const parent = element.parentElement as HTMLElement;

            if (parent && parent.tagName.toLowerCase() === tagName.toLowerCase()) {
                return callback(parent, event as S);
            }

            const firstChild = element.firstElementChild as HTMLElement;

            if (firstChild && firstChild.tagName.toLowerCase() === tagName.toLowerCase()) {
                return callback(firstChild, event as S);
            }
        });
    }

    public delegateSelectorEvent<S extends Event> (selector: string, event: string, callback: (node: HTMLElement, event: S) => void) {
        document.body.addEventListener(event, (event) => {
            const element = event.target as HTMLElement;
            const closest = element.closest(selector) as HTMLElement;

            if (closest) {
                return callback(closest, event as S);
            }
        });
    }

    public onAttributeChange (selector: string, callback: (node: HTMLElement, oldValue: string | null, currentValue: string | null) => void): void {
        this.watch(selector, {
            onAdd: callback,
            onUpdated: callback,
            onRemove: callback,
        });
    }

    public shutdown (): void {
        // eslint-disable-next-line guard-for-in
        for (const selector in this._modifiers) {
            this.unwatch(selector);
        }

        this._observer.disconnect();
    }

    private _addNewElement (node: HTMLElement): void {
        for (const selector in this._modifiers) {
            if (node.matches(selector)) {
                const modifier = this._modifiers[selector];

                modifier.forEach((object) => {
                    const attribute = node.getAttribute(selector);

                    object.onAdd && object.onAdd(node, null, attribute);
                });
            }
        }

        for (let i = 0; i < node.children.length; i++) {
            this._addNewElement(node.children[i] as HTMLElement);
        }
    }
}
