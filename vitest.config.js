"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        exclude: ['node_modules', 'dist', 'test'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: [
                'src/**/*.spec.ts',
                'src/**/*.dto.ts',
                'src/**/*.module.ts',
                'src/**/*.controller.ts',
                'src/**/*.interface.ts',
                'src/generated/**',
                'src/main.ts',
                'src/app.*',
                'src/common/decorators/**',
                'src/common/types/**',
                'src/auth/decorators/**',
                'src/auth/interfaces/**',
                'src/common/logger/**',
                'src/prisma/**',
                'src/user/types/**',
            ],
            reporter: ['text', 'lcov', 'html'],
            thresholds: {
                lines: 90,
                branches: 85,
            },
        },
    },
});
//# sourceMappingURL=vitest.config.js.map