'use strict';

let BUILD_TYPE = 'dev';

module.exports = {


  STATIC_CONTENT_ROOT: `${__dirname}/../../dist/${BUILD_TYPE}`,
  NODE_MODULES_ROOT: `${__dirname}/../../node_modules`
};
