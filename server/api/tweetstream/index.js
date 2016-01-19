'use strict';

var express = require('express');
var controller = require('./tweetstream.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/obama', controller.startStream);
router.get('/endStream', controller.endStream);
module.exports = router;