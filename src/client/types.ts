export type RouterHeaders = {
    pageTitle: string | undefined;
    flashMessage: string | undefined;
}

export type default_t<T = any> = Record<string, T>;

export interface LiveEvent<Events extends string = string> {
    action: Events;
    value: string | null;
    dataId: string | null;
    files?: FileMetaData[];
    dragData?: DragData;
    metadata?: MetaData;
    formData?: Record<string, string>;
    address: string;
}

export interface MetaData {
    type: 'UPLOAD_REQUEST' | 'UPLOAD_SUCCESS' | 'UPLOAD_FAILURE';
    identifier: string;
}

export interface FileMetaData {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    lastModifiedDate: Date;
}

export interface PondUploadFile extends FileMetaData {
    identifier: string;
}

export interface DragData {
    top: number;
    left: number;
    width: number;
    height: number;
}
