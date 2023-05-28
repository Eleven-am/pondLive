type SomeKind<T, U> = {
    [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

class NodeLeaf<T, U> {
    public value: T;

    public key: U;

    public left: NodeLeaf<T, U> | null;

    public right: NodeLeaf<T, U> | null;

    constructor (path: U, value: T) {
        this.key = path;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

export class BST<T, U> {
    private _root: NodeLeaf<T, U> | null;

    constructor () {
        this._root = null;
    }

    public static fromArray <T, U, A extends SomeKind<T, U>> (array: T[], key: A) {
        const bst = new BST<Omit<T, A>, U>();

        array.forEach((item) => {
            const path = item[key] as unknown as U;
            const value = item;

            delete value[key];
            bst.insert(path, value);
        });

        return bst;
    }

    public getRoot () {
        return this._root;
    }

    public search (path: U): T | null {
        return this._searchNode(this._root, path)?.value ?? null;
    }

    public delete (path: U) {
        this._root = this._balance(this._deleteNode(this._root, path));
    }

    public insert (path: U, value: T) {
        const node = this._searchNode(this._root, path);

        if (node) {
            node.value = value;

            return;
        }

        this._root = this._balance(this._insertNode(this._root, path, value));
    }

    public update (path: U, value: T) {
        const node = this._searchNode(this._root, path);

        if (node) {
            node.value = value;

            return;
        }

        throw new Error('Node not found');
    }

    private _height (node: NodeLeaf<T, U> | null): number {
        if (node === null) {
            return -1;
        }

        return Math.max(this._height(node.left), this._height(node.right)) + 1;
    }

    private _balanceFactor (node: NodeLeaf<T, U> | null): number {
        if (node === null) {
            return 0;
        }

        return this._height(node.left) - this._height(node.right);
    }

    private _rotateLeft (node: NodeLeaf<T, U>): NodeLeaf<T, U> {
        const child = node.right;

        if (child === null) {
            return node;
        }

        node.right = child.left;
        child.left = node;

        return child;
    }

    private _rotateRight (node: NodeLeaf<T, U>): NodeLeaf<T, U> {
        const child = node.left;

        if (child === null) {
            return node;
        }

        node.left = child.right;
        child.right = node;

        return child;
    }

    private _rotateLeftRight (node: NodeLeaf<T, U>): NodeLeaf<T, U> {
        node.left = this._rotateLeft(node.left!);

        return this._rotateRight(node);
    }

    private _rotateRightLeft (node: NodeLeaf<T, U>): NodeLeaf<T, U> {
        node.right = this._rotateRight(node.right!);

        return this._rotateLeft(node);
    }

    private _balance (node: NodeLeaf<T, U> | null): NodeLeaf<T, U> | null {
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

    private _insertNode (node: NodeLeaf<T, U> | null, path: U, value: T): NodeLeaf<T, U> {
        if (node === null) {
            return new NodeLeaf<T, U>(path, value);
        }

        if (path < node.key) {
            node.left = this._insertNode(node.left, path, value);
        } else if (path > node.key) {
            node.right = this._insertNode(node.right, path, value);
        }

        return node;
    }

    private _searchNode (node: NodeLeaf<T, U> | null, path: U): NodeLeaf<T, U> | null {
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

    private _deleteNode (node: NodeLeaf<T, U> | null, path: U): NodeLeaf<T, U> | null {
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

    private _findMinNode (node: NodeLeaf<T, U>): NodeLeaf<T, U> {
        if (node.left === null) {
            return node;
        }

        return this._findMinNode(node.left);
    }
}
