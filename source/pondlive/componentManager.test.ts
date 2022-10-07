import {ComponentManager, IComponentManagerProps} from "./componentManager";
import {PondLiveChannelManager} from "./component/pondLiveChannel";

const createComponentManager = () => {
    const test: IComponentManagerProps = {
        pond: {
            on: jest.fn(),
        } as any,
        chain: {
            use: jest.fn(),
        } as any,
        parentId: 'test',
        providers: [],
        pondLive: new PondLiveChannelManager(),
    }
    const context = {
        routes: [],
    } as any;

    return new ComponentManager('/test', context, test);
}

describe('ComponentManager', () => {
    it('should be an instance of ComponentManager', () => {
        const componentManager = createComponentManager();
        expect(componentManager).toBeInstanceOf(ComponentManager);
    });
});
