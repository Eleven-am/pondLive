import {CookieOptions} from "../server/expressConfig/express";

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
     * @desc Navigates the client to a new page
     * @param path - The path to navigate to
     */
    navigateTo(path: string): Promise<void> | void;

    /**
     * @desc Replaces the current page with a new page
     * @param path - The path to replace with
     */
    replace(path: string): Promise<void> | void;

    /**
     * @desc Reloads the current page, only works if the client is already rendered
     */
    reload(): void;

    /**
     * @desc Sets a cookie
     * @param name - The name of the cookie
     * @param value - The value of the cookie
     * @param options - The options for the cookie
     */
    setCookie(name: string, value: string, options?: CookieOptions): void
}

export {};
