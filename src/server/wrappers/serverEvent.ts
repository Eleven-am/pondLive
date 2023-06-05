import type { Client } from '@eleven-am/pondsocket/types';

import { PondUploadResponse } from '../../client/actors/uploader';
import { LiveEvent, DragData, PondFile, UploadList, FileMetaData } from '../../client/types';
import { Context, UpdateData } from '../context/context';
import { parseAddress } from '../matcher/matcher';

interface PondEvent {
    value: string | null;
    dataId: string | null;
    dragData?: DragData;
    formData?: Record<string, string>;
}

export enum PondLiveHeaders {
    LIVE_USER_ID = 'x-pond-live-user-id',
    LIVE_ROUTER = 'x-pond-live-router',
    LIVE_PAGE_TITLE = 'x-pond-live-page-title',
    LIVE_ROUTER_ACTION = 'x-pond-live-router-action',
}

export enum PondLiveActions {
    LIVE_ROUTER_NAVIGATE = 'navigate',
    LIVE_ROUTER_UPDATE = 'update',
    LIVE_ROUTER_REDIRECT = 'redirect',
    LIVE_ROUTER_RELOAD = 'reload',
}

interface UploadEvent extends FileMetaData {
    accept: (saveTo: string) => void;
    reject: (message: string) => void;
}

interface UploadEventList {
    files: UploadEvent[];
    accept: (saveTo: string) => void;
    reject: (message: string) => void;
}

export class ServerEvent {
    #uploadList: UploadEventList | null;

    readonly #userId: string;

    readonly #client: Client;

    readonly #data: LiveEvent;

    readonly #url: URL;

    readonly #context: Context;

    constructor (userId: string, client: Client, context: Context, data: LiveEvent) {
        this.#userId = userId;
        this.#client = client;
        this.#data = data;
        this.#url = new URL(data.address);
        this.#context = context;
        this.#uploadList = null;
    }

    get path () {
        return this.#url.pathname;
    }

    get userId () {
        return this.#userId;
    }

    get action () {
        return this.#data.action;
    }

    set action (action: string) {
        this.#data.action = action;
    }

    get data (): PondEvent {
        return {
            value: this.#data.value,
            dataId: this.#data.dataId,
            dragData: this.#data.dragData,
            formData: this.#data.formData,
        };
    }

    get files (): UploadEventList | null {
        if (!this.#data.files) {
            return null;
        }

        if (this.#uploadList) {
            return this.#uploadList;
        }

        this.#uploadList = this.#buildFileList(this.#data.files);

        return this.#uploadList;
    }

    emit (event: string, data: any) {
        if (this.action === 'unmount') {
            return;
        }

        this.#client.broadcastMessage(event, data);
    }

    matches (path: string): boolean {
        return Boolean(parseAddress(`${path}/*`.replace(/\/+/g, '/'), this.#url.pathname));
    }

    navigateTo (path: string) {
        this.#sendMessage({
            [PondLiveHeaders.LIVE_ROUTER_ACTION]: PondLiveActions.LIVE_ROUTER_NAVIGATE,
            address: path,
            diff: null,
        });
    }

    reloadPage () {
        this.#sendMessage({
            [PondLiveHeaders.LIVE_ROUTER_ACTION]: PondLiveActions.LIVE_ROUTER_RELOAD,
            diff: null,
        });
    }

    sendDiff (diff: Record<string, any>) {
        this.#sendMessage({
            diff,
        });
    }

    #buildFileList (files: UploadList): UploadEventList {
        const filesList = files.files.map((file) => this.#buildFile(file));

        const accept = this.#acceptFile.bind(this, files.identifier);
        const reject = this.#rejectFile.bind(this, files.identifier);

        return {
            files: filesList,
            accept,
            reject,
        };
    }

    #acceptFile (identifier: string, moveTo: string) {
        const path = this.#context.addUploadPath(moveTo);
        const event: PondUploadResponse = {
            accepted: true,
            route: path,
        };

        this.emit(identifier, event);
    }

    #rejectFile (identifier: string, message: string) {
        const event: PondUploadResponse = {
            accepted: false,
            message,
        };

        this.emit(identifier, event);
    }

    #buildFile (file: PondFile): UploadEvent {
        const { identifier, lastModifiedDate, ...rest } = file;

        const accept = this.#acceptFile.bind(this, identifier);
        const reject = this.#rejectFile.bind(this, identifier);

        return {
            lastModifiedDate: new Date(lastModifiedDate),
            ...rest,
            accept,
            reject,
        };
    }

    #sendMessage (message: UpdateData) {
        this.#client.broadcastMessage('update', message);
    }
}
