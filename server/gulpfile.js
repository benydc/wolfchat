const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];
const HTML_FILES = ['src/*.html', 'src/**/*.html'];
const SVG_FILES = ['src/*.svg', 'src/**/*.svg'];
const PDF_FILES = ['src/*.pdf', 'src/**/*.pdf'];
const FONT_FILES = ['src/*.otf', 'src/**/*.otf'];
const EJS_FILES = ['src/*.ejs', 'src/**/*.ejs'];
const PY_FILES = ['src/*.py', 'src/**/*.py'];
const PEM_FILES = ['src/*.pem', 'src/**/*.pem'];
const DOT_ENV = ['src/.env'];
//let paths = require("gulp-ts-paths").default;

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', function () {
    return gulp.src('src/**/*.ts')
        /*.pipe(paths({
            config: tsProject.config,
            baseDir: "./src"
        }))*/
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});

gulp.task('ejs', function () {
    return gulp.src(EJS_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('jsons', function () {
    return gulp.src(JSON_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('htmls', function () {
    return gulp.src(HTML_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('svgs', function () {
    return gulp.src(SVG_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('pdfs', function () {
    return gulp.src(PDF_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
    return gulp.src(FONT_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('dotEnv', function () {
    return gulp.src(DOT_ENV)
        .pipe(gulp.dest('dist'));
});

gulp.task('pythons', function () {
    return gulp.src(PY_FILES)
        .pipe(gulp.dest('dist'));
});
gulp.task('pem-certs', function () {
    return gulp.src(PEM_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['scripts', 'jsons', 'htmls', 'svgs', 'pdfs', 'fonts', 'dotEnv', 'ejs', 'pythons', 'pem-certs']);

gulp.task('watch', ['build'], function () {
    nodemon({
        script: 'dist/server.js',
        ext: 'ts json html ejs py',
        watch: "src",
        tasks: ['build']
    });
});
