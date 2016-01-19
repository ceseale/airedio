var app = angular.module('airedioApp');
app.controller('MapmakerCtrl', function ($scope, $location, $timeout, $http, $q, $firebaseObject, $firebaseArray, $firebaseAuth, $sce, $window) {
  var bounds2;
  var rectangle;
  var rectangle2;
  var numScale;
  var radScale;
  var y1 = [];
  var y2 = [];
  var rect1_mean;
  var rect1_var;
  var rect1_n;
  var rect2_mean;
  var rect2_var;
  var rect2_n;
  var colorDead, colorAcci, projection, overlay, padding, mapOffset, layer, weekDayTable, svg, gPrints, weekdayDim, hourDim, barAcciHour, transform, ifdead, setCircle, initCircle, tranCircle, updateGraph;
  var overlay, ndx, myFirebaseRef, rectangle, rectangle2;
  var tweetcode, syncObject;
  ndx = crossfilter([]); // Setting up empty crossfilter
  var all = ndx.groupAll();
  var lngDim, latDim, wcountDim, scoreDim;
  //Log in and firebase set up
  $scope.tweetList = [];
  // Move to app service
  $scope.isChrome = (navigator.sayswho.indexOf('Chrome') != -1);
  if (!$scope.isChrome) {
    $location.path('/noChrome');
  }
  hljs.initHighlightingOnLoad();
  $scope.dataTab = false;
  $scope.map = {};
  $scope.showair = true;
  $scope.map.colorNames = ['Max Data Color', 'Min Data Color']
  $scope.dataname = '';
  var sharedataref;
  $scope.map.colorScheme = ['#00ff00', '#ff0000'];
  $scope.colabData = {};
  $scope.colabData.airedEmail = '';
  $scope.colabData.matchEmail = '';
  $scope.datum = [{
    text: 'Obama Twiiter Stream',
    code: 'obamaStream'
  }];
  var userdataref = undefined;
  var kandydemo;
  var userid;
  // Calling options for Kandy
  $scope.demo = false;
  $scope.kandyapi = {};
  $scope.kandyapi.calluser = '';
  $scope.showEndCall = false;
  $scope.showCallAE = false;
  $scope.videos = false;
  $scope.showCall = true;
  // Firebase dec 
  var ref = new Firebase("https://aired.firebaseio.com");
  $scope.auth = $firebaseAuth(ref);
  $scope.user = {
    email: "",
    password: ""
  };
  $scope.registerUser = {
    email: "",
    password: "",
    confirmPassword: ""
  };
  $scope.loggedin = false;
  // For login button
  $scope.login = function () {
    $scope.errors = [];
    $scope.num = 'logging in';
    $scope.auth.$authWithPassword({
      email: $scope.user.email,
      password: $scope.user.password
    }).catch(function (error) {
      $scope.errors.push(error.message);
    });
  };
  // For logout button
  $scope.logout = function () {
    $scope.auth.$unauth()
    $window.location.reload(); // Reload the page after logout
  }
  $scope.modals = {};
  $scope.modals.welcome = true;
  $scope.modals.myData = false;
  $scope.modals.addData = false;
  $scope.modals.styleData = false;
  $scope.modals.dataAnalysis = false;
  $scope.modals.collaborate = false;
  $scope.modals.account = false;
  $scope.modals.welcomeCall = function () {
    $scope.modals.welcome = !$scope.modals.welcome;
  }
  $scope.modals.myDataCall = function () {
    $scope.modals.myData = !$scope.modals.myData;
  }
  $scope.modals.addDataCall = function () {
    $scope.modals.addData = !$scope.modals.addData;
  }
  $scope.modals.styleDataCall = function () {
    $scope.modals.styleData = !$scope.modals.styleData
  }
  $scope.modals.dataAnalysisCall = function () {
    $scope.modals.dataAnalysis = !$scope.modals.dataAnalysis
  }
  $scope.modals.collaborateCall = function () {
    $scope.modals.collaborate = !$scope.modals.collaborate
  }
  $scope.modals.accountCall = function () {
    $scope.modals.account = !$scope.modals.account;
  }
  // Using Firebase for user authentication
  // AUTH
  $scope.auth.$onAuth(function (authData) {
    if (authData) {
      $scope.datum = []
      $scope.user.email = authData.password.email;
      userid = authData.uid;
      $scope.loggedin = true;
      userdataref = new Firebase("https://aired.firebaseio.com/userdataref/" + userid);
      $scope.datum = $firebaseArray(userdataref)
      if (authData.uid == 'simplelogin:12' || authData.uid == 'simplelogin:13') {
        $scope.demo = true;
        kandydemo();
      }
    } else {
      $scope.loggedin = false;
    }
  });
  // Registration for new Users
  $scope.createUser = function () {
    $scope.message = null;
    $scope.errors = [];
    $scope.auth.$createUser({
      email: $scope.registerUser.email,
      password: $scope.registerUser.password
    }).then(function (userData) {
      $scope.user.email = $scope.registerUser.email;
      $scope.user.password = $scope.registerUser.password;
      userid = userData.uid;
      var userdataref = new Firebase("https://aired.firebaseio.com/userdataref/" + userid);
      for (var i in $scope.datum) {
        userdataref.push({
          text: $scope.datum[i].text,
          code: $scope.datum[i].code
        });
      }
      $scope.login();
    }).catch(function (error) {
      $scope.errors.push(error.message);
    });
  };

  function clearMapObject() {
    var isRect1 = $scope.map.rect1 ? true : false;
    var isRect2 = $scope.map.rect2 ? true : false;
    var temp_color = $scope.map.colorScheme
    $scope.map = {};
    $scope.map.onair = true;
    $scope.map.colorScheme = temp_color;
    $scope.map.maxdata = $scope.maxdata;
    $scope.map.mindata = $scope.mindata;
    $scope.map.firecode = tweetcode.code;
    $scope.map.mapCenter = {
      lat: map.getCenter().lat(),
      lng: map.getCenter().lng()
    }
    $scope.map.zoom = map.getZoom()
    if (isRect1) {
      $scope.map.rect1 = (function () {
        var ne = rectangle.getBounds().getNorthEast();
        var sw = rectangle.getBounds().getSouthWest();
        ne = {
          lat: ne.lat(),
          lng: ne.lng()
        };
        sw = {
          lat: sw.lat(),
          lng: sw.lng()
        };
        return ({
          ne: ne,
          sw: sw
        })
      })();
    }
    if (isRect2) {
      $scope.map.rect2 = (function () {
        var ne = rectangle2.getBounds().getNorthEast();
        var sw = rectangle2.getBounds().getSouthWest();
        ne = {
          lat: ne.lat(),
          lng: ne.lng()
        };
        sw = {
          lat: sw.lat(),
          lng: sw.lng()
        };
        return ({
          ne: ne,
          sw: sw
        });
      })();
    }
  }
  $scope.shareDes = function () {
      if (!$scope.outref) {
        alert('You need to select a data stream before linking maps')
      } else {
        $scope.currentlySharing = true;
        var mark = $scope.colabData.airedEmail.indexOf('@');
        if (mark == -1 || mark == 0) {
          return alert('Please enter a valid email');
        }
        var main_email = $scope.colabData.airedEmail.substring(0, mark);
        sharedataref = new Firebase("https://aired.firebaseio.com/onair/" + main_email + "/" + tweetcode.code);
        clearMapObject();
        sharedataref.set($scope.map)
        sharedataref.onDisconnect().remove();
        var syncObject = $firebaseObject(sharedataref);
        syncObject.$bindTo($scope, "map");
      }
    }
    // move to service
  $scope.findAir = function () {
    var mark = $scope.colabData.matchEmail.indexOf('@');
    if (mark == -1 || mark == 0) {
      return alert('Please enter a valid email');
    }
    var main_email = $scope.colabData.matchEmail.substring(0, mark);
    sharedataref = new Firebase("https://aired.firebaseio.com/onair/" + main_email);
    var syncObject = $firebaseObject(sharedataref);
    sharedataref.once('value', function (snapshot) {
      if (snapshot.val() == null) {
        alert('Sorry, no one has shared a map with that email')
      } else {
        $scope.currentlySharing = true;
        sharedataref = new Firebase("https://aired.firebaseio.com/onair/" + main_email + "/" + snapshot.val()[Object.keys(snapshot.val())[0]].firecode);
        var syncObject = $firebaseObject(sharedataref);
        syncObject.$bindTo($scope, "map")
        syncObject.$loaded().then(function () {
          tweetcode = {
            code: $scope.map.firecode
          };
          $scope.changeData(null, tweetcode)
        });
      }
    })
  }
  var registerFucntion = function (name) {
    $scope.map.callfunc = name;
  };
  // This is where the map and Bayseian Data Starts
  // Move to it's own route
  projection = null;
  $scope.firecode = "ID";
  $scope.rectOffMess1 = $scope.rectOffMess2 = "Click to Start Data Analysis";
  $scope.bayesbutt = true;
  var rect_color = d3.scale.linear().domain([0, 1]).range(['red', 'black', 'black']);
  $scope.showCharts = false;
  var overlaynorthEast;
  var overlaysouthWest;
  $("#diff_plots_div").hide();
  var count = 0;
  // Change the data on Map
  $scope.changeData = function (index) {
    tweetcode = arguments[1] ? arguments[1] : {
      code: $scope.datum[index].code
    };
    myFirebaseRef = new Firebase("https://aired.firebaseio.com/geotweets/" + tweetcode.code + "/data");
    $scope.outref = "https://aired.firebaseio.com/geotweets/" + tweetcode.code;
    var ob = $firebaseArray(myFirebaseRef)
    ob.$loaded().then(function () {
      $scope.tweetList = ob;
    })
    $scope.selectedi = $scope.datum[index];
  };
  $scope.downlaodData = function (index) {
    var tweetcode = {
      code: $scope.datum[index].code
    };
    return "api/things/" + tweetcode.code;
  }
  $scope.closeAlert = function (index) {
    if (typeof userdataref == "undefined") {
      $scope.datum.splice(index, 2)
      $scope.tweetList = [];
    } else {
      $scope.datum.$remove(index);
      $scope.tweetList = [];
    }
  };
  overlay = null;
  padding = 5;
  mapOffset = 4000;
  var dimtest;
  // Getting a new code to stream data too
  $scope.getCode = function (dataname) {
    var newcode = arguments[1] ? arguments[1] : Math.floor(Math.random() * 100000000000000);;
    if (typeof userdataref == "undefined") {
      $scope.datum.push({
        text: dataname,
        code: newcode
      })
    } else {
      $scope.datum.$add({
        text: dataname,
        code: newcode
      })
    }
    $scope.dataname = "";
    tweetcode = {
      code: newcode
    };
    $scope.firecode = newcode;
    myFirebaseRef = new Firebase("https://aired.firebaseio.com/geotweets/" + newcode + "/auth");
    myFirebaseRef.set({
      ready: "yes"
    })
    myFirebaseRef = new Firebase("https://aired.firebaseio.com/geotweets/" + newcode + "/data");
    $scope.tweetList = $firebaseArray(myFirebaseRef)
    if (count == 0) {
      overlay.setMap(map)
      count = 293; // TESTING
    } else {
      updateGraph();
    }
  }
  $scope.searchTweet = function (count, id, code) {
    $http.post('/max_id', {
      firebasecode: tweetcode
    }).success(function (max_id) {
      id = typeof tweetcode !== 'undefined' ? max_id.max_id : "Infinity"
      $scope.count = typeof count !== 'undefined' ? count : $scope.count
      $scope.meter = true;
      code = typeof tweetcode == !"undefined" ? tweetcode.code : code
      var mapcenter = map.getCenter()
      var terms = $('#searchwords').val().replace(/,/g, ' OR ');
      var geocode = mapcenter.lat() + ',' + mapcenter.lng() + ',50mi'
      $http.post('/sentiTweets', {
        firebasecode: tweetcode,
        tweetOptions: {
          q: terms,
          count: $scope.count,
          locale: "en",
          result_type: 'recent',
          geocode: geocode,
          max_id: id
        }
      }).success(function (awesomeThings) {
        $scope.meter = false;
        tweetcode = (awesomeThings);
        myFirebaseRef = new Firebase("https://aired.firebaseio.com/geotweets/" + tweetcode.code + "/data");
        $scope.tweetList = $firebaseArray(myFirebaseRef)
      });
    })
  }
  $scope.mindata = 610000000;
  $scope.maxdata = -92933980.60;
  var pasts;
  $scope.$watch('tweetList', function (tweetList) {
      if (tweetList && pasts != tweetList) {
        pasts = tweetList;
        ndx = crossfilter(tweetList)
        lngDim = ndx.dimension(function (it) {
          return it.main.lng;
        });
        latDim = ndx.dimension(function (it) {
          return it.main.lat;
        });
        scoreDim = ndx.dimension(function (it) {
          if (it.main.data < $scope.mindata) {
            $scope.mindata = it.main.data;
          }
          if (it.main.data > $scope.maxdata) {
            $scope.maxdata = it.main.data;
          }
          numScale = d3.scale.linear().domain([$scope.maxdata, $scope.mindata]).range($scope.map.colorScheme)
          radScale = d3.scale.linear().domain([$scope.maxdata, $scope.mindata]).range([7, 14])
          return it.main.data;
        });
        if (overlay.draw) {
          overlay.draw()
        } else {
          overlay.setMap(map)
        }
      }
    }, true)
    // Map Declation and Map Design
  var map, initMap;
  $scope.datumtypes = {};
  $scope.styledMap = new google.maps.StyledMapType(pale_dawn, {
    name: 'Styled Map'
  });
  var setmapStyle = function (style) {
    $scope.styledMap = new google.maps.StyledMapType(style, {
      name: 'Styled Map'
    });
    map.mapTypes.set('map_style', $scope.styledMap);
  }
  $scope.subtle_grayscale = function () {
    setmapStyle(subtle_grayscale);
    registerFucntion('subtle_grayscale')
  };
  $scope.blue_water = function () {
    setmapStyle(blue_water);
    registerFucntion('blue_water')
  };
  $scope.avacado = function () {
    setmapStyle(avacado);
    registerFucntion('avacado')
  };
  $scope.shades_of_grey = function () {
    setmapStyle(shades_of_grey);
    registerFucntion('shades_of_grey')
  };
  $scope.pale_dawn = function () {
    setmapStyle(pale_dawn);
    registerFucntion('pale_dawn')
  };
  $scope.apple_aaps_esque = function () {
    setmapStyle(apple_aaps_esque);
    registerFucntion('apple_aaps_esque')
  };
  $scope.midnight_commander = function () {
    setmapStyle(midnight_commander);
    registerFucntion('midnight_commander')
  };
  $scope.blue_essence = function () {
    setmapStyle(blue_essence);
    registerFucntion('blue_essence')
  };
  $scope.retro = function () {
    setmapStyle(retro);
    registerFucntion('retro')
  };
  $scope.paper = function () {
    setmapStyle(paper);
    registerFucntion('paper')
  };
  $scope.unimposed = function () {
    setmapStyle(unimposed);
    registerFucntion('unimposed')
  };
  // TODO
  var updateview1 = function () {
    $scope.box1 = " Rectangle 1\nMean: " + rect1_mean.toFixed(3) + "\n SD:\n " + Math.sqrt(rect1_var).toFixed(3) + "\n" + " Sample\n n = " + rect1_n
  }
  var updateview2 = function () {
    $scope.box2 = " Rectangle 2\nMean: " + rect2_mean.toFixed(3) + "\n SD:\n " + Math.sqrt(rect2_var).toFixed(3) + "\n" + " Sample\n n = " + rect2_n
  }
  initMap = function () {
      $(function () {
        $(document).tooltip({
          items: "button",
          content: function () {
            var element = $(this);
            if (element.attr('id') === 'subtle_grayscale') {
              return "<p>A nice, simple grayscale version of the map with color extremes that are never too harsh on the eyes. </p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/15-subtle-grayscale.png?v=20150319062423' />";
            } else if (element.attr('id') === 'blue_water') {
              return "<p>A simple map with blue water and roads/landscape in grayscale.</p> <p></p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/25-blue-water.png?v=20150319065438' />";
            } else if (element.attr('id') === 'shades_of_grey') {
              return "<p>A map with various shades of grey. Great for a website with a really dark theme.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/38-shades-of-grey.png?v=20150319065307' />";
            } else if (element.attr('id') === 'pale_dawn') {
              return "<p>Use of subdued colours results in an excellent style for sites with a pastel colour scheme.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/1-pale-dawn.png?v=20150319065645' />";
            } else if (element.attr('id') === 'apple_aaps_esque') {
              return "<p>A theme that largely resembles the Apple Maps theme, albeit somewhat flatter.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/42-apple-maps-esque.png?v=20150319070040' />";
            } else if (element.attr('id') === 'midnight_commander') {
              return "<p>A dark use of water and 'Tron' like colours results in a very unique style.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/2-midnight-commander.png?v=20150319065929' />";
            } else if (element.attr('id') === 'blue_essence') {
              return "<p>A light blue style that helps you focus on content on the map. Great if you use lots of pins and want to have highlighted transportation systems.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/61-blue-essence.png?v=20150319065841' />";
            } else if (element.attr('id') === 'retro') {
              return "<p>A retro style map from Google that has a ton of detail. Looks great zoomed in on a city with lots of features.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/18-retro.png?v=20150319065809' />";
            } else if (element.attr('id') === 'paper') {
              return "<p>A light theme with an excellent contrast between water, parks, and land.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/39-paper.png?v=20150319070056' />";
            } else if (element.attr('id') === 'avacado') {
              return "<p>A creamy green color palette.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/35-avocado-world.png?v=20150319071514' />";
            } else if (element.attr('id') === 'unimposed') {
              return "<p>This style is a neutral yet detailed view of the world. Good for anonymous, natural views of the globe without indications of humans.</p> <img class='mapim' src='https://az594329.vo.msecnd.net/assets/16-unimposed-topography.png?v=20150319095652' />";
            }
          }
        });
      });
      $(document).tooltip({
        position: {
          my: "left+15 center",
          at: "right center"
        }
      })
      map = new google.maps.Map(d3.select('#map').node(), {
        zoom: 10,
        center: new google.maps.LatLng(25.7877, -80.2241),
        disableDefaultUI: true,
        mapTypeControlOptions: {
          mapTypeId: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
      });
      bounds2 = new google.maps.LatLngBounds(new google.maps.LatLng(25.748781939750618, -80.21240599060059), new google.maps.LatLng(25.77087930591169, -80.18184391784666));
      // Define a rectangle and set its editable property to true.
      rectangle = new google.maps.Rectangle({
        bounds: bounds2,
        draggable: true,
        editable: true
      });
      rectangle2 = new google.maps.Rectangle({
        bounds: bounds2,
        draggable: true,
        editable: true
      });
      // Add an event listener on the rectangle.
      google.maps.event.addListener(rectangle2, 'bounds_changed', showNewRect2);
      google.maps.event.addListener(rectangle, 'bounds_changed', showNewRect);
      map.mapTypes.set('map_style', $scope.styledMap);
      map.setMapTypeId('map_style');
      var input = d3.select('#pac-input').node()
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
      var searchBox = new google.maps.places.SearchBox((input));
      google.maps.event.addListener(searchBox, 'places_changed', function () {
        var places = searchBox.getPlaces();
        var bounds = new google.maps.LatLngBounds();
        if (places.length == 0) {
          return;
        }
        for (var i = 0, place; place = places[i]; i++) {
          bounds.extend(place.geometry.location);
          map.fitBounds(bounds);
        }
      });
      $scope.map.mapCenter = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      }
      google.maps.event.addListener(map, 'bounds_changed', function () {
        var bounds, northEast, southWest;
        bounds = this.getBounds();
        northEast = bounds.getNorthEast();
        southWest = bounds.getSouthWest();
        $timeout(function () {
          $scope.map.mapCenter = {
            lat: map.getCenter().lat(),
            lng: map.getCenter().lng()
          }
          $scope.map.zoom = map.getZoom();
        })
        if (lngDim != undefined && latDim != undefined) {
          lngDim.filterRange([southWest.lng(), northEast.lng()]);
          latDim.filterRange([southWest.lat(), northEast.lat()]);
        }
        searchBox.setBounds(bounds); // For search bias
      });
      // Show the new coordinates for the rectangle in an info window.
      /** @this {google.maps.Rectangle} */
      function showNewRect(event) {
        $timeout(function () {
          var ne = rectangle.getBounds().getNorthEast();
          var sw = rectangle.getBounds().getSouthWest();
          ne = {
            lat: ne.lat(),
            lng: ne.lng()
          };
          sw = {
            lat: sw.lat(),
            lng: sw.lng()
          };
          $scope.map.rect1 = {
            ne: ne,
            sw: sw
          };
          lngDim.filterRange([sw.lng, ne.lng]);
          latDim.filterRange([sw.lat, ne.lat]);
          var inner1 = lngDim.top(Infinity);
          y1 = [];
          rect1_mean = d3.mean(inner1, function (ob) {
            y1[y1.length] = Number(ob.main.data);
            return Number(ob.main.data);
          })
          rect1_var = d3.variance(y1);
          rect1_n = inner1.length
          if (rect1_n > 0) {
            (updateview1);
          }
          //Returning bounds
          var bounds, northEast, southWest;
          bounds = map.getBounds();
          northEast = bounds.getNorthEast();
          southWest = bounds.getSouthWest();
          lngDim.filterRange([southWest.lng(), northEast.lng()]);
          latDim.filterRange([southWest.lat(), northEast.lat()]);
          ttest();
        });
      }
      /** @this {google.maps.Rectangle} */
      function showNewRect2(event) {
        $timeout(function () {
          var ne = rectangle2.getBounds().getNorthEast();
          var sw = rectangle2.getBounds().getSouthWest();
          ne = {
            lat: ne.lat(),
            lng: ne.lng()
          };
          sw = {
            lat: sw.lat(),
            lng: sw.lng()
          };
          $scope.map.rect2 = {
            ne: ne,
            sw: sw
          };
          lngDim.filterRange([sw.lng, ne.lng]);
          latDim.filterRange([sw.lat, ne.lat]);
          var inner2 = lngDim.top(Infinity);
          y2 = [];
          rect2_mean = d3.mean(inner2, function (ob) {
            y2[y2.length] = Number(ob.main.data);
            return Number(ob.main.data);
          })
          rect2_var = d3.variance(y2);
          rect2_n = inner2.length;
          //Returning bounds
          var bounds, northEast, southWest;
          bounds = map.getBounds();
          northEast = bounds.getNorthEast();
          southWest = bounds.getSouthWest();
          lngDim.filterRange([southWest.lng(), northEast.lng()]);
          latDim.filterRange([southWest.lat(), northEast.lat()]);
          if (rect2_n > 0) {
            (updateview2);
          }
          ttest();
        });
      }
    }
    // - End Init
  var burn_timeout_id,
    plot_timeout_id,
    sample_timeout_id;
  // Running Bayes
  $timeout(function () {
    $scope.runbayes = function () {
      if (sharedataref && $scope.map.callfunc != 'runbayes') { // Makes sure that person sharing doesn't get bombared with function calls from from a past air
        registerFucntion('runbayes')
      } else {
        $scope.dataTab = true;
        var n_samples = 20000;
        var n_burnin = 20000;
        var posterior = make_BEST_posterior_func(y1, y2)
        var data_calc = function (params) {
          var mu_diff = params[0] - params[1];
          var sd_diff = params[2] - params[3];
          var effect_size = (params[0] - params[1]) / Math.sqrt((Math.pow(params[2], 2) + Math.pow(params[3], 2)) / 2);
          var normality = Math.log(params[4]) / Math.LN10;
          return [mu_diff, sd_diff, normality, effect_size];
        }
        var inits = [jStat.mean(y1), jStat.mean(y2), jStat.stdev(y1), jStat.stdev(y2), 5]
        var sampler = new amwg(inits, posterior, data_calc)
        var count = 0.0;

        function burn_asynch(n) {
          // $scope.max = (n_burnin/500.0 );
          $timeout(function () {
            $scope.percentDone = (count / (n_burnin / 500.0) * 100).toFixed(0)
          })
          $scope.bayesbutt = false;
          sampler.burn(500)
          count = count + 1;
          if (n > 0) {
            burn_timeout_id = setTimeout(function () {
              burn_asynch(n - 1)
            }, 0)
          } else {
            $scope.$apply(function () {
              $scope.showCharts = true;
            })
            console.log("\n-- Finished Burn in phase --\n")
            console.log("\n-- Started sampling phase --\n")
            sample_timeout_id = sampler.n_samples_asynch(n_samples, 50)
            $scope.$apply(function () {
              $scope.bayesbutt = true;
            })
            plot_asynch()
          }
        }

        function plot_asynch() {
          var plot_start_time = new Date()
          var chain = sampler.get_chain()
          var plot_data = chain_to_plot_data(chain, Math.ceil(n_samples / 1000))
          plot_mcmc_chain("group_diff_plot", plot_data[5], "samples");
          plot_mcmc_hist("group_diff_hist", param_chain(chain, 5), true, 0);
          var plot_time = (new Date()) - plot_start_time;
          if (sampler.is_running_asynch()) {
            plot_timeout_id = setTimeout(function () {
              plot_asynch()
            }, plot_time * 2);
          }
        }
        burn_asynch(Math.ceil(n_burnin / 500));
      }
    }
  })
  var ttest = function () {
    var p = jStat.ttest((rect1_mean - rect2_mean) / (Math.sqrt(((rect1_var / rect1_n) + (rect2_var / rect2_n)))), rect1_n + rect2_n, 2);
    if (!isNaN(p) && !(p === undefined)) {
      rectangle.setOptions({
        fillColor: rect_color(p)
      })
      rectangle2.setOptions({
        fillColor: rect_color(p)
      })
      $scope.$apply(function () {
        $scope.p_val = 'Two-Tailed P-value: ' + p.toFixed(5)
      })
    }
  }

  function ifdead(it, iftrue, iffalse) {
    if (2 > 0) {
      return iftrue;
    } else {
      return iffalse;
    }
  };
  $scope.$watch('map.colorScheme', function () {
    if (gPrints) {
      numScale = d3.scale.linear().domain([$scope.mindata, $scope.maxdata]).range($scope.map.colorScheme)
      gPrints.selectAll('circle').call(setCircle);
    }
  }, true)

  function setCircle(it) {
    return it.attr({
      'cx': function (it) {
        return it.coorx;
      },
      'cy': function (it) {
        return it.coory;
      },
      'r': function (it) {
        return String(6 + 'px')
      }
    }).style({
      'fill': function (it) {
        return numScale(it.main.data);
      },
      'position': 'absolute',
      'opacity': function (it) {
        return ifdead(it, .8, .8);
      }
    });
  };
  initCircle = function (it) {
    return it.style({
      'opacity': 0
    });
  };
  tranCircle = function (it) {
    return it.style({
      'opacity': function (it) {
        return ifdead(it, 1, 1);
      }
    });
  };

  function updateGraph() {
    var dt;
    $scope.mindata = scoreDim.top(scoreDim.length - 1);
    $scope.maxdata = scoreDim.top(0);
    dt = gPrints.selectAll('circle').data(scoreDim.top(Infinity));
    dt.enter().append('circle').call(setCircle);
    // dt.call(setCircle);
    var bounds = map.getBounds();
    var northEast = bounds.getNorthEast();
    var southWest = bounds.getSouthWest();
    dt.exit().remove();
  };
  overlay = new google.maps.OverlayView();
  overlay.onAdd = function () {
    layer = d3.select(this.getPanes().overlayLayer).append('div').attr('class', 'stationOverlay');
    var svg = layer.append('svg');
    gPrints = svg.append('g').attr({
      'class': 'class',
      'gPrints': 'gPrints'
    });
    svg.attr({
      'width': mapOffset * 2,
      'height': mapOffset * 2
    }).style({
      'position': 'absolute',
      'top': -1 * mapOffset + 'px',
      'left': -1 * mapOffset + 'px'
    });
    return overlay.draw = function () {
      // making internal data so overlay doesn't redraw everything
      var _data = null;
      // filtering out bounds 
      var overlaybounds = map.getBounds();
      overlaynorthEast = overlaybounds.getNorthEast();
      overlaysouthWest = overlaybounds.getSouthWest();
      lngDim.filterAll();
      latDim.filterAll();
      _data = scoreDim.top(Infinity); //randomCrash();
      var googleMapProjection, dt;
      projection = this.getProjection();
      googleMapProjection = function (coordinates) {
        var googleCoordinates, pixelCoordinates;
        googleCoordinates = new google.maps.LatLng(coordinates[0], coordinates[1]);
        pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
        return [pixelCoordinates.x + mapOffset, pixelCoordinates.y + mapOffset];
      };
      _data.filter(function (it) {
        var coor;
        coor = googleMapProjection([it.main.lat, it.main.lng]);
        it.coorx = coor[0];
        it.coory = coor[1];
        return true;
      });
      dt = gPrints.selectAll('circle').data(_data);
      dt.enter().append('circle'); //.call(setCircle)
      dt.call(setCircle);
      //  returning the bounds 
      var bounds = map.getBounds();
      var northEast = bounds.getNorthEast();
      var southWest = bounds.getSouthWest();
      lngDim.filterRange([southWest.lng(), northEast.lng()]);
      latDim.filterRange([southWest.lat(), northEast.lat()]);
      return dt.exit().remove();
    };
  };
  var removerect1 = function () {
    rectangle.setMap(null);
  }
  var addrect1 = function () {
    bounds2 = new google.maps.LatLngBounds(
      (overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(684, 412.9999999998836))), (overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(747, 345.9999999999418))));
    rectangle.setOptions({
      bounds: bounds2
    })
    rectangle.setMap(map);
  }
  var removerect2 = function () {
    rectangle2.setMap(null);
  }
  var addrect2 = function () {
    bounds2 = new google.maps.LatLngBounds(
      (overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(684, 412.9999999998836))), (overlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(747, 345.9999999999418))));
    rectangle2.setOptions({
      bounds: bounds2
    })
    rectangle2.setMap(map);
  }
  $scope.addRect = function (num) {
    function worker() {
      if (typeof $scope.tweetList !== "undefined") {
        if (num == 1) {
          if ($scope.rectOffMess1 != "Remove") {
            addrect1();
            $scope.rectOffMess1 = "Remove";
          } else {
            $scope.rectOffMess1 = "Click to Start Data Analysis";
            removerect1();
          }
        } else {
          if ($scope.rectOffMess2 != "Remove") {
            addrect2();
            $scope.rectOffMess2 = "Remove";
          } else {
            $scope.rectOffMess2 = "Click to Start Data Analysis";
            removerect2();
          }
        }
      } else {
        alert('You need to add data to before you can start analysis!')
      }
    }
    var myname = 'addRect,' + num;
    if (sharedataref && $scope.map.callfunc != myname) { // Makes sure that person sharing doesn't get bombared with function calls from from a past air
      registerFucntion(myname);
    } else {
      worker();
    }
  };
  var mycall;
  kandydemo = function () {
    /** setup(config) intializes KandyAPI
            @param <object> config
          */
    KandyAPI.Phone.setup({
      // remoteVideoContainer: angular.element(document.querySelector('#video-container'))[0],
      // localVideoContainer: $('#incoming-video'),
      // remoteVideoContainer:  $('#video-container')[0],
      // listeners registers events to handlers
      // You can handle all Kandy Events by registering them here
      listeners: {
        loginsuccess: onLoginSuccess,
        loginfailed: onLoginFailed,
        callinitiated: onCallInitiate,
        callinitiatefailed: onCallInitiateFail,
        oncall: onCall,
        callended: onCallTerminate,
        callincoming: onCallIncoming,
        callanswered: onCallAnswer,
        presencenotification: function (username, state, description, activity) {}
      }
    });
    // Event handler for oncall event
    function onCall(call) {
      $audioRingOut[0].pause();
      $scope.videos = true;
      mycall = call.localStreamURL;
      var brokenEmail = $scope.user.email.split('@')
      console.log(brokenEmail[0])
      $scope.$apply(function () {
        $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        }
        console.log($scope.map[$scope.kandyapi.calluser])
        $scope.src = call.localStreamURL
        mycall = call.localStreamURL
      })
      $timeout(function () {
        $scope.map[brokenEmail[0]] = call.localStreamURL
        $scope.callId = call.getId();
      })
      $scope.src = call.localStreamURL
    }
    // Event handler for initiate call button
    $scope.makecall = function () {
      if ($scope.currentlySharing) {
        if ($scope.kandyapi.calluser.indexOf('@') != -1 && $scope.kandyapi.calluser.indexOf('.') != -1) {
          alert('Enter a valid User Name. Not an email.')
        } else {
          $scope.showCall = false;
          var username = $scope.kandyapi.calluser + '@ceseale3.gmail.com'
            /** makeCall( userName, cameraOn ) : Void
                Initiates a call to another Kandy user over web
                @params <string> userName, <boolean> cameraOn
            */
          KandyAPI.Phone.makeCall(username, true);
          $scope.videos = true;
        }
      } else {
        alert('You have to be sharing a map before making a phone call. Enter the email. Share your map below.')
      }
    };
    // Create audio objects to play incoming calls and outgoing calls sound
    var $audioRingIn = $('<audio>', {
      loop: 'loop',
      id: 'ring-in'
    });
    var $audioRingOut = $('<audio>', {
      loop: 'loop',
      id: 'ring-out'
    });
    // Load audio source to DOM to indicate call events
    var audioSource = {
      ringIn: [{
        src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3',
        type: 'audio/mp3'
      }, {
        src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg',
        type: 'audio/ogg'
      }],
      ringOut: [{
        src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3',
        type: 'audio/mp3'
      }, {
        src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg',
        type: 'audio/ogg'
      }]
    };
    audioSource.ringIn.forEach(function (entry) {
      var $source = $('<source>').attr('src', entry.src);
      $audioRingIn.append($source);
    });
    audioSource.ringOut.forEach(function (entry) {
      var $source = $('<source>').attr('src', entry.src);
      $audioRingOut.append($source);
    });
    // Event handler for loginsuccess event
    function onLoginSuccess() {
      /** updatePresence(val) - updates the users presence
          eg. 0: Connected, 1: Unavailable, 2: Away, etc.
          @param <integer> val
      */
      KandyAPI.Phone.updatePresence(0);
    }
    // Event handler for loginfailure event
    function onLoginFailed() {
      alert('Login Failed');
    }
    // Event handler for callinitiated event
    function onCallInitiate(call) {
      //= call.localStreamURL ; 
      $scope.callId = call.getId();
      var brokenEmail = $scope.user.email.split('@')
      $scope.map[brokenEmail[0]] = call.localStreamURL
      $audioRingOut[0].play();
      $scope.showEndCall = true;
      $scope.showCallAE = false;
      // $('button').attr('data-call-id',  $scope.callId );
    }
    // Event handler for callinitiatefailed event
    function onCallInitiateFail() {
      $audioRingOut[0].pause();
      alert('Call initiate Failed.');
    }
    // Event handler for callended event
    function onCallTerminate(call) {
      $audioRingOut[0].pause();
      $scope.endCall();
    }
    // Event handler for end call button
    $scope.endCall = function () {
      KandyAPI.Phone.endCall($scope.callId);
      $scope.showEndCall = false;
      $scope.showCallAE = false;
      $scope.videos = false;
      $scope.showCall = true;
    };
    var username;
    // Event handler for login form button
    // Event handler for callincoming event
    function onCallIncoming(call, isAnonymous) {
      alert('You have an incoming call! Click the "Collaborate" tab to answer')
      $audioRingIn[0].play();
      $scope.callId = call.getId();
      $scope.callob = call;
      $scope.$apply(function () {
        $scope.showCallAE = true;
        $scope.callId = call.getId();
      })
      if (!isAnonymous) {
        $scope.calling = (call.callerName + ' Calling!');
      } else {
        $scope.calling = ('Anonymous Calling');
      }
    }
    // Event handler for oncallanswered event
    function onCallAnswer(call) {
      $scope.callId = call.getId();
      $scope.showCall = $scope.showCallAE = false;
      $scope.showCall = false;
      var brokenEmail = $scope.user.email.split('@')
      $scope.map[brokenEmail[0]] = call.localStreamURL
      $audioRingOut[0].pause();
      $audioRingIn[0].pause();
      KandyAPI.Phone.startCallVideo($scope.callId, function () {
        $scope.$apply(function () {
          $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
          }
          console.log($scope.map[$scope.kandyapi.calluser])
          $scope.src = call.localStreamURL
          mycall = call.localStreamURL
        })
      }, function () {})
    }
    $scope.answerCall = function () {
      $audioRingOut[0].pause();
      $audioRingIn[0].pause();
      $scope.showCallAE = false;
      $scope.showCall = $scope.showCallAE = false;
      KandyAPI.Phone.answerCall($scope.callId, true);
    };
    // Event handler for call reject button
    $scope.rejectCall = function () {
      $audioRingOut[0].pause();
      $audioRingIn[0].pause();
      $scope.showCallAE = false;
      KandyAPI.Phone.rejectCall($scope.callId);
    };
    (function () {
      if ($scope.user.email == 'user1@aired.io') {
        username = 'user1';
        var apiKey = 'DAK3e8ebe179640472ebe2dffd268a53a12'
        var password = 'kandydemo00'
        KandyAPI.Phone.login(apiKey, username, password);
      } else {
        username = 'user2';
        var apiKey = 'DAK3e8ebe179640472ebe2dffd268a53a12'
        var password = 'kandydemo00'
        KandyAPI.Phone.login(apiKey, username, password);
      }
    })();
  }
  var pastfunc;
  $(document).ready(function () {
    initMap();
    $scope.$watch('map', function () {
      if (sharedataref) {
        if (pastfunc != $scope.map.callfunc) {
          pastfunc = $scope.map.callfunc
          if ($scope.map.callfunc.indexOf(',') != -1) {
            var callers = $scope.map.callfunc.split(',');
            $scope[callers[0]](callers[1]);
          } else {
            $scope[$scope.map.callfunc]();
          }
        }
        map.setZoom($scope.map.zoom);
        map.setCenter(new google.maps.LatLng($scope.map.mapCenter.lat, $scope.map.mapCenter.lng))
        if ($scope.map.rect1) {
          if (rectangle.getMap()) {
            rectangle.setBounds(new google.maps.LatLngBounds(new google.maps.LatLng($scope.map.rect1.sw.lat, $scope.map.rect1.sw.lng), new google.maps.LatLng($scope.map.rect1.ne.lat, $scope.map.rect1.ne.lng)))
          } else {
            rectangle.setOptions({
              bounds: new google.maps.LatLngBounds(new google.maps.LatLng($scope.map.rect1.sw.lat, $scope.map.rect1.sw.lng), new google.maps.LatLng($scope.map.rect1.ne.lat, $scope.map.rect1.ne.lng))
            })
            rectangle.setMap(map);
          }
        } else {
          removerect1()
        }
        if ($scope.map.rect2) {
          if (rectangle2.getMap()) {
            rectangle2.setBounds(new google.maps.LatLngBounds(new google.maps.LatLng($scope.map.rect2.sw.lat, $scope.map.rect2.sw.lng), new google.maps.LatLng($scope.map.rect2.ne.lat, $scope.map.rect2.ne.lng)))
          } else {
            rectangle2.setOptions({
              bounds: new google.maps.LatLngBounds(new google.maps.LatLng($scope.map.rect2.sw.lat, $scope.map.rect2.sw.lng), new google.maps.LatLng($scope.map.rect2.ne.lat, $scope.map.rect2.ne.lng))
            })
            rectangle2.setMap(map);
          }
        } else {
          removerect2()
        }
        console.log($scope.src)
        $scope.src = mycall;
      }
    }, true)
  });
});
