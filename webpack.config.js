const path = require("path");

module.exports = {
    mode: "development",

    entry: "./src/js/index.tsx",

    output: {
        filename: '[name].bundle.js',
        chunkFilename: 'common.js',
        path: path.resolve(__dirname, 'dist/js')
      },
      optimization: {
          splitChunks: {
              chunks: 'all'
          }
      },
    
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};