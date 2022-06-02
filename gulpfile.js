process.env.DISABLE_NOTIFIER = true; // Removes notifications on compile ( Was really annoying on Windows D: )
/**
 * Sections:
 * 1. Setup Path Varaibles.
 * 2. Requires.
 * 3. Styles.
 * 4. Scripts.
 * 5. Images.
 * 6. BrowserSync.
 * 7. Alerts and Error Reporting.
 * 8. Watch.
 */


/**
 * 1. Setup Path Varaibles.
 */
const baseDir = './'; // Browsersync server base directory when not using proxy url above.
const showScssLint = false; // Turn scsslint on or off.
const showJsHint = true; // Turn JShint on or off.

// Style paths.
const styleSRC = 'assets/src/scss/**/*.scss'; // Path to main .scss file.
const styleDist = 'assets/dist/css/'; // Path to place the compiled CSS file.
const styleWatchFiles = 'assets/src/scss/**/*.scss'; // Path to all *.scss files inside css folders.

// JS paths.
const jsSRC = 'assets/src/js/main.js'; // Path to main js file.
const jsDist = 'assets/dist/js/'; // Path to place the compiled js file.
const jsWatchFiles = 'assets/src/js/**/*.js'; // Path to all js files inside src folder.

// Images.
const imgSRC = 'assets/src/images/**';
const imgDist = 'assets/dist/images/';


/**
 * 2. Requires.
 */
const gulp = require('gulp'),

    // JS related plugins.
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify-es').default,
    jshint = require('gulp-jshint'),
    include = require("gulp-include"),

    // CSS related plugins.
    sass = require('gulp-sass'),
    scsslint = require('gulp-scss-lint'),
    scssLintStylish = require('gulp-scss-lint-stylish'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),

    // Utility related plugins.
    path = require('path'),
    imagemin = require('gulp-imagemin'),
    gulpif = require('gulp-if'),
    plumber = require('gulp-plumber'),
    rename = require("gulp-rename"),
    notify = require("gulp-notify"),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create();


/**
 * 3. Styles.
 */
gulp.task('styles', function () {
    return gulp.src('assets/src/scss/**/*.scss')
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(gulpif(showScssLint, scsslint({
            customReport: scssLintStylish
        })))
        .pipe(sass()) // Start sass process.
        .pipe(autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(gulp.dest(styleDist)) // Copy *.css into destination.
        .pipe(cleanCSS()) // Clean and minify *.css.
        .pipe(rename({
            extname: '.min.css'
        })) // Rename *.css to *.min.css.
        .pipe(gulp.dest(styleDist)) // Copy *.min.css to destination
        .pipe(notify({
            title: "Styles Task",
            message: "Styles compiled successfully.",
            onLast: true
        }))
        .pipe(browserSync.stream());
});


/**
 * 4. Scripts.
 */
gulp.task("scripts", function () {
    return gulp.src(jsSRC)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(include())
        .pipe(gulpif(showJsHint, jshint({
            esnext: true
        })))
        .pipe(gulpif(showJsHint, jshint.reporter('jshint-stylish')))
        .pipe(babel({
            "presets": [
                ["env", {
                    "modules": false
                }]
            ]
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(jsDist))
        .pipe(notify({
            title: "Scripts Task",
            message: "Scripts compiled successfully.",
            onLast: true
        }));
});

// Create a task that ensures the `js` task is complete before reloading browsers.
gulp.task('js-watch', ['scripts'], function (done) {
    browserSync.reload();
    done();
});


/**
 * 5. Images.
 */
gulp.task('images', function () {
    return gulp.src(imgSRC)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(imagemin({
            optimizationLevel: 3,
            progessive: false,
            interlaced: true
        }))
        .pipe(gulp.dest(imgDist));
});


/**
 * 6. BrowserSync.
 */
gulp.task('browserSync', function () {
    browserSync.init({
        // server: true,
        server: {
            baseDir: baseDir
        },
        port: 3000,
        // proxy: baseUrl,
        notify: {
            styles: {
                top: 'auto',
                bottom: '0',
                borderRadius: '0px',
                color: 'black',
                backgroundColor: '#fdb814'
            }
        }
    });
});


/**
 * 7. Alerts and Error Reporting.
 */
const reportError = function (error) {
    let lineNumber = "";
    if (error.lineNumber) {
        lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';
    }

    // OS Notification bar.
    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Beep' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);
    gutil.beep(); // Beep 'sosumi' again.

    // Pretty error reporting.
    let report = '';
    const chalkErr = gutil.colors.white.bgRed;
    const chalkErrMsg = gutil.colors.cyan;
    const chalkTask = gutil.colors.white.bgBlue;

    report += '\n' + chalkTask(' TASK:             ') + ' ⇨  ' + chalkErrMsg(error.plugin.toUpperCase()) + '\n\n';
    report += chalkErr(' TASK ERROR:       ');
    report += '\n------------------------------------------------------------------------------------ \n\n';
    report += chalkErrMsg(error.message);
    report += '\n\n------------------------------------------------------------------------------------ \n\n';
    if (error.lineNumber) {
        report += chalkErr(' LINE:          ') + ' ' + error.lineNumber + '\n\n';
    }
    if (error.fileName) {
        report += chalkErr(' FILE:          ') + ' ' + error.fileName + '\n\n';
    }
    console.error(report);

    // Prevent the 'watch' task from stopping.
    this.emit('end');
};


/**
 * 9. Watch
 */
// Files to watch.
gulp.task('watch', function () {
    gulp.watch(styleWatchFiles, ['styles']);
    gulp.watch(jsWatchFiles, ['js-watch']);
    gulp.watch(imgSRC, ['images']);
    gulp.watch("*.html").on("change", browserSync.reload);
    gulp.watch("*.php").on("change", browserSync.reload);
});

/**
 * Gulp Default Task
 */
// Just run $ gulp
gulp.task('default', ['browserSync', 'watch', 'styles', 'scripts']);