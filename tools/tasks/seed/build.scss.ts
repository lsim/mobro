import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as merge from 'merge-stream';
import * as autoprefixer from 'autoprefixer';
import * as inlineSvg from 'postcss-inline-svg';
import * as cssnano from 'cssnano';
import {join} from 'path';
import {
  APP_SRC,
  CSS_PROD_BUNDLE,
  CSS_DEST,
  APP_DEST,
  TMP_DIR,
  BROWSER_LIST,
  ENV,
  SASS_OPTIONS,
  POSTCSS_INLINE_SVG_CONF
} from '../../config';
const plugins = <any>gulpLoadPlugins();

const processors = [
  autoprefixer({
    browsers: BROWSER_LIST
  }),
  inlineSvg(POSTCSS_INLINE_SVG_CONF)
];

const isProd = ENV === 'prod';

if (isProd) {
  processors.push(
    cssnano({
      discardComments: {removeAll: true}
    })
  );
}

export = () => merge(processComponentScss(), processExternalScss());

function processComponentScss() {
  return gulp.src([
      join(APP_SRC, '**', '*.scss'),
      '!' + join(APP_SRC, 'assets', '**', '*.scss'),
      '!' + join(APP_SRC, 'css', '**', '*.scss')
    ])
    .pipe(plugins.sass(SASS_OPTIONS))
    .pipe(isProd ? plugins.cached('process-component-css') : plugins.util.noop())
    .pipe(plugins.postcss(processors))
    .pipe(gulp.dest(isProd ? TMP_DIR: APP_DEST));
}

function processExternalScss() {
  return gulp.src([
      join(APP_SRC, 'assets', '**', '*.scss'),
      join(APP_SRC, 'css', '**', '*.scss')
    ])
    .pipe(plugins.sass(SASS_OPTIONS))
    .pipe(isProd ? plugins.cached('process-external-css') : plugins.util.noop())
    .pipe(plugins.postcss(processors))
    .pipe(isProd ? plugins.concat(CSS_PROD_BUNDLE) : plugins.util.noop())
    .pipe(gulp.dest(CSS_DEST));
}
