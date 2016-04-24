'use strict';

var myMapArea;

(function() {
  function initMap(element, shape) {
    var mapProp, map, mapMarkers, coordinates, thisShape, thisArea;

    mapProp = {
      center:new google.maps.LatLng(51.508742,-0.120850),
      zoom:5,
      mapTypeId:google.maps.MapTypeId.HYBRID
    };
    map=new google.maps.Map(document.getElementById(element),mapProp);

    mapMarkers = [];
    coordinates = [];


    if (shape) {
      thisShape = google.maps.geometry.encoding.decodePath(shape);
      thisArea=new google.maps.Polygon({
        path: thisShape,
        map: map,
        editable: true,
        draggable: true,
        strokeColor:"#0000FF",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor:"#0000FF",
        fillOpacity:0.4
      });
    }

    map.addListener('rightclick', function(event) {
      var position, marker;

      if (myMapArea) {
        myMapArea.setMap(null);
      }

      position = event.latLng;
      marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        title: 'Marker'
      });

      mapMarkers.push(marker);
      coordinates.push(position);

      marker.addListener('rightclick', function(event) {
        var oldPosition, i;

        oldPosition = this.position;
        this.setMap(null);

        for(i = 0; i < mapMarkers.length; i++) {
          if (oldPosition === coordinates[i]) {
            coordinates.splice(i, 1);
            mapMarkers.splice(i, 1);
            break;
          }
        }
      });

      marker.addListener('dblclick', function(event) {
        var thisMap, i;

        thisMap = this.map;

        myMapArea=new google.maps.Polygon({
          path: coordinates,
          map: thisMap,
          editable: true,
          draggable: true,
          strokeColor:"#0000FF",
          strokeOpacity:0.8,
          strokeWeight:2,
          fillColor:"#0000FF",
          fillOpacity:0.4
        });

        for (i = 0; i < mapMarkers.length; i++) {
          mapMarkers[i].setMap(null);
        }
        coordinates = [];
        mapMarkers = [];

        myMapArea.getPaths().forEach(function(path, index) {
          // google.maps.event.addListener(path, 'set_at', function(){
          //   console.log('moved');
          // });
          google.maps.event.addListener(path, 'insert_at', function(){
            sessionStorage.paths = myMapArea.getPaths();
          });
        });

        google.maps.event.addListener(myMapArea, 'dragend', function(){
          console.log(myMapArea.getPaths());
          sessionStorage.setItem('paths', JSON.stringify(myMapArea.getPaths()));
        });

        myMapArea.addListener('rightclick', function(event) {
          this.setMap(null);
        });
      });
    });
  }

  google.maps.event.addDomListener(window, 'load', initMap('googleMap'));


  $('form').submit(function(event) {
    var name, path;

    event.preventDefault();

    if (!myMapArea) {
      alert('Please select an area of the map where your language is spoken.');

    } else {
      name = $('#name-input').val();
      path = myMapArea.getPath();
      path = google.maps.geometry.encoding.encodePath(path);

      $.post({
        type: 'POST',
        url: '/admin/languages',
        data: {
          name: name,
          path: path
        },
        success: function(res) {
          console.log(res);
        },
        error: function(res) {
          console.log(res);
        }
      });
    }
  });
})();