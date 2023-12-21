const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: { 
    randomquotemachine: './dev/src/RandomQuoteMachine.js' 
  },
  output: {
    filename: '[name]/[name].bundle.js',
    path: path.resolve(__dirname, 'dev/dist/'),
  },
	optimization: {
		splitChunks: {
			chunks: 'all'
		}
	},
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	},
	plugins: [
		new HtmlWebpackPlugin({
		  title: 'RandomQuoteMachine',
		  filename: '[name]/randomquotemachine.html',
		  template: 'dev/public/randomquotemachine.html'
		}),
    new MiniCssExtractPlugin({
      linkType: "text/css",
      filename: '[name]/randomquotemachine.css',
    }),
	],
  devServer: {
    static: [
      { directory: path.resolve(__dirname, 'dev/public') },
      { directory: path.resolve(__dirname, 'dev/dist'), watch: true } 
    ], // Folders to serve HTML files from
    port: 3000,
    open: true,
  },
  module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env', 
							'@babel/preset-react'
						]
					}
				}
			},
      {
        test: /\.scss$/,
        use: [
					{
						loader: 'sass-loader'
					},
					{
						loader: 'css-loader'
					}
        ],
      },
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			},
			{
				test: /\.(png|jpg)$/,
				use: [
					{
						loader: 'url-loader'
					}
				]
			}		
		]
  }
}