import path from 'path';

import { LiveContext } from './server/context/liveContext';
import { Router } from './server/context/router';
import { useAction } from './server/hooks/useAction';
import { useRouter } from './server/hooks/useRouter';
import { createServerInfo, useServerInfo } from './server/hooks/useServerInfo';
import { useState, SetOnServer } from './server/hooks/useState';
import { makeStyles } from './server/hooks/useStyles';
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

const useStyle = makeStyles((props: number) => ({
    h1: {
        color: props % 10 === 0 ? 'green' : props % 2 === 0 ? 'red' : 'blue',
    },
}));

const uploadPath = path.join(__dirname, '..', 'uploads');

function handleSubmit (event: ServerEvent, state: string, mutate: SetOnServer<string>) {
    const userId = event.userId;
    const message: Message = {
        userId,
        message: state,
    };

    activeUsersStore.setState(
        {
            ...activeUsersStore.getState(),
            messages: [...activeUsersStore.getState().messages, message],
        },
    );

    mutate(event, '');
}

function activeUsers (context: LiveContext) {
    const [state, setState, mutate] = useState(context, '');
    const {
        activeUsers,
        messages,
    } = useServerInfo(context, activeUsersStore);

    context.onUpgrade((event) => {
        activeUsersStore.setState(
            {
                ...activeUsersStore.getState(),
                activeUsers: [...activeUsersStore.getState().activeUsers, event.userId],
            },
        );
    });

    context.onUnmount((event) => {
        activeUsersStore.setState(
            {
                ...activeUsersStore.getState(),
                activeUsers: activeUsersStore.getState().activeUsers.filter((user) => user !== event.userId),
            },
        );
    });

    const [_, action] = useAction(context, {
        submit: (e) => handleSubmit(e, state, mutate),
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
            <input pond-keyup="${setState((_, event) => event.data.value as string)}" pond-value="${state}" />
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

function Counter (context: LiveContext) {
    const [count, setCount] = useState(context, 0);
    const classes = useStyle(context, count);

    context.onMount((_, res) => {
        res.setPageTitle('Counter');
    });

    return html`
        <div>
            <h1 class="${classes.h1}">${count}</h1>
            <button pond-click=${setCount((state) => state + 1)}>Increment</button>
            <button pond-click=${setCount((state) => state - 1)}>Decrement</button>
            <button pond-click=${setCount(0)}>Reset</button>
        </div>
    `;
}

function Index (context: LiveContext) {
    const stateRouter = useRouter([
        {
            path: '/counter',
            component: Counter,
        },
    ]);

    const [_, action] = useAction(context, {
        log: (e) => console.log(e),
        upload: (e) => e.files?.accept(uploadPath),
    });

    return html`
        <div>
            <h1>Index</h1>
            <a href="/counter">Counter</a>
            <button pond-click=${action('log')}>Log</button>
            <input pond-file="${action('upload')}" type="file" multiple />
            ${stateRouter(context)}
            ${activeUsers(context)}
        </div>
    `;
}

const router = new Router();

router.addRoute('/', Index);
router.serve(3000, () => console.log('Listening on port 3000'));
