const { src, dest, watch, series, parallel } = require("gulp");
const concat = require("gulp-concat");
const uglify = require ("gulp-uglify-es").default;
const imagemin = require('gulp-imagemin');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass'); 
sass.compiler = require('node-sass');

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");


//sökvägar
const files = {
    htmlPath: "src/**/*.html",
    cssPath: "src/**/*.css",
    jsPath: "src/**/*.js",
    imgPath: "src/**/*.{png,gif,jpg}",
    sassPath: "src/**/*.{sass,scss}"
}

//kopiera html-filer
function copyHTML() {
    return src(files.htmlPath)
        .pipe(dest('pub')
    );
}

//sammanslå och minifiera js-filer
function jsTask() {
    return src(files.jsPath)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('pub/js'));
}

//minifiera img-filer
function imgTask() {
    return src(files.imgPath)
        .pipe(imagemin())
        .pipe(dest('pub'));
}

// Konvertera SASS till CSS
function sassTask() {
    return src(files.sassPath)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('pub/css')
    );
    }

//sammanslå css-filer och visa ändringar i live reload
gulp.task('styles', function() {
    return src(files.cssPath)
      .pipe(concat('styles.css'))
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(gulp.dest('pub/css'))
      .pipe(browserSync.reload({
         stream: true
      }))
  });

//watcher och browsersync
function watchTask() {
    browserSync.init({
        server: { baseDir: './pub' }
    });
    gulp.watch([files.htmlPath, files.jsPath, files.cssPath, files.imgPath, files.sassPath], 
        parallel(copyHTML, jsTask, sassTask, imgTask, 'styles'));
    gulp.watch("pub/**/*.html").on("change", browserSync.reload);
}

//default task
exports.default = series(
    parallel(copyHTML, jsTask, imgTask, sassTask),
    watchTask
);