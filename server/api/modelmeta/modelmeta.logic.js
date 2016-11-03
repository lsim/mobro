let httpRequest = require('../../services/http-request');

module.exports = {

  modelMetaJson: (req, res, next) => {

    const requestUrl = req.body.target;
    if(!requestUrl) {
      return next("RequestUrl can't be empty");
    }

    httpRequest.issueGet(requestUrl).then((result) => {
      res.json(result);
    }).catch((error) => {
      next(`Failed forwarding request to ${requestUrl}`, error);
    });
  },

  foo: () => 42

};
