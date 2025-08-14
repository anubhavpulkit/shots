'use strict';

const gulp = require("gulp");
const sharpResponsive = require("gulp-sharp-responsive");
const sass = require("gulp-sass")(require("sass"));
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const del = require("del");
const sharp = require("sharp");
const through2 = require("through2");


// gulp.task("resize", function () {
//   return gulp.src('images/fulls/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}')
//     .pipe(through2.obj(function (file, _, cb) {
//       if (file.isBuffer()) {
//         sharp(file.contents)
//           .resize(300)
//           .toBuffer()
//           .then(data => {
//             file.contents = data;
//             cb(null, file);
//           })
//           .catch(err => cb(err));
//       } else {
//         cb(null, file);
//       }
//     }))
//     .pipe(rename({ suffix: "-thumb" }))
//     .pipe(gulp.dest("images/thumbs"));
// });

gulp.task("resize", function () {
  return gulp.src("images/fulls/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}")
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const ext = file.extname?.toLowerCase() || file.path.split('.').pop().toLowerCase();

        let image = sharp(file.contents)
          .resize(300, null, {
            fit: "inside",
            withoutEnlargement: true
          });

        if (ext === "jpg" || ext === "jpeg") {
          image = image.jpeg({ quality: 90, mozjpeg: true });
        } else if (ext === "png") {
          image = image.png({ compressionLevel: 6 });
        }

        image
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
