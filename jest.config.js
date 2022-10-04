module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node', 'd.ts'],
    collectCoverage: true,
    collectCoverageFrom: [
        "server/**/*.{js,jsx,ts,tsx}",
        "!server/**/*.d.ts"
    ],
};
