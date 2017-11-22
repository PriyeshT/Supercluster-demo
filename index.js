'use strict';

/*global L */

// var map = L.map('map').setView([0, 0], 14);

var center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();
var map = L.map('map').setView([center.x, center.y], 12);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

var basemap = L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
    detectRetina: true,
                attribution: 'New OneMap | Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>',
                maxZoom: 18,
    minZoom: 11
            });

  var attribution = map.attributionControl;


  attribution.setPrefix('<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/>');

  map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);

basemap.addTo(map);

var markers = L.geoJson(null, {
    pointToLayer: createClusterIcon
}).addTo(map);

var worker = new Worker('worker.js');
var ready = false;

worker.onmessage = function (e) {
    if (e.data.ready) {
        ready = true;
        update();
    } else {
        markers.clearLayers();
        markers.addData(e.data);
    }
};

function update() {
    if (!ready) return;
    var bounds = map.getBounds();
    worker.postMessage({
        bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom: map.getZoom()
    });
}

map.on('moveend', update);

function createClusterIcon(feature, latlng) {
    if (!feature.properties.cluster) return L.marker(latlng);

    var count = feature.properties.point_count;
    var size =
        count < 100 ? 'small' :
        count < 1000 ? 'medium' : 'large';
    var icon = L.divIcon({
        html: '<div><span>' + feature.properties.point_count_abbreviated + '</span></div>',
        className: 'marker-cluster marker-cluster-' + size,
        iconSize: L.point(40, 40)
    });
    return L.marker(latlng, {icon: icon});
}
