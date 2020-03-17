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
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
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
  devtool: "inline-source-map",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "asset/js/dist/"),
    libraryTarget: "umd",
    library: "AssetMap"
  }
};
