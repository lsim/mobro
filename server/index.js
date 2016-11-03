'use strict';

let express = require('express');
let app = express();
let router = require('./api/router');
let bodyParser = require('body-parser');

app.use(bodyParser.json());

router(app);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
