'use strict';

let modelMetaLogic = require('./modelmeta.logic');

module.exports = (api) => {

  api.post('/all', modelMetaLogic.modelMetaJson);

};
