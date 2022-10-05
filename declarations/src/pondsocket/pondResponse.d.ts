import { ResponsePicker } from "../pondbase";
import { PondMessage, SendResponse } from "./types";
export declare class PondResponse<T extends ResponsePicker = ResponsePicker.CHANNEL> {
    /**
     * @desc Emits a direct message to the client
     * @param event - the event name
     * @param payload - the payload to send
     * @param assigns - the data to assign to the client
     */
    send(event: string, payload: PondMessage, assigns?: Partial<SendResponse<T>>): void;
    /**
     * @desc Accepts the request and optionally assigns data to the client
     * @param assigns - the data to assign to the client
     */
    accept(assigns?: Partial<SendResponse<T>>): void;
    /**
     * @desc Rejects the request with the given error message
     * @param message - the error message
     * @param errorCode - the error code
     */
    reject(message?: string, errorCode?: number): void;
}
