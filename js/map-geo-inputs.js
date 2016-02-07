/**
 * Created by jcorry on 2/6/16.
 */
(function ( $ ) {

    // 'class' variables
    var map = null;
    var drawMgr = null;
    var area = null;
    var infowindow = new google.maps.InfoWindow();

    var lat = null;
    var lng = null;
    var delta = null;

    var defaultLat = 33.755;
    var defaultLng = -84.390;
    var defaultDelta = .02;

    var latInput = null;
    var lngInput = null;
    var deltaInput = null;


    $.fn.mapinput = function() {

        this.on('focus', function(e){
            init($(e.currentTarget));
            addModalToBody();
            addMapToModal();
            $('#mapinput-map-modal').modal('show');
        });

        return this;
    };

    function init(e) {

        if(e.attr('name') == "latitude") {
            latInput = e;
        } else {
            latInput = e.closest('input[name="latitiude"]');
        }
        if(e.attr('name') == "longitude") {
            lngInput = e;
        } else {
            lngInput = e.closest('input[name="longitude"]');
        }
        if(e.attr('name') == "delta") {
            deltaInput = e;
        } else {
            deltaInput = e.closest('input[name="delta"]');
        }

        lat = latInput.val() ? parseFloat(latInput.val()).toFixed(6) : defaultLat;
        lng = lngInput.val() ? parseFloat(lngInput.val()).toFixed(6) : defaultLng;
        delta = deltaInput.val() ? parseFloat(deltaInput.val()).toFixed(4) : defaultDelta;
    }


    function addMapToModal() {
        var options = {
            zoom: 12,
            center: getLatLng(),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(document.getElementById('map-canvas'), options);

        var placeInput = document.getElementById('mapinput-place-autocomplete');

        addPlaceComplete(placeInput, map);
        addDrawingManager(map);
    }

    function getLatLng() {
        return new google.maps.LatLng(lat, lng);
    }

    function addDrawingManager(map) {
        // drawing manager
        drawMgr = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.RECTANGLE
                ]
            }
        });
        drawMgr.setMap(map);

        // event listener
        google.maps.event.addListener(drawMgr, 'overlaycomplete', function(e){
            area = e.overlay;
            area.editable = false;
            drawMgr.setDrawingMode(null);

            constrainAreaToLatLngDelta(area);

            google.maps.event.addListener(area, 'click', function(e){
                areaToggleEditable(e);
            });

            google.maps.event.addListener(area, 'bounds_change', function(e){
                constrainAreaToLatLngDelta(area);
            });
        });

    }

    function updateDataFields(area) {
        var center = area.getBounds().getCenter();
        var ne = area.getBounds().getNorthEast();
        var sw = area.getBounds().getSouthWest();

        lat = center.lat().toFixed(6);
        lng = center.lng().toFixed(6);
        delta = Math.abs(center.lng() - ne.lng()).toFixed(4);
    }

    function areaToggleEditable() {
        // make it editable if it's not
        var editableOptions = {
            editable: true,
            draggable: true,
            fillColor: '#FF2610',
            strokeColor: '#931105'
        }

        var defaultOptions = {
            editable: false,
            draggable: false,
            fillColor: '#000000',
            strokeColor: '#000000'
        }

        if(!area.editable) {
            area.setOptions(editableOptions);
            area.editable = true;
        } else {
            area.setOptions(defaultOptions);
            area.editable = false;
            constrainAreaToLatLngDelta(area);
        }
    }

    function constrainAreaToLatLngDelta(area) {
        var center = area.getBounds().getCenter();
        var ne = area.getBounds().getNorthEast();
        var sw = area.getBounds().getSouthWest();

        lat = center.lat();
        lng = center.lng();
        delta = Math.abs(center.lng() - ne.lng());

        var newBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(center.lat() + delta, center.lng() - delta),
            new google.maps.LatLng(center.lat() - delta, center.lng() + delta)
        );

        area.setBounds(newBounds);
        updateDataFields(area);
    }


    function addPlaceComplete(el, map) {
        var autocomplete = new google.maps.places.Autocomplete(el);

        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }

            $('.pac-container', 'body').css({
                "background-color": "#FFF",
                "z-index": "20",
                "position": "fixed",
                "display": "inline-block",
                "float": "left"
            });

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
        });



    }

    function addModalToBody() {
        var modal = '<div class="modal" id="mapinput-map-modal">' +
            '   <div class="modal-dialog modal-lg">' +
            '      <div class="modal-content">' +
            '          <div class="modal-header">' +
            '              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '              <h4 class="modal-title">Select The Location</h4>' +
            '          </div>' +
            '          <div class="modal-body">' +
            '              <input type="text" name="place-autocomplete" id="mapinput-place-autocomplete" class="form-control" />' +
            '              <div class="map" id="map-canvas"></div>' +
            '          </div>' +
            '          <div class="modal-footer">' +
            '              </div>' +
            '      </div>' +
            '   </div>' +
            '</div>';

        $("body").append(modal);

        $('#mapinput-map-modal').on('shown.bs.modal', function(){
            var h = $(window).height(), offsetTop = 100;
            $('#map-canvas').css('height', ((h - offsetTop) * .85));
            if(map && typeof map == 'object') {
                google.maps.event.trigger(map,'resize')
            }
        });

        $('#mapinput-map-modal').on('hide.bs.modal', function(){
            $('input[name="latitude"]').val(lat);
            $('input[name="longitude"]').val(lng);
            $('input[name="delta"]').val(delta);
        });

        $('#map-canvas', "#mapinput-map-modal").css({
            width: "100%",
            height: "100%"
        });

        $('#mapinput-place-autocomplete', "#mapinput-map-modal").css({
            width: "400px",
            position: "relative",
            left: "120px",
            top: "42px",
            "z-index": "10"
        });

    }

    function generateCoords(lat, lng, delta) {
        var coords =  [
            {"lat": parseFloat(lat + delta), "lng": parseFloat(lng + delta)},
            {"lat": parseFloat(lat + delta), "lng": parseFloat(lng - delta)},
            {"lat": parseFloat(lat - delta), "lng": parseFloat(lng - delta)},
            {"lat": parseFloat(lat - delta), "lng": parseFloat(lng + delta)},
            {"lat": parseFloat(lat + delta), "lng": parseFloat(lng + delta)}
        ];

        return coords;
    }



}( jQuery ));
