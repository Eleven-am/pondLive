import { Route, Component } from '../context/liveContext';
import { sortBy } from '../helpers/helpers';
import { parseAddress } from '../matcher/matcher';
import { html } from '../parser/parser';

export function useRouter (routes: Route[]): Component {
    return (context) => {
        if (!context.isBuilt) {
            routes.forEach((route) => context.initRoute(route));

            return html``;
        }

        const sortedRoutes = sortBy(routes, 'path', 'desc');
        const route = sortedRoutes.find((route) => parseAddress(`${context.manager.path}/${route.path}/*`.replace(/\/+/g, '/'), context.address));

        if (!route) {
            return html``;
        }

        const newContext = context.fromRoute(route);

        const data = route.component(newContext);

        newContext.styles.forEach((style) => context.addStyle(style));

        return data;
    };
}
