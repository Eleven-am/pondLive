import { Component } from '../context/context';
import { sortBy } from '../helpers/helpers';
import { parseAddress } from '../matcher/matcher';
import { html } from '../parser/parser';

export interface Route {
    path: string;
    component: Component;
}

export function useRouter (routes: Route[]): Component {
    return (context) => {
        const { currentComponent, address } = context;

        if (context.isBuilding) {
            routes.forEach((route) => context.initRoute(route));

            return html``;
        }

        const sortedRoutes = sortBy(routes, 'path', 'desc');
        const route = sortedRoutes.find((route) => parseAddress(`${currentComponent.absolutePath}/${route.path}/*`.replace(/\/+/g, '/'), address));

        if (!route) {
            return html``;
        }

        const newContext = context.fromRoute({
            absolutePath: `${currentComponent.absolutePath}${route.path}`.replace(/\/+/g, '/'),
            component: route.component,
        });

        return route.component(newContext);
    };
}
