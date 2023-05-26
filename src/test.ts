import http from 'http';

import PondSocket from '@eleven-am/pondsocket';

import { Context } from './server/context/context';
import { Router } from './server/context/router';
import { useAction } from './server/hooks/useAction';
import { useRouter } from './server/hooks/useRouter';
import { useState } from './server/hooks/useState';
import { html } from './server/parser/parser';

function Counter (context: Context) {
    const [count, setCount] = useState(context, 0);

    context.onUpgrade((channel) => {
        channel.broadcastMessage('counter', {
            count,
        });
    });

    return html`
        <div>
            <h1>${count}</h1>
            <button pond-click=${setCount((state) => state + 1)}>Increment</button>
            <button pond-click=${setCount((state) => state - 1)}>Decrement</button>
            <button pond-click=${setCount(0)}>Reset</button>
        </div>
    `;
}

function Index (context: Context) {
    const stateRouter = useRouter([
        {
            path: '/counter',
            component: Counter,
        },
    ]);

    const [_, action] = useAction(context, {
        log: (e) => console.log(e),
    });

    return html`
        <div>
            <h1>Index</h1>
            <a href="/counter">Counter</a>
            ${stateRouter(context)}
            <button pond-click=${action('log')}>Log</button>
        </div>
    `;
}

const router = new Router();

router.addRoute('/', Index);

const server = http.createServer(router.execute());
const pondSocket = new PondSocket(server);

const endpoint = pondSocket.createEndpoint('/live', (_request, response) => {
    response.accept();
});

const channel = endpoint.createChannel('/:userId', (request, response) => {
    response.accept({
        userId: request.event.params.userId,
    });
    const userId = request.event.params.userId;
    const channel = request.client;
    const address = request.joinParams.address as string;

    router.upgradeUser(userId, channel, address || '/');
});

channel.onEvent('event', async (request, response) => {
    const userId = request.user.assigns.userId as string;
    const action = request.event.payload.action as string;

    response.accept();
    await router.performAction(userId, action, {
        type: 'event',
        userId,
        event: request.event.payload as any,
    });
});

pondSocket.listen(3000, () => {
    console.log('Listening on port 3000');
});
