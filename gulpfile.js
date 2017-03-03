var path = require("path")

var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var webpack = require("gulp-webpack");
var debug = require("gulp-debug");
var watch = require("gulp-watch");

gulp.task("default", ["webpack"])


// # WEBPACK
var webpackConfig = {
  devtool:"source-map",
  watch: true,
  entry:{
    client: "./js/client.js"
  },
  output: {
    path: "/public/js/",
    filename: "[name].js"
  },
  module:{
    noParse: [
      // /react/
    ],
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  resolve:{
    root:[
      "js",
      "node_modules"
    ],
    extensions: ["", ".js"]
  },
  resolveLoader:{
    root: path.join(__dirname, "node_modules")
  }
}

function compileWebpack(){
  gulp.src("./js/client.js")
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest("./public/js"))
    .pipe(gulp.dest("../Ascend/Ascend/js"));
}

gulp.task("webpack", compileWebpack);
