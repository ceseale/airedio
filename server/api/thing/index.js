'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();
router.get('/', controller.index);
router.get('/:id/:lat/:lng/:data', controller.tofirebase );
router.get('/:id/:lat/:lng/:data/:name', controller.tofirebase );
router.get('/:id', controller.downloadData );
module.exports = router;