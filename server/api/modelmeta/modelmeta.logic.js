

module.exports = {

  modelMetaJson: (req, res, next) => {
    console.log('processing request!');
    res.json({ data: 'no data for you!'});
  },

  foo: () => 42



};
