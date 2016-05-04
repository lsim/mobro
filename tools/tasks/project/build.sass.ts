import * as gulp from 'gulp';
import {join} from 'path';
import * as gulpLoadPlugins from 'gulp-load-plugins';
const plugins = <any>gulpLoadPlugins();

import {APP_SRC, APP_DEST} from '../../config';

export = () => {
  return gulp.src([
      join(APP_SRC, '**/*.scss')
    ])
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(gulp.dest(APP_DEST));
}
