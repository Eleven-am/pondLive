type String<T> = {
    [P in keyof T]: T[P] extends string ? P : never;
}[keyof T];

class NodeLeaf<T> {
    public value: T;

    public key: string;

    public left: NodeLeaf<T> | null;

    public right: NodeLeaf<T> | null;

    constructor (path: string, value: T) {
        this.key = path;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

export class BST<T> {
    private _root: NodeLeaf<T> | null;

    constructor () {
        this._root = null;
    }

    public static fromArray <T, A extends String<T>> (array: T[], key: A) {
        const bst = new BST<Omit<T, A>>();

        array.forEach((item) => {
            const path = item[key] as unknown as string;
            const value = item;

            delete value[key];
            bst.insert(path, value);
        });

        return bst;
    }

    public getRoot () {
        return this._root;
    }

    public search (path: string): T | null {
        return this._searchNode(this._root, path)?.value ?? null;
    }

    public delete (path: string) {
        this._root = this._balance(this._deleteNode(this._root, path));
    }

    public insert (path: string, value: T) {
        const node = this._searchNode(this._root, path);

        if (node) {
            node.value = value;

            return;
        }

        this._root = this._balance(this._insertNode(this._root, path, value));
    }

    public update (path: string, value: T) {
        const node = this._searchNode(this._root, path);

        if (node) {
            node.value = value;

            return;
        }

        throw new Error('Node not found');
    }

    private _height (node: NodeLeaf<T> | null): number {
        if (node === null) {
            return -1;
        }

        return Math.max(this._height(node.left), this._height(node.right)) + 1;
    }

    private _balanceFactor (node: NodeLeaf<T> | null): number {
        if (node === null) {
            return 0;
        }

        return this._height(node.left) - this._height(node.right);
    }

    private _rotateLeft (node: NodeLeaf<T>): NodeLeaf<T> {
        const child = node.right;

        if (child === null) {
            return node;
        }

        node.right = child.left;
        child.left = node;

        return child;
    }

    private _rotateRight (node: NodeLeaf<T>): NodeLeaf<T> {
        const child = node.left;

        if (child === null) {
            return node;
        }

        node.left = child.right;
        child.right = node;

        return child;
    }

    private _rotateLeftRight (node: NodeLeaf<T>): NodeLeaf<T> {
        node.left = this._rotateLeft(node.left!);

        return this._rotateRight(node);
    }

    private _rotateRightLeft (node: NodeLeaf<T>): NodeLeaf<T> {
        node.right = this._rotateRight(node.right!);

        return this._rotateLeft(node);
    }

    private _balance (node: NodeLeaf<T> | null): NodeLeaf<T> | null {
        if (node === null) {
            return null;
        }

        const factor = this._balanceFactor(node);

        if (factor > 1) {
            if (this._balanceFactor(node.left) > 0) {
                return this._rotateRight(node);
            }

            return this._rotateLeftRight(node);
        }

        if (factor < -1) {
            if (this._balanceFactor(node.right) < 0) {
                return this._rotateLeft(node);
            }

            return this._rotateRightLeft(node);
        }

        return node;
    }

    private _insertNode (node: NodeLeaf<T> | null, path: string, value: T): NodeLeaf<T> {
        if (node === null) {
            return new NodeLeaf<T>(path, value);
        }

        if (path < node.key) {
            node.left = this._insertNode(node.left, path, value);
        } else if (path > node.key) {
            node.right = this._insertNode(node.right, path, value);
        }

        return node;
    }

    private _searchNode (node: NodeLeaf<T> | null, path: string): NodeLeaf<T> | null {
        if (node === null) {
            return null;
        }

        if (path === node.key) {
            return node;
        }

        if (path < node.key) {
            return this._searchNode(node.left, path);
        }

        return this._searchNode(node.right, path);
    }

    private _deleteNode (node: NodeLeaf<T> | null, path: string): NodeLeaf<T> | null {
        if (node === null) {
            return null;
        }

        if (path < node.key) {
            node.left = this._deleteNode(node.left, path);
        } else if (path > node.key) {
            node.right = this._deleteNode(node.right, path);
        } else if (node.left === null && node.right === null) {
            node = null;
        } else if (node.left === null) {
            node = node.right;
        } else if (node.right === null) {
            node = node.left;
        } else {
            const min = this._findMinNode(node.right);

            node.key = min.key;
            node.value = min.value;
            node.right = this._deleteNode(node.right, min.key);
        }

        return node;
    }

    private _findMinNode (node: NodeLeaf<T>): NodeLeaf<T> {
        if (node.left === null) {
            return node;
        }

        return this._findMinNode(node.left);
    }
}
