/*! 
 * Roots v 2.0.0
 * Follow me @adanarchila at Codecanyon.net
 * URL: http://codecanyon.net/item/roots-phonegapcordova-multipurpose-hybrid-app/9525999
 * Don't forget to rate Roots if you like it! :)
 */

// In this file we are goint to include all the Controllers our app it's going to need
(function(){
  'use strict';

  function initPushwoosh() {
    var pushNotification = window.plugins.pushNotification;
 
    //set push notification callback before we initialize the plugin
    document.addEventListener('push-notification', function(event) {
      var title = event.notification.title;
      var userData = event.notification.userdata;
                               
      if(typeof(userData) != "undefined") {
          console.warn('user data: ' + JSON.stringify(userData));
      }
                                   
      alert(title);
    });
  
    //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NUMBER", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
    // Insert your Google Project ID and your PushWoosh App ID
    pushNotification.onDeviceReady({ projectid: "996570827654", appid : "067BE-41680" });
     
    //register for pushes
    pushNotification.registerDevice(
        function(status) {
            var pushToken = status;
            console.warn('push token: ' + pushToken);
        },
        function(status) {
            console.warn(JSON.stringify(['failed to register ', status]));
        }
    );

  }  

  var app = angular.module('app', ['onsen']);

  app.controller('pushController', function($scope){
    
    ons.ready(function(){
      initPushwoosh();
    });
    
  });

})();


/*
  console.log("hello");
  $(document).ready(function()
{
  if ($("#list").length > 0){
      console.log("hello");
$.getJSON("js/schema.js",function(schema)
{ 

$.each(data.players, function(i,schema)
{
var div_data =
"<ons-list-item class='list-item-containter "+data.going+"''>"+data.name+"</ons-list-item>";
$(div_data).appendTo("#list");
});
}
);
}
});*/



