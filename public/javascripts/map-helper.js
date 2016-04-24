(function() {
  function initMap() {
    var mapProp, map, mapMarkers, coordinates, area;

    mapProp = {
      center:new google.maps.LatLng(51.508742,-0.120850),
      zoom:5,
      mapTypeId:google.maps.MapTypeId.HYBRID
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

    mapMarkers = [];
    coordinates = [];

    map.addListener('rightclick', function(event) {
      var position, marker;

      if (area) {
        area.setMap(null);
      }

      position = event.latLng
      marker = new google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        title: 'Marker'
      });

      mapMarkers.push(marker);
      coordinates.push(position)

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
        var thisMap, area, i;

        thisMap = this.map;
        area=new google.maps.Polygon({
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

        area.getPaths().forEach(function(path, index) {
          // google.maps.event.addListener(path, 'set_at', function(){
          //   console.log('moved');
          // });
          google.maps.event.addListener(path, 'insert_at', function(){
            sessionStorage.paths = area.getPaths();
          });
        });

        google.maps.event.addListener(area, 'dragend', function(){
          console.log(area.getPaths());
          sessionStorage.setItem('paths', JSON.stringify(area.getPaths());
        });

        area.addListener('rightclick', function(event) {
          this.setMap(null);
        });
      });
    });
  }

  google.maps.event.addDomListener(window, 'load', initMap);
})()

$(function($) {
  $('form').submit(function(event) {
    var name, paths;

    name = $('#name-input').value();
    paths = sessionStorage.getItem(paths);
    event.preventDefault()

    console.log(paths);

    $.post({
      type: 'POST',
      url: '/admin/languages',
      data: {
        name: name,
        paths: paths
      },
      success: function(res) {
        console.log(res);
      },
      error: function(res) {
        console.log(res);
      }
  });
})(jQuery)