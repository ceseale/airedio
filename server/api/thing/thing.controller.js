/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';
var firebase = require('firebase');
var _ = require('lodash');

// Get list of things
exports.index = function(req, res) {
  res.json([
  {
  name : 'Development Tools',
  info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
  name : 'Server and Client integration',
  info : 'Built with a powerful and funtofirebase stack: MongoDB, Express, AngularJS, and Node.'
  }, {
  name : 'Smart Build System',
  info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
  name : 'Modular Structure',
  info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
  name : 'Optimized Build',
  info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
  name : 'Deployment Ready',
  info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  }
  ]);
};

exports.tofirebase = function(req, res) {

  var myFirebaseRef = new firebase("https://aired.firebaseio.com/geotweets/" + req.params.id + "/auth");
  myFirebaseRef.on('value', function (snapshot){
    if(snapshot.val() == null){
     res.send(401)
    } else {
      var dataRef = new firebase("https://aired.firebaseio.com/geotweets/" + req.params.id + "/data/" + req.params.name);
      dataRef.set({main: req.params});
      dataRef = new firebase("https://aired.firebaseio.com/geotweets/" + req.params.id + "/timestamp");
      dataRef.set({timestamp: firebase.ServerValue.TIMESTAMP})
      res.send(200);
    }
  })
  

};


exports.downloadData = function(req, res) {

  var myFirebaseRef = new firebase("https://aired.firebaseio.com/geotweets/" + req.params.id + "/data");

  myFirebaseRef.once('value', function (snapshot){
    res.json(snapshot.val())
  });

};




