/* eslint-disable */

const path = require("path");

module.exports = {
  mode: "development",
  entry: [
    "./asset/js/asset_ol.js",
    "./asset/js/asset_ui.js",
    "./asset/js/asset_ckan.js",
    "./asset/js/asset_i18n.js",
    "./asset/js/asset.js",
    "./asset/js/asset_entry.js",
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  target: 'node',
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "asset/dist/"),
    libraryTarget: "umd",
    library: "AssetMap"
  },
};