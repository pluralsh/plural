import * as path from 'path'

import { defaultOptions } from '@cypress/webpack-preprocessor'

export const options = {
  ...defaultOptions,
  ...{
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          '@ctypes': path.resolve(__dirname, 'cypress/types'),
          '@pages': path.resolve(__dirname, 'cypress/pages'),
          '@config': path.resolve(__dirname, 'cypress/config'),
          '@support': path.resolve(__dirname, 'cypress/support'),
          '@intercept': path.resolve(__dirname, 'cypress/intercept'),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts?$/,
            use: [{
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(__dirname, 'tsconfig.json'),
              },
            }],
            exclude: /node_modules/,
          },
        ],
      },
    },
  },
}
