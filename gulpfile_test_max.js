'use strict';
// объявили что будем использовать

const gulp = require('gulp');                                          //автоматизируем повторяющиеся рабочие процессы и объединяем их в эффективные конвейеры сборки
const plumber = require('gulp-plumber');                               //Предотвратить разрыв канала из-за ошибок плагинов gulp
const server = require('browser-sync').create();                       
const rename = require('gulp-rename');                                 //После минимизации используется gulp-rename и файлы переименуются  в styles.min.css и main.min.js.
const del = require('del');

// css
const sourcemap = require('gulp-sourcemaps');                         //генерирует карты кодов. Внутри плагина gulp-sourcemaps должны быть плагины, которые поддерживаются им (на странице плагина так и написано: All plugins between sourcemaps.init() and sourcemaps.write() need to have support for gulp-sourcemaps. ). Поддерживаемые плагины:..
const sass = require('gulp-sass');                                    //Плагин gulp-sass - компилирует SASS файлы.
const postcss = require('gulp-postcss');                              //Плагин PostCSS gulp для передачи CSS через несколько плагинов, но анализирует CSS только один раз. sass - фиксированный ПРЕ процессор, postcss - ПОСТ процессор, то есть он позволяет вам работать с AST CSS файла, расширять синтаксис, добавлять поведение по вашему вкусу и т.д. Простой пример того, зачем нужен postcss - autoprefixer
const autoprefixer = require('autoprefixer');                         //Autoprefixer расставляет автоматически вендорные префиксы (это которые -moz-, -o- и так далее
const sassGlob = require('gulp-sass-glob');                           //Плагин Gulp для gulp-sass для использования импорта глобально. подключает файлы из папки в каком то своем порядке
const csso = require('gulp-csso');                                    //отличный CSS минификатор.

// image
const imagemin = require('gulp-imagemin');                             //сжатия изображений
const webp = require('gulp-webp');                                     //Оптимизация изображений с использованием формата WebP
const svgstore = require('gulp-svgstore');                             //объединяет все подключаемые SVG файлы и записывает их в HTML как <symbol> для дальнейшего использования. gulp-imacss — очень удобная утилита, которая автоматически преобразовывает подключенные в CSS изображения PNG, JPG, SVG в Data UR

// html
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');

//стили берутся из style.scss - обрабатываются и минифицируются
// в директорию файлов .css
//найдем фаил style.scss, сделаем его конвертацию, и положим
  const css = () =>    {
  return gulp.src('source/sass/style.scss') //нашли фаил
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sassGlob())
    .pipe(sass())                       // сделали его конвертацию
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))   // папка создания style.css
    .pipe(server.stream())
}

//запускаем server, который делает все обнавления в браузере
//запускаем watcher, который следит за ресурсами
const browserSync = () =>  {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch('source/js/**/*.js', gulp.series('js', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
}

const refresh = () => {
  server.reload();
  done();
}

const images = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('source/img'));
}

const gulpWebp = () =>  {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest('source/img'));
}

const sprite = () => {
  return gulp.src('source/img/{icon-*}.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

//берет html собирает минифицирует
const html = () => {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'));
}



//берутся копируются шрифты и картинки

const copy = () => {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/js/**',
    ], {
      base: 'source'
    })
  .pipe(gulp.dest('build'));
}

//берется java script преобразуется ES5 - минифицируется и пишется

const js = () =>  {
  return gulp.src('source/js/**')
  .pipe(gulp.dest('build/js'));
}

const clean = () => {
  return del('build');
}



//Default

exports.css = css;
exports.browserSync = browserSync;
exports.refresh = refresh;
exports.images = images;
exports.webp = webp;
exports.sprite = sprite;
exports.html = html;
exports.copy = copy;
exports.js = js;
exports.clean = clean;


exports.build = gulp.series (
      clean,
      copy,
      css,
      sprite,
      html
    );

exports.start = gulp.series (
  gulp.parallel (
    clean,
    copy,
    css,
    sprite,
    html
  ),

    browserSync

);


