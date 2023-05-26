import {HandlerFunction} from "./handler";

const pondFocus = (handler: HandlerFunction) => {
    handler('[pond-focus]', 'focus', (_, element) => {
        return {
            value: null,
            dataId: element.getAttribute('pond-data-id')
        }
    });
}

const pondBlur = (handler: HandlerFunction) => {
    handler('[pond-blur]', 'blur', (_, element) => {
        return {
            value: null,
            dataId: element.getAttribute('pond-data-id')
        }
    });
}

const pondChange = (handler: HandlerFunction) => {
    handler('[pond-change]', 'change', (_, element) => {
        return {
            value: null,
            dataId: element.getAttribute('pond-data-id')
        }
    });
}

const pondInput = (handler: HandlerFunction) => {
    handler('[pond-input]', 'input', (_, element) => {
        return {
            value: null,
            dataId: element.getAttribute('pond-data-id')
        }
    });
}

const pondSubmit = (handler: HandlerFunction) => {
    handler('[pond-submit]', 'submit', (evt, element) => {
        evt.preventDefault();
        const elements: NodeListOf<HTMLInputElement> = element.querySelectorAll('input, select, textarea');
        const formData: Record<string, string> = {};

        elements.forEach((input, i) => {
            formData[input.getAttribute('name') || `${i}`] = input.value;
        });

        return {
            value: null,
            formData: formData,
            dataId: element.getAttribute('pond-data-id')
        }
    });
}

export const pondFormInit = (handler: HandlerFunction) => {
    pondFocus(handler);
    pondBlur(handler);
    pondChange(handler);
    pondInput(handler);
    pondSubmit(handler);
}