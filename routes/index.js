var express = require('express');
var router = express.Router();

const v1=require('./v1/index')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/v1',v1)

module.exports = router;
