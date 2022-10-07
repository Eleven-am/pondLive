import { html, HtmlSafeString } from "../../pondserver";

export const clientRouter = (parentId: string, componentId: string, innerRoute: HtmlSafeString) => {
    return html`<div id="${parentId}" pond-router="${componentId}">${innerRoute}</div>`;
}
