import {clientRouter} from "./clientRouter";
import {html} from "../../pondserver";

describe('clientRouter', () => {
    it('should be a function', () => {
        expect(typeof clientRouter).toBe('function')
    })

    it('should return a function', () => {
        const value = html`<h1>hello</h1>`;
        const val = html`<div id="test" pond-router="test1">${value}</div>`

        expect(clientRouter('test', 'test1', value).toString()).toEqual(val.toString())
    })
})
