
# PondLive

PondLive is a lightweight, and easy to use serverside only web framework, leveraging the power of [PondSocket](https://github.com/Eleven-am/pondSocket) to create a simple, yet powerful, SPA framework.

## Documentation

This is a Node.js module available through the npm registry.

```bash
  npm install @eleven-am/pondlive
```

PondLive is a framework that uses PondSocket to provide realtime functionality to your application.
PondLive is a server side framework that can be used to render HTML pages with realtime functionality to the browser, eliminating the need for a frontend framework.

```js
    import { LiveFactory, html, Pondlive } from "@eleven-am/pondlive";
    import express from "express";

    const Counter = LiveFactory({
        
        mount(params, socket, router) {
            socket.assign({
                count: 0
            });
        },
    
        manageStyles(css) {
            return css`
                .counter {
                    font-size: 2rem;
                    font-weight: bold;
                    color: ${this.count % 10 === 0 ? 'green': this.count % 2 === 0 ? 'red': 'blue'};
                }
            `;
        },
    
        onEvent(event, socket, router) {
            if (event.type === 'increment') {
                socket.assign({
                    count: this.count + 1
                });
    
    
            } else if (event.type === 'decrement') {
                socket.assign({
                    count: this.count - 1
                });
            }
        },
            
        render(renderRoutes, classes) {
            return html`
                <div>
                    <button pond-click="increment">+</button>
                    <span class="${classes.counter}">${this.count}</span>
                    <button pond-click="decrement">-</button>
                </div>
                ${renderRoutes()}
            `;
        }
    })

    const app = Pondlive(express());
    
    app.usePondLive([{
        path: '/',
        component: Counter
    }]);
    
    app.listen(3000);
```

The above example shows a simple counter that can be incremented and decremented.
The component is a function that takes in an object with the following properties:

* mount: A function that is called when the component is mounted. This function is called with the params, socket, router and the component instance.
* onEvent: A function that is called when an event is received from the browser. This function is called with the event, current readonly socketContext, socket, router and the component instance.
* render: A function that is called when the component is rendered. This returns the html that is rendered to the browser.

#### Lifecycle of a component

###### Mounting 

When a http request is made to the server, the component is mounted and the mount function is called.
At the stage the type of the socket available to the component is a http socket. This socket is used to send the initial html to the browser.
This socket can not send any messages, to the client independent of this connection. The socket can however, subscribe to broadcast channels and receive messages from the server.

###### Rendering

During the render process the information assigned to the socket is available to the component. The component can use this information to render the html.
The html is sent to the browser and the browser renders the html. The browser then attempts to establish a websocket connection with the server.
If successful, the browser also sends an event to the server to inform it that the html has been rendered.

###### onRendered
    
When the server receives the event that the html has been rendered, the server upgrades the initial socket to a websocket connection and calls the onRendered function.
This function is called with the socket, router and the component instance. This socket can now at any time send messages to the client.
Everytime the socket reassigns a value to its context, the component is rendered again and the html is sent to the browser. The browser then renders the new html.

###### onEvent

When an event is received from the client, the onEvent function is called. This function is called with the event, socket, router and the component instance.
The event can be used to update the socket's context, which will cause the component to be rendered again and the html to be sent to the browser.

###### onInfo

A component can subscribe to a broadcast channel. A WebSocket can at anytime broadcast a message to a channel. When a message is received on a channel, the onInfo function is called.
This function is called with the info object from the channel, socket, router and the component instance.
This can be useful to modify the state of the component based on events from other actors, like a database or another client.
Remember that any modification to the socket's context will cause the component to be rendered again and the html to be sent to the browser.

###### onContextChange

A component can subscribe to a global context provider that shares a context with all components. When this context is changed, the onContextChange function is called.
This function is called with the new context, socket, router and the component instance.

###### onUnmount

A component may unmount in one of two ways. Either the browser closes the connection, or the user navigates to another route.
When the component unmounts, the onUnmount function is called. This function is called with the socket, router and the component instance.
This function can be used to clean up any resources that were created during the mount function.
This function does not render the component and thus does not send any html to the browser.

###### manageStyles

When the component is rendered, the manageStyles function is called. This function is called with the css function and the component instance.
A css string is returned from this function and is used to during the render process to add the styles to the html.
Other complex css libraries can be used to generate css styles as well. Note that the styles generated are scoped to the component.

#### PondLive Router

The router is passed through the mount, onEvent, onInfo, onUnmount and render functions.
With the router you can navigate to other components, change the pageTitle and display a flash message

```js
    router.navigateTo('/counter');
    router.replace('/counter');
    
    router.pageTitle = 'Counter';
    router.flashMessage = 'Hello World';
```

#### PondLive Socket (LiveSocket)

The socket holds the state of the current user on this component. The socket is passed through during every lifecycle function.
You can assign new values to the socket thus re-rendering the component and sending the new html to the browser.

```js
    socket.assign({
        count: 0
    });
```
A socket can also emit events that can be listened to on the window object.
Note that this is only available if the socket is a websocket.

```js
    socket.emit('increment', { count: 1 });
```

```js
    window.addEventListener('increment', () => {
        // do something
    });
```

To check if the socket is a websocket, you can use the isWebSocket function.

```js
    if (socket.isWebsocket) {
        // do something
    }
```

#### PondLive Contexts 

###### Global Context
There are two types of contexts. A global context and a local context. The global context is shared between all components under that provider.
This context can be used to share information between components like the current user or the current language.

```js
    import { createContext } from 'pondlive';    

    const [consumer, provider] = createContext({ username: 'John Doe' });
```

The provider is then passed to a component. Every component in this tree can at any time access the context.
This means the provider should be passed to only the root component of the tree or at least to the root of all components that need access to the context.

```js
    const Counter = LiveFactory({   
        providers: [provider],
    
        mount(params, socket, router) {
            // do something
        },
    })
```

Global providers can be passed to the usePondLive function.

```js
    const app = Pondlive(express());
    
    app.usePondLive([{
        path: '/',
        component: Counter
    }], {
        providers: [provider]
    });
    
    app.listen(3000);
```

There are two ways to access the context. The first way is to listen to the onContextChange function.
This function requires that the consumer intercepts the onContextChange function and opens the data from the context.

```js
    const Counter = LiveFactory({   
        providers: [provider],
    
        onContextChange(context, socket, router) {
            consumer.handleContextChange(context, data => {
                // do something with data
            });
        },
    })
```

The second way is to use the consumer to get the context.

```js
    const Counter = LiveFactory({   
        providers: [provider],
    
        mount(params, socket, router) {
            const data = consumer.getContext(socket);
            // do something with data
        },
    })
```

###### Local Context
The local context exists only within a component and is managed by the socket itself. This context is used during all lifecycle functions and any modification to the context will cause the component to be rendered again and the html to be sent to the browser.

```js
    const Counter = LiveFactory({   
        mount(params, socket, router) {
            socket.assign({
                count: 0
            });
        },
    
        onEvent(event, socket, router) {
            if (event.type === 'increment') {
                socket.assign({
                    count: this.count + 1
                });
            }
        },
    
        render(socket, router) {
            return html`
                <div>
                    <button pond-click="increment">Increment</button>
                    <div>${this.count}</div>
                </div>
            `;
        },
    })
```

#### Broadcast Channels

Broadcast channels are a means by which multiple clients communicate with each other. A client can broadcast a message to a channel and any other client that is subscribed to that channel will receive the message.
Any socket can subscribe to a broadcast channel, but since the messages can be emitted at any time only websockets can actually act on the messages.
It is thus advised to subscribe to a broadcast channel in the onRendered function.

```js
    import { BroadcastChannel } from 'pondlive';

    const counterChannel = new BroadcastChannel({
        count: 0
    });

    const Counter = LiveFactory({   
        onRendered(socket, router) {
            counterChannel.subscribe(socket);
            const count = counterChannel.channelData.count;
            
            counterChannel.broadcast({
                newCount: count + 1 // This will be sent to all clients that are subscribed to this channel
            });
            
            counterChannel.assign({
                count: count + 1 // The channel assigns are never broadcasted. 
                // They can be viewed as auxilary data held by the channel
                // This data can be accessed by all sockets that are subscribed to the channel
                // broadcastChannel.channelData will return the data
            });
        },
    
        onInfo(info, socket, router) {
            counterChannel.handleInfo(info, data => {
                // do something with data
                socket.assign({
                    count: data.newCount
                });
            });
        },
    
        render(socket, router) {
            return html`
                <div>
                    <h1> Number of clicks: ${this.count} </h1>
                </div>
            `;
        },
    })
```

#### PondLive Events

PondLive events are a way to communicate between a component and the server. PondLive events are emitted by the client and are handled by the server.
These events are triggered by most of the classic HTML events like click, change, input, submit, etc. The events are triggered by adding the pond- prefix to the event name.
When this event fires on the client it will send a message to the server with the event type as the value of the pond- prefix.

```js
    const Counter = LiveFactory({   
        render(socket, router) {
            return html`
                <div>
                    <button pond-click="increment">Increment</button>
                    <div>${this.count}</div>
                </div>
            `;
        },
    
        onEvent(event, socket, router) {
            if (event.type === 'increment') {
                socket.assign({
                    count: this.count + 1
                });
            }
        },
    })
```

There also some custom events like the pond-upload event. This event can be added to a form and on submit, will send the files to the server.
The pond-upload event can also be added to an input of type file and will send the file to the server. There are some caveats to this event.
Because of how PondLive prevents against cross site scripting attacks, the pond-upload event can only work with components that implement both the onUpload and onUploadRequest functions.
The onUploadRequest function is called when the server receives a pond-upload event. The event contains a list of files with some metadata.
These request can then be accepted or rejected by the server. If the request is accepted, the files will be sent to the server and the onUpload function will be called.

```js
    const Counter = LiveFactory({   
        onUploadRequest(event, socket, router) {
            event.message.files.forEach(file => {
                if (file.type === 'image/png') {
                    file.acceptUpload()
                } else {
                    file.declineUpload();
                }
            });
            
            // All the files can be accepted or declined at once
            // event.message.authoriseAll();
            // event.message.sendError('Something went wrong');
        },
    
        onUpload(event, socket, router) {
            event.files.map(file => {
                // The files can be moved to a different location or destroyed
                file.move('/path/to/new/location');
                // file.destroy(); // this will delete the file
            });
        },
    
        render(socket, router) {
            return html`
                <div>
                    <form pond-upload>
                        <input type="file" pond-upload>
                        <button type="submit">Upload</button>
                    </form>
                </div>
            `;
        },
    })
```

To implement a drag and drop upload system, the pond-drop-upload event can be used. This event listener can be added to any element and will trigger when files are dropped on the element.
When the event is triggered, the whole process is repeated as earlier.

```js
    const Counter = LiveFactory({   
        onUploadRequest(event, socket, router) {
            event.message.files.forEach(file => {
                if (file.type === 'image/png') {
                    file.acceptUpload()
                } else {
                    file.declineUpload();
                }
            });
            
            // All the files can be accepted or declined at once
            // event.message.authoriseAll();
            // event.message.sendError('Something went wrong');
            socket.assign({
                count: event.message.files.length
            });
        },
    
        onUpload(event, socket, router) {
            event.files.map(file => {
                // The files can be moved to a different location or destroyed
                file.move('/path/to/new/location');
                // file.destroy(); // this will delete the file
            });
        },
    
        render(socket, router) {
            return html`
                <div>
                    <span>${this.count} files selected</span>
                    <div pond-drop-upload="upload">
                        Drop files here
                    </div>
                </div>
            `;
        },
    })
```

#### Misc

The entry PondLive function takes in an instance of the express app as the first argument. It returns an extended version of the express app.

```js
    const app = express();
    const pond = PondLive(app);
```

This app introduces two new functions, the usePondLive function and upgrade function.
Since PondLive is built on top of PondSocket, it also has all the features of PondSocket.
To take advantage of these features, the upgrade function can be used to add PondSocket middleware to the express app.
The upgrade function defines a websocket route that client's can connect to. This route provides features like channels, rooms and presence

```js
    pond.upgrade('/pond', (req, res, endpoint) => {
        // This function is called when a client connects to the websocket route
        // The endpoint object contains all the features of PondSocket
        // The request object is and IncomingConnection object
        // The response object is defines the action to takt when the client connects
        // You can either accept, reject, or send a response to the client(this would also accept the connection)
    });
```

For more information on the upgrade function, check out the [PondSocket documentation](https://github.com/Eleven-am/pondSocket#pondsocket).

The usePondLive function is used to add PondLive components to the express app. This function takes an array of Route objects as the first argument.

```js
    pond.usePondLive([
        { 
            path: '/',
            component: Counter 
        },
    ]);
```

The Route object contains the path and the component to render when the path is requested.
Since PondLive supports nested routes, a component can also have its own routes.

```js
    const Counter = LiveFactory({   
        routes: [
            { 
                path: '/',
                component: Counter 
            },
        ],
    
        render(renderRoutes) {
            return html`
                <div>
                    <h1> Number of clicks: ${this.count} </h1>
                    ${renderRoutes() /* This will render the nested routes*/ }
                </div>
            `;
        },
    })
```

There are obviously many more features that are available in PondLive. For more information, use the IDE suggestions or check out the documentation.

#### Examples
* Todo App [Github](https://github.com/Eleven-am/PondLiveTodo) - [liveDemo](https://todo.tutorial.maix.ovh)
* Spotify Widget (PondLive) [Github](https://github.com/Eleven-am/SpotifyWidget) - [liveDemo](https://spotify.tutorial.maix.ovh)
