'use strict';

// const gulp = require('gulp');
// const sharpResponsive = require('gulp-sharp-responsive');
// const sass = require('gulp-sass')(require('sass'));
// const uglify = require('gulp-uglify');
// const rename = require('gulp-rename');
// const del = require('del');

const gulp = require("gulp");
const sharp = require("sharp");
const rename = require("gulp-rename");
const through2 = require("through2");
const del = require('del');

// Resize images using sharp
// gulp.task('resize', function () {
//     return gulp.src('images/*.{jpg,png,jpeg}')
//         // Save full-size images
//         .pipe(sharpResponsive({
//             formats: [
//                 {
//                     width: 1024,
//                     format: null, // keep original format
//                     rename: { dirname: 'fulls' }
//                 },
//                 {
//                     width: 512,
//                     format: null, // keep original format
//                     rename: { dirname: 'thumbs' }
//                 }
//             ]
//         }))
//         .pipe(gulp.dest('images/'));
// });

gulp.task("resize", function () {
  return gulp.src('images/fulls/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}') // change folder path if needed
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        sharp(file.contents)
          .resize(300)
          .toBuffer()
          .then(data => {
            file.contents = data;
            cb(null, file);
          })
          .catch(err => cb(err));
      } else {
        cb(null, file);
      }
    }))
    .pipe(rename({ suffix: "-thumb" }))
    .pipe(gulp.dest("images/thumbs"));
});

// Delete original files (optional — careful!)
gulp.task('clean-originals', function () {
    return del(['images/*.{jpg,png,jpeg}']);
});

// Compile SCSS to CSS
gulp.task('sass', function () {
    return gulp.src('./assets/sass/main.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename({ basename: 'main.min' }))
        .pipe(gulp.dest('./assets/css'));
});

// Watch SCSS files
gulp.task('sass:watch', function () {
    gulp.watch('./assets/sass/**/*.scss', gulp.series('sass'));
});

// Minify JS
gulp.task('minify-js', function () {
    return gulp.src('./assets/js/main.js')
        .pipe(uglify())
        .pipe(rename({ basename: 'main.min' }))
        .pipe(gulp.dest('./assets/js'));
});

// Default task: resize images then clean originals
gulp.task('default', gulp.series('resize', 'clean-originals'));

// Compile both CSS & JS
gulp.task('compile-sass', gulp.series('sass', 'minify-js'));
