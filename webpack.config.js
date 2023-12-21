const path = require('path');

module.exports = {
  entry: './dev/src/index.js', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output file name
    path: path.resolve(__dirname, 'dev/dist/'), // Output directory
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel for transpiling JavaScript
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // Add other rules for styles, images, etc. as needed
    ],
  },
  devServer: {
    static: [
      { directory: path.join(__dirname, 'dev/public') },
      { directory: path.join(__dirname, 'dev/dist'), watch: true } 
    ], // Folders to serve HTML files from
    port: 3000,
    open: true,
  },
};