const path = require("path");
const HtmlPlugin = require('html-webpack-plugin');
const CssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "development",

    entry: "./src/frontend/index.tsx",

    output: {
      filename: '[name].bundle.js',
      chunkFilename: 'common.js',
      path: path.resolve(__dirname, 'dist/public_html/js')
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    plugins: [
      new HtmlPlugin({
	      hash: true,
	      template: './src/index.html',
	      filename: '../index.html'
      }),
      new CssExtractPlugin({
	      filename: '../css/main.css'
      })
    ],
    
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", "*.scss", "*.css"]
    },
    
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader",
                options: {
                    configFile : "tsconfig-frontend.json"
                  }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { 
                enforce: "pre", 
                test: /\.js$/, 
                loader: "source-map-loader" 
            },
	    {
		test: /\.s?css$/,
		use: [
			"style-loader",
			CssExtractPlugin.loader,
			"css-loader",
			"sass-loader"
		]
    	    }
        ]
    }
};
