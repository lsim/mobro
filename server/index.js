'use strict';

let express = require('express');
let app = express();
let router = require('./api/router');

router(app);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
