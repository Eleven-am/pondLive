import { Route, Component } from '../context/liveContext';
import { html } from '../parser/parser';

export function useRouter (routes: Route[]): Component {
    return (context) => {
        if (!context.isBuilt) {
            routes.forEach((route) => context.initRoute(route));

            return html``;
        }

        const manager = routes.map((route) => context.getManager(route.path))
            .find((manager) => manager?.canRender(context.address));

        if (!manager) {
            return html``;
        }

        const newContext = context.fromManager(manager);
        const data = manager.component(newContext);

        newContext.styles.forEach((style) => context.addStyle(style));

        return data;
    };
}
