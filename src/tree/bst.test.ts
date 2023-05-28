import { BST } from './bst';

describe('BST', () => {
    it('should be able to insert a node', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        expect(bst.getRoot()).not.toBeNull();
    });

    it('should be able to insert multiple nodes', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        bst.insert('test2', 2);
        bst.insert('test3', 3);
        expect(bst.getRoot()).not.toBeNull();

        const root = bst.getRoot();

        expect(root?.left).not.toBeNull();
        expect(root?.right).not.toBeNull();
    });

    it('should be able to search for a node', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        expect(bst.search('test')).toBe(1);

        bst.insert('test2', 2);
        expect(bst.search('test2')).toBe(2);

        bst.insert('test3', 3);
        expect(bst.search('test3')).toBe(3);
    });

    it('should be able to delete a node', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        bst.insert('test2', 2);
        bst.insert('test3', 3);

        bst.delete('test2');
        expect(bst.search('test2')).toBeNull();

        // should not delete other nodes
        expect(bst.search('test')).toBe(1);
        expect(bst.search('test3')).toBe(3);
    });

    it('should be able to create tree from an array of objects', () => {
        const bst = BST.fromArray([
            { id: 'test',
                value: 1 },
            { id: 'test2',
                value: 2 },
            { id: 'test3',
                value: 3 },
        ], 'id');

        expect(bst.search('test')).toStrictEqual({ value: 1 });
        expect(bst.search('test2')).toStrictEqual({ value: 2 });
        expect(bst.search('test3')).toStrictEqual({ value: 3 });
    });

    // perform same tests but with 7 nodes each
    it('should be able to insert multiple nodes complex', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        bst.insert('test2', 2);
        bst.insert('test3', 3);
        bst.insert('test4', 4);
        bst.insert('test5', 5);
        bst.insert('test6', 6);
        bst.insert('test7', 7);
        expect(bst.getRoot()).not.toBeNull();

        const root = bst.getRoot();

        expect(root?.left).not.toBeNull();
        expect(root?.right).not.toBeNull();
    });

    it('should be able to search for a node complex', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        expect(bst.search('test')).toBe(1);

        bst.insert('test2', 2);
        expect(bst.search('test2')).toBe(2);

        bst.insert('test3', 3);
        expect(bst.search('test3')).toBe(3);

        bst.insert('test4', 4);
        expect(bst.search('test4')).toBe(4);

        bst.insert('test5', 5);
        expect(bst.search('test5')).toBe(5);

        bst.insert('test6', 6);
        expect(bst.search('test6')).toBe(6);

        bst.insert('test7', 7);
        expect(bst.search('test7')).toBe(7);
    });

    it('should be able to delete a node complex', () => {
        const bst = new BST<number, string>();

        bst.insert('test', 1);
        bst.insert('test2', 2);
        bst.insert('test3', 3);
        bst.insert('test4', 4);
        bst.insert('test5', 5);
        bst.insert('test6', 6);
        bst.insert('test7', 7);

        bst.delete('test4');
        expect(bst.search('test4')).toBeNull();

        // should not delete other nodes
        expect(bst.search('test')).toBe(1);
        expect(bst.search('test2')).toBe(2);
        expect(bst.search('test3')).toBe(3);
        expect(bst.search('test5')).toBe(5);
        expect(bst.search('test6')).toBe(6);
        expect(bst.search('test7')).toBe(7);
    });

    it('should be able to create tree from an array of objects complex', () => {
        const bst = BST.fromArray([
            { id: 'test',
                value: 1 },
            { id: 'test2',
                value: 2 },
            { id: 'test3',
                value: 3 },
            { id: 'test4',
                value: 4 },
            { id: 'test5',
                value: 5 },
            { id: 'test6',
                value: 6 },
            { id: 'test7',
                value: 7 },
        ], 'id');

        expect(bst.search('test')).toStrictEqual({ value: 1 });
        expect(bst.search('test2')).toStrictEqual({ value: 2 });
        expect(bst.search('test3')).toStrictEqual({ value: 3 });
        expect(bst.search('test4')).toStrictEqual({ value: 4 });
        expect(bst.search('test5')).toStrictEqual({ value: 5 });
        expect(bst.search('test6')).toStrictEqual({ value: 6 });
        expect(bst.search('test7')).toStrictEqual({ value: 7 });
    });
});