(function(){
  'use strict';
 
  var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngMap', 'angular-carousel']);

  // Filter to convert HTML content to string by removing all HTML tags
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
      }
    }
  );

  app.directive('datePicker', function () {
      return {
          link: function postLink(scope, element, attrs) {
              scope.$watch(attrs.datePicker, function () {
                  if (attrs.datePicker === 'start') {
                      //element.pickadate();
                  }
              });
          }
      };
  });  

  app.controller('networkController', function($scope){

    // Check if is Offline
    document.addEventListener("offline", function(){

      offlineMessage.show();

      /* 
       * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
       * If you want to block the use of the app till the user gets internet again, please delete this line.       
       */

      setTimeout('offlineMessage.hide()', 8000);  

    }, false);

    document.addEventListener("online", function(){
      // If you remove the "setTimeout('offlineMessage.hide()', 8000);" you must remove the comment for the line above      
      // offlineMessage.hide();
    });

  });

  // This functions will help us save the JSON in the localStorage to read the website content offline

  Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
  }

  Storage.prototype.getObject = function(key) {
      var value = this.getItem(key);
      return value && JSON.parse(value);
  }

  // This directive will allow us to cache all the images that have the img-cache attribute in the <img> tag
  app.directive('imgCache', ['$document', function ($document) {
    return {
      link: function (scope, ele, attrs) {
        var target = $(ele);

        scope.$on('ImgCacheReady', function () {

          ImgCache.isCached(attrs.src, function(path, success){
            if(success){
              ImgCache.useCachedFile(target);
            } else {
              ImgCache.cacheFile(attrs.src, function(){
                ImgCache.useCachedFile(target);
              });
            }
          });
        }, false);

      }
    };
  }]);    



  // News Controller / Show Latest Posts
  // This controller gets all the posts from our WordPress site and inserts them into a variable called $scope.items
  app.controller('newsController', [ '$http', '$scope', '$rootScope', function($http, $scope, $rootScope){

    $scope.yourAPI = 'http://dev.studio31.co/api/get_recent_posts';
    $scope.items = [];
    $scope.totalPages = 0;
    $scope.currentPage = 1;
    $scope.pageNumber = 1;
    $scope.isFetching = true;
    $scope.lastSavedPage = 0;

    // Let's initiate this on the first Controller that will be executed.
    ons.ready(function() {
      
      // Cache Images Setup
      // Set the debug to false before deploying your app
      ImgCache.options.debug = true;

      ImgCache.init(function(){

        //console.log('ImgCache init: success!');
        $rootScope.$broadcast('ImgCacheReady');
        // from within this function you're now able to call other ImgCache methods
        // or you can wait for the ImgCacheReady event

      }, function(){
        //console.log('ImgCache init: error! Check the log for errors');
      });

    });


    $scope.pullContent = function(){
      
      $http.jsonp($scope.yourAPI+'/?page='+$scope.pageNumber+'&callback=JSON_CALLBACK').success(function(response) {

        if($scope.pageNumber > response.pages){

          // hide the more news button
          $('#moreButton').fadeOut('fast');  

        } else {

          $scope.items = $scope.items.concat(response.posts);
          window.localStorage.setObject('rootsPosts', $scope.items); // we save the posts in localStorage
          window.localStorage.setItem('rootsDate', new Date());
          window.localStorage.setItem("rootsLastPage", $scope.currentPage);
          window.localStorage.setItem("rootsTotalPages", response.pages);

          // For dev purposes you can remove the comment for the line below to check on the console the size of your JSON in local Storage
          // for(var x in localStorage)console.log(x+"="+((localStorage[x].length * 2)/1024/1024).toFixed(2)+" MB");

          $scope.totalPages = response.pages;
          $scope.isFetching = false;

          if($scope.pageNumber == response.pages){

            // hide the more news button
            $('#moreButton').fadeOut('fast'); 

          }

        }

      });

    }

    $scope.getAllRecords = function(pageNumber){

      $scope.isFetching = true;    

      if (window.localStorage.getItem("rootsLastPage") == null ) {

        $scope.pullContent();

      } else {
        
        var now = new Date();
        var saved = new Date(window.localStorage.getItem("rootsDate"));

        var difference = Math.abs( now.getTime() - saved.getTime() ) / 3600000;

        // Lets compare the current dateTime with the one we saved when we got the posts.
        // If the difference between the dates is more than 24 hours I think is time to get fresh content
        // You can change the 24 to something shorter or longer

        if(difference > 24){
          // Let's reset everything and get new content from the site.
          $scope.currentPage = 1;
          $scope.pageNumber = 1;
          $scope.lastSavedPage = 0;
          window.localStorage.removeItem("rootsLastPage");
          window.localStorage.removeItem("rootsPosts");
          window.localStorage.removeItem("rootsTotalPages");
          window.localStorage.removeItem("rootsDate");

          $scope.pullContent();
        
        } else {
          
          $scope.lastSavedPage = window.localStorage.getItem("rootsLastPage");

          // If the page we want is greater than the last saved page, we need to pull content from the web
          if($scope.currentPage > $scope.lastSavedPage){

            $scope.pullContent();
          
          // else if the page we want is lower than the last saved page, we have it on local Storage, so just show it.
          } else {

            $scope.items = window.localStorage.getObject('rootsPosts');
            $scope.currentPage = $scope.lastSavedPage;
            $scope.totalPages = window.localStorage.getItem("rootsTotalPages");
            $scope.isFetching = false;

          }

        }

      }

    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };

    $scope.showPost = function(index){
        
      $rootScope.postContent = $scope.items[index];
      $scope.ons.navigator.pushPage('post.html');

    };

    $scope.nextPage = function(){

      $scope.currentPage++; 
      $scope.pageNumber = $scope.currentPage;                 
      $scope.getAllRecords($scope.pageNumber);        

    }

  }]);

  // This controller let us print the Post Content in the post.html template
  app.controller('postController', [ '$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce){
    
    $scope.item = $rootScope.postContent;

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.imgLoadedEvents = {
        done: function(instance) {
            angular.element(instance.elements[0]).removeClass('is-loading').addClass('is-loaded');
        }
    };    

  }]);


  // Map Markers Controller

  app.controller('markersController', function($scope, $compile){
    
    $scope.infoWindow = {
      title: 'title',
      content: 'content'
    };

    $scope.markers = [
      {
        'title' : 'Eindhoven Raptors',
        'content' : '',
        'location'  : [51.410321, 5.491576]
      }
      ];

      $scope.showMarker = function(event){

        $scope.marker = $scope.markers[this.id];
          $scope.infoWindow = {
          title: $scope.marker.title,
          content: $scope.marker.content
        };
        $scope.$apply();
        $scope.showInfoWindow(event, 'marker-info', this.getPosition());

      }

  });

  app.controller('bookingController', function($scope, $compile, $filter){

    $scope.bookdate = 'Pick Reservation Date';
    $scope.booktime = 'Pick Reservation Time';

    $scope.chooseDate = function(){
      
      var options = {
        date: new Date(),
        mode: 'date'
      };

      datePicker.show(options, function(date){
        
        var day   = date.getDate();
          var month   = date.getMonth() + 1;
          var year  = date.getFullYear();

          $scope.$apply(function(){
            $scope.bookdate = $filter('date')(date, 'MMMM d, yyyy');      
          });

      });

    }

    $scope.chooseTime = function(){
      
      var options = {
        date: new Date(),
        mode: 'time'
      };

      datePicker.show(options, function(time){
          $scope.$apply(function(){
            $scope.booktime = $filter('date')(time, 'hh:mm a');
          });
      });

    }

  });

  // Plugins Controller

  app.controller('pluginsController', function($scope, $compile){

    $scope.openWebsite = function(){
      var ref = window.open('http://google.com', '_blank', 'location=yes');
    }

    $scope.openSocialSharing = function(){
      
      window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com');

      /*
       *  Social Sharing Examples
       *  For more examples check the documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
   
        window.plugins.socialsharing.share('Message only')
        window.plugins.socialsharing.share('Message and subject', 'The subject')
        window.plugins.socialsharing.share(null, null, null, 'http://www.google.com')
        window.plugins.socialsharing.share('Message and link', null, null, 'http://www.google.com')
        window.plugins.socialsharing.share(null, null, 'https://www.google.com/images/srpr/logo4w.png', null)
        window.plugins.socialsharing.share('Message and image', null, 'https://www.google.com/images/srpr/logo4w.png', null)
        window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
        window.plugins.socialsharing.share('Message, subject, image and link', 'The subject', 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
      *
      */

    }


    $scope.openEmailClient = function(){

      ons.ready(function(){

        cordova.plugins.email.open({
          to:      'han@solo.com',
          subject: 'Hey!',
          body:    'May the <strong>force</strong> be with you',
          isHtml:  true
        });

      });
      
    }

    $scope.getDirectionsApple = function(){
      
      window.location.href = "maps://maps.apple.com/?q=37.774929,-122.419416";

    }

    $scope.getDirectionsGoogle = function(){

      var ref = window.open('http://maps.google.com/maps?q=37.774929,-122.419416', '_system', 'location=yes');

    }

    $scope.getDate = function(){
      
      var options = {
        date: new Date(),
        mode: 'date'
      };

      datePicker.show(options, function(date){
        alert("date result " + date);  
      });

    }

  });

