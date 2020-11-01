//объявили и подтянули данный модуль
const gulp = require('gulp');
//из модуля sass
const sass = require('gulp-sass');
//обновляет информ. в браузере
const browserSync = require('browser-sync').create();


//найдем фаил style.scss, сделаем его конвертацию, и положим в директорию фаил style.css
function style () {
    return gulp.src('./scss/**/*.scss') //нашли фаил
        .pipe(sass())                   // сделали его конвертацию
        .pipe(gulp.dest('./css'))      //
        .pipe(browserSync.stream());
}

function watch () {
    browserSync.init({
        server: {
            baseDir: './'
        }
    })
    gulp.watch('./scss/**/*.scss', style);
    //обновление html файла
    gulp.watch('./*.html').on('change', browserSync.reload);
}

exports.style = style;
exports.watch = watch;


