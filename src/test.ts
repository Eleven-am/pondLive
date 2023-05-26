import http from 'http';

import PondSocket from '@eleven-am/pondsocket';

import { LiveEvent } from './client/types';
import { Context } from './server/context/context';
import { Router } from './server/context/router';
import { useAction } from './server/hooks/useAction';
import { useRouter } from './server/hooks/useRouter';
import { createServerInfo, useServerInfo } from './server/hooks/useServerInfo';
import { useState } from './server/hooks/useState';
import { html } from './server/parser/parser';
import { ServerEvent } from './server/wrappers/serverEvent';

interface Message {
    userId: string;
    message: string;
}

interface ChatState {
    activeUsers: string[];
    messages: Message[];
}

const activeUsersStore = createServerInfo<ChatState>({
    activeUsers: [],
    messages: [],
});

function handleSubmit (event: ServerEvent, state: string) {
    const userId = event.userId;
    const message: Message = {
        userId,
        message: state,
    };

    console.log(message);

    activeUsersStore.setState(
        {
            ...activeUsersStore.getState(),
            messages: [...activeUsersStore.getState().messages, message],
        },
    );
}

function activeUsers (context: Context) {
    const [state, setState] = useState(context, '');
    const { activeUsers, messages } = useServerInfo(context, activeUsersStore);

    context.onUpgrade((event) => {
        activeUsersStore.setState(
            {
                ...activeUsersStore.getState(),
                activeUsers: [...activeUsersStore.getState().activeUsers, event.userId],
            },
        );
    });

    const [_, action] = useAction(context, {
        submit: (e) => handleSubmit(e, state),
    });

    return html`
        <div>
            <h1>Active Users</h1>
            <ul>
                ${activeUsers.map((user) => html`
                    <li>${user}</li>
                `)}
            </ul>
            <h1>Send a message</h1>
            <h4>${state}</h4>
            <input pond-keyup=${setState((_, event) => event.data.value as string)} />
            <button pond-click=${action('submit')}>Submit</button>
            ${messages.map((message) => html`
                <div>
                    <h4>${message.userId}</h4>
                    <p>${message.message}</p>
                </div>
            `)}
        </div>
    `;
}

function Counter (context: Context) {
    const [count, setCount] = useState(context, 0);

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

    return html`
        <div>
            <h1>Index</h1>
            <a href="/counter">Counter</a>
            ${stateRouter(context)}
            ${activeUsers(context)}
        </div>
    `;
}

const router = new Router();

router.addRoute('/', Index);

const server = http.createServer(router.execute());
const pondSocket = new PondSocket(server);

const endpoint = pondSocket.createEndpoint('/live', (request, response) => {
    response.accept();
});

const channel = endpoint.createChannel('/:userId', async (request, response) => {
    const userId = request.event.params.userId;
    const channel = request.client;
    const address = request.joinParams.address as string;

    if (!userId) {
        response.reject('No user id provided');

        return;
    }

    response.accept({
        userId: request.event.params.userId,
    });
    await router.upgradeUser(userId, channel, address || '/');
});

channel.onEvent('event', async (request, response) => {
    const userId = request.user.assigns.userId as string;
    const liveEvent = request.event.payload as unknown as LiveEvent;
    const channel = request.client;

    response.accept();
    const event = new ServerEvent('/', userId, channel, liveEvent);

    await router.performAction(userId, liveEvent.action, event);
});

pondSocket.listen(3000, () => {
    console.log('Listening on port 3000');
});
