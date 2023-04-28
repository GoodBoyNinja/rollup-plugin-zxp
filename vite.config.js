// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import path from "path-browserify";
import license from 'rollup-plugin-license';



let libName = 'rollup-plugin-zxp';
export default defineConfig({
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'lib/main.js'),
            name: `${libName}`,
            // the proper extensions will be added
            fileName: (format) => `${libName}.${format}.js`,
        },
        rollupOptions: {
            plugins: [
                nodePolyfills({
                }),
                // license({
                //     sourcemap: true,
                //     thirdParty: {
                //         includePrivate: false, // Default is false.
                //         output: {
                //             file: path.join(__dirname, 'dist', 'dependencies.txt'),
                //             encoding: 'utf-8', // Default is utf-8.
                //         },
                //     },
                // }),
            ],
            external: ['fs', 'path', 'fs-extra', 'util', 'child_process', 'os', 'fs/promises', 'zxp-provider', 'zxp-sign-cmd'],
            output: {
                globals: {
                    fs: 'fs',
                    path: 'path',
                    'fs-extra': 'fs-extra',
                    util: 'util',
                }
            }
        }
    },
    resolve: {
        alias: {
            path: "path-browserify",
        },

    }
});
