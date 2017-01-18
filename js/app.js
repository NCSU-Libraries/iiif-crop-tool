function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var iiifUrl = "https://iiif.lib.ncsu.edu/iiif/";
var imageId = getParameterByName ('newUrl');
var page = getParameterByName('pageNum');
var pad = "0000";
var cleanPageNum = pad.substring(0, pad.length - page.length) + page;

var baseUrl = "";
  if (cleanPageNum !=0000){
      baseUrl = iiifUrl + imageId + "_" + cleanPageNum;
    } else {
      baseUrl = iiifUrl + imageId;
    }

var map = L.map('map', {
  center: [0, 0],
  crs: L.CRS.Simple,
  zoom: 0,
});

var iiifLayer = L.tileLayer.iiif(baseUrl + '/info.json').addTo(map);

var areaSelect = L.areaSelect({
  width:200, height:300
});

function CopyClipboard(){
  // creating new textarea element and giveing it id 't'
  let t = document.createElement('textarea')
  t.id = 't'
  // Optional step to make less noise in the page, if any!
  t.style.height = 0
  // You have to append it to your page somewhere, I chose <body>
  document.body.appendChild(t)
  // Copy whatever is in your div to our new textarea
  t.value = document.getElementById('urlArea').innerText
  // Now copy whatever inside the textarea to clipboard
  let selector = document.querySelector('#t')
  selector.select()
  document.execCommand('copy')
  // Remove the textarea
  document.body.removeChild(t)
}

areaSelect.addTo(map);

$('#urlArea').html(baseUrl)

areaSelect.on('change', function() {
  var bounds = this.getBounds();
  var zoom = map.getZoom();
  var min = map.project(bounds.getSouthWest(), zoom);
  var max = map.project(bounds.getNorthEast(), zoom);
  var imageSize = iiifLayer._imageSizes[zoom];
  var xRatio = iiifLayer.x / imageSize.x;
  var yRatio = iiifLayer.y / imageSize.y;
  var region = [
    Math.floor(min.x * xRatio),
    Math.floor(max.y * yRatio),
    Math.floor((max.x - min.x) * xRatio),
    Math.floor((min.y - max.y) * yRatio)
  ];
  var url = baseUrl + '/' + region.join(',') + '/full/0/default.jpg';
  var urlHeading = "IIIF URL";
  $('#urlArea').html(
    ' <a href="' + url + '" target=_blank>' + url + '</a>'
  )
});