var app = angular.module('app', ['onsen',  'ngMap']);
// Map Markers Controller
var map;
app.controller('branchesController', function($http, $scope, $compile, $sce){
    
    $scope.getAll = true;
    $scope.locationsType = 'map';
    $scope.centerMap = [40.7112, -74.213]; // Start Position
    $scope.API = 'http://dev.studio31.co/api/get_posts/?post_type=banks&posts_per_page=-1';
    $scope.isFetching = true;
    $scope.locations = [];
    $scope.userLat = 0;
    $scope.userLng = 0;
    $scope.closestLocations = [];
    $scope.minDistance = 2000; // Km
    $scope.markers = [];
    $scope.infoWindow = {
        id: '',
        title: 'bob',
        content: '',
        address: '',
        phone: '',
        distance: ''
    };
    // true is to show ALL locations, false to show ONLY closests locations
    $scope.start = function(value, locationType){
        $scope.getAll = value;
        $scope.locationsType = locationType;
        
        if(locationType=='list'){
            $scope.init();
        }
    }
    $scope.$on('mapInitialized', function(event, evtMap) {
        map = evtMap;
        $scope.init();
    });
    $scope.init = function(){                
        navigator.geolocation.getCurrentPosition(function(position){
            $scope.drawMyLocation( position.coords.latitude, position.coords.longitude );
            $scope.userLat = position.coords.latitude;
            $scope.userLng = position.coords.longitude;
        }, function(error){
            console.log("Couldn't get the location of the user.");
            console.log(error);
        }, {
            maximumAge:60000,
            timeout:10000,
            enableHighAccuracy: true
        });
    }
    $scope.drawMyLocation = function( lat, lng){
        
        $scope.getAllRecords();
        if($scope.locationsType=='map'){
            var pinLayer;
            var swBound = new google.maps.LatLng(lat, lng);
            var neBound = new google.maps.LatLng(lat, lng);
            var bounds = new google.maps.LatLngBounds(swBound, neBound);  
             
            pinLayer = new PinLayer(bounds, map);
        }
        $scope.centerMap = [ lat, lng ];
    }
    $scope.getAllRecords = function(pageNumber){
        $scope.isFetching = true;
        $http.jsonp($scope.API+'&callback=JSON_CALLBACK').success(function(response) {
            $scope.locations = response.posts;
            $scope.isFetching = false;
            if($scope.getAll==true){
                // Get all locations
                $scope.allLocations();
            } else{
                // Get closest locations
                $scope.closestLocation();
            }
            
        });
     
    }
    $scope.allLocations = function(){
        
        $.each($scope.locations, function( index, value ) {
            var distance = Haversine( $scope.locations[ index ].custom_fields.location[0].lat, $scope.locations[ index ].custom_fields.location[0].lng, $scope.userLat, $scope.userLng );
            $scope.markers.push({
    
                 'id'        : index,
                'title'     : 'bob',
                'content'     : $scope.locations[ index ].custom_fields.description[0],
                'address'    : $scope.locations[ index ].custom_fields.address[0],
                'hours'        : $scope.locations[ index ].custom_fields.hours[0],
                'phone'        : $scope.locations[ index ].custom_fields.phone[0],
                'distance'    : (Math.round(distance * 100) / 100),
                'location'    : [$scope.locations[ index ].custom_fields.location[0].lat, $scope.locations[ index ].custom_fields.location[0].lng]
            });
        });
    }
    $scope.closestLocation = function(){        
        for(var i = 0; i < $scope.locations.length; i++){
            // Get lat and lon from each item
            var locationLat = $scope.locations[ i ].custom_fields.location[0].lat;
            var locationLng = $scope.locations[ i ].custom_fields.location[0].lng;
            // get the distance between user's location and this point
            var dist = Haversine( locationLat, locationLng, $scope.userLat, $scope.userLng );
            if ( dist < $scope.minDistance ){
                $scope.closestLocations.push(i);
            }
        }
        $.each($scope.closestLocations, function( index, value ) {
            var distance = Haversine( $scope.locations[ value ].custom_fields.location[0].lat, $scope.locations[ value ].custom_fields.location[0].lng, $scope.userLat, $scope.userLng );
            $scope.markers.push({

                'id'        : index,
                'title'     : $scope.locations[ value ].title,
                'content'     : $scope.locations[ value ].custom_fields.description[0],
                'address'    : $scope.locations[ value ].custom_fields.address[0],
                'hours'        : $scope.locations[ value ].custom_fields.hours[0],
                'phone'        : $scope.locations[ value ].custom_fields.phone[0],
                'distance'    : (Math.round(distance * 100) / 100),
                'location'    : ['51.458151','5.491873']
            });
        });
    }
    $scope.showMarker = function(event){
        $scope.marker = $scope.markers[this.id];
        $scope.infoWindow = {
            id        : $scope.marker.id,
            title     : 'bob',
            content    : 'training 28-8-2015',
            address    : 'Ajaxstraat 5 5631BR',
            hours    : $scope.marker.hours,
            phone    : '0623242242',
            distance: '4'
        };
        $scope.$apply();
        $scope.showInfoWindow(event, 'marker-info', this.getPosition());
    }
    $scope.renderHtml = function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
    // Get Directions
    $(document).on('click', '.get-directions', function(e){
        e.preventDefault();
        var marker = $scope.markers[$(this).attr('data-marker')];
        // Apple
        window.location.href = 'maps://maps.apple.com/?q='+marker.location[0]+','+marker.location[1];
        
        // Google Maps (Android)
        var ref = window.open('http://maps.google.com/maps?q='+marker.location[0]+','+marker.location[1], '_system', 'location=yes');
    });
        
    // Call
    $(document).on('click', '.call-phone', function(e){
        e.preventDefault();
        var phone = $(this).attr('data-phone');
        phone = phone.replace(/\D+/g, "");
        window.open('tel:'+phone, '_system')
    });
});
// Math Functions
function Deg2Rad( deg ) {
   return deg * Math.PI / 180;
}
// Get Distance between two lat/lng points using the Haversine function
// First published by Roger Sinnott in Sky & Telescope magazine in 1984 ("Virtues of the Haversine")
function Haversine( lat1, lon1, lat2, lon2 ){
    var R = 6372.8; // Earth Radius in Kilometers
    var dLat = Deg2Rad(lat2-lat1);  
    var dLon = Deg2Rad(lon2-lon1);  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                    Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);  
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; 
    // Return Distance in Kilometers
    return d;
}
// Pulse Marker Icon
function PinLayer(bounds, map) {
    this.bounds = bounds;
    this.setMap(null);
    this.setMap(map);
}
PinLayer.prototype = new google.maps.OverlayView();
PinLayer.prototype.onAdd = function() {
    // Container
    var container = document.createElement('DIV');
    container.className = "pulse-marker";
    // Pin
    var marker = document.createElement('DIV');
    marker.className = "pin";
    // Pulse
    var pulse = document.createElement('DIV');
    pulse.className = 'pulse';
    container.appendChild(marker);
    container.appendChild(pulse);
    this.getPanes().overlayLayer.appendChild(container);
    container.appendChild(document.createElement("DIV"));
    this.div = container;
}
PinLayer.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());
    var div = this.div;
    div.style.left = sw.x - 8 + 'px';
    div.style.top = ne.y - 15 + 'px';
}

})();


var app1 = angular.module('test123',[])

.controller("controller12", function($scope, $http) {
  $scope.data = {}
   $http.get("js/schema.json").success(function(result, status) {
            if (status != 200) {
                alert("Error");
            } else {
                $scope.data.players = result.players
            }
    })
  })

/*
.directive('menu', function($timeout) {
  return {
        restrict: "A",
        scope: true,
        link: function($scope, element, attrs) {
          element.bind("release", function(evt) {
                  $timeout(function() {
                     $scope.ons.menu.setSwipeable(true);
                  });
          });
          element.bind("touch", function(evt) {
              $scope.ons.menu.setSwipeable(false);
          }); 
        }
      };
});
*/