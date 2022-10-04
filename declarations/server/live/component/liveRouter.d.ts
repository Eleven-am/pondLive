/// <reference types="node" />
export declare type RouterHeaders = {
    pageTitle: string | undefined;
    flashMessage: string | undefined;
};
export declare class LiveRouter {
    /**
     * @desc Sets the page title for the next page
     * @param title - The title of the page
     */
    set pageTitle(title: string);
    /**
     * @desc Sets the flash message for the next page
     * @param message - The message to display
     */
    set flashMessage(message: string);
    /**
     * @desc Redirects the client to a new page
     * @param path - The path to redirect to
     */
    redirect(path: string): Promise<void> | void;
    /**
     * @desc Replaces the current page with a new page
     * @param path - The path to replace with
     */
    replace(path: string): Promise<void> | void;
}
export {};
