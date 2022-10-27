import {LiveRouter, LiveSocket} from "../emitters";
import {PondResponse} from "@eleven-am/pondsocket";

export declare class ComponentManager {
    manageSocketRender(socket: LiveSocket<any>, router: LiveRouter, response: PondResponse): Promise<void>;
}
