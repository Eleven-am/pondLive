import { HandlerFunction } from './handler';
import { DragData } from '../types';

const pondClick = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-click]', 'click', () => ({
        value: null,
    }));
};

const pondMouseEnter = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-mouseenter]', 'mouseenter', () => ({
        value: null,
    }));
};

const pondMouseLeave = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-mouseleave]', 'mouseleave', () => ({
        value: null,
    }));
};

const pondMouseMove = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-mousemove]', 'mousemove', () => ({
        value: null,
    }));
};

const pondMouseDown = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-mousedown]', 'mousedown', () => ({
        value: null,
    }));
};

const pondMouseUp = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-mouseup]', 'mouseup', () => ({
        value: null,
    }));
};

const pondDoubleClick = (handler: HandlerFunction<MouseEvent>) => {
    handler('[pond-double-click]', 'dblclick', () => ({
        value: null,
    }));
};

const pondDragStart = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drag-start]', 'dragstart', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

const pondDragEnd = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drag-end]', 'dragend', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

const pondDragOver = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drag-over]', 'dragover', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

const pondDragEnter = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drag-enter]', 'dragenter', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

const pondDragLeave = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drag-leave]', 'dragleave', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

const pondDrop = (handler: HandlerFunction<DragEvent>) => {
    handler('[pond-drop]', 'drop', (_, element) => {
        const positions = element.getBoundingClientRect();
        const dragData: DragData = {
            top: positions.top,
            left: positions.left,
            width: positions.width,
            height: positions.height,
        };

        return {
            value: null,
            dragData,
        };
    });
};

export const pondMouseEvents = (handler: HandlerFunction<any>) => {
    pondClick(handler);
    pondMouseEnter(handler);
    pondMouseLeave(handler);
    pondMouseMove(handler);
    pondMouseDown(handler);
    pondMouseUp(handler);
    pondDoubleClick(handler);
    pondDragStart(handler);
    pondDragEnd(handler);
    pondDragOver(handler);
    pondDragEnter(handler);
    pondDragLeave(handler);
    pondDrop(handler);
};
