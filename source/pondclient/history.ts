import {DomWatcher} from "./domWatcher";
import {DeepDiff} from "./domDiff";
import {emitEvent} from "./eventEmmiter";

const navigateTo = async (url: string) => {
    emitEvent('navigate-start', {
        location: url,
        shallow: false,
    });
    history.pushState(null, '', url);
    await fetchHtml(url);
    emitEvent('navigate-end', {
        location: url,
        shallow: false,
    });
}

window.addEventListener('popstate', async () => {
    emitEvent('navigate-start', {
        location: location.pathname,
        shallow: false,
    });
    await fetchHtml(location.pathname);
    emitEvent('navigate-end', {
        location: location.pathname,
        shallow: false,
    });
});

const fetchHtml = async (url: string) => {
    const headers = {
        'Content-Type': 'text/html',
        'Accept': 'text/html',
        'x-csrf-token': window.token,
        'x-router-request': 'true',
        'method': 'GET',
    }
    const response = await fetch(url, {headers});
    const headersResponse = response.headers;
    if (headersResponse.has('x-router-action')) {
        const action = headersResponse.get('x-router-action') as 'replace' | 'redirect' | undefined;
        if (action) {
            const url = headersResponse.get('x-router-path') as string;
            const title = headersResponse.get('x-page-title') as string;
            const flashMessage = headersResponse.get('x-flash-message') as string;
            await manageHistory(url, action, title, flashMessage);
        }

    } else {
        const container = headersResponse.get('x-router-container') as string;
        const title = headersResponse.get('x-page-title') as string;
        const flashMessage = headersResponse.get('x-flash-message') as string;
        const content = await response.text();

        manageDOM(container, content, title, flashMessage);
    }
}

export const router = (watcher: DomWatcher) => {
    watcher.delegateEvent('a', 'click', async (anchor, event) => {
        event.preventDefault();
        const target = anchor as HTMLAnchorElement;
        const url = target.href;
        await navigateTo(url);
    });
}

export const manageHistory = async (url: string, action: 'replace' | 'redirect', title?: string, flashMessage?: string) => {
    switch (action) {
        case 'replace':
            emitEvent('navigate-start', {
                location: url,
                shallow: false,
            });
            history.replaceState(null, '', url);
            emitEvent('navigate-end', {
                location: url,
                shallow: false,
            });
            break;
        case 'redirect':
            await navigateTo(url);
            break;
    }

    if (title)
        document.title = title;

    if (flashMessage)
        emitEvent('flash-message', {flashMessage});
}

const manageDOM = (container: string, content: string, title?: string, flashMessage?: string) => {
    const containerElement = document.querySelector(container);
    if (containerElement) {
        const newContainer = document.createElement('div');
        newContainer.innerHTML = content;
        const first = newContainer.firstElementChild as HTMLElement;
        const routerAttribute = first.getAttribute('pond-router');
        if (routerAttribute)
            containerElement.setAttribute('pond-router', routerAttribute);

        DeepDiff(containerElement, first);

        if (title)
            document.title = title;

        if (flashMessage)
            emitEvent('flash-message', {flashMessage});
    }
}
