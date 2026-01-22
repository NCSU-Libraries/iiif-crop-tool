function getParameterByName(name, url) {
    if (!url) {
      url = window.location.search;
    }
    url =  decodeURIComponent(url.split("=").slice(-1)[0]);
    url = url.split("/full")[0];
    url = url || 'https://stacks.stanford.edu/image/iiif/qh070wy9471%252Fhopkins_jpearse_slides_27'
    return `${url}/info.json`;
}

var url = getParameterByName ('newUrl');

var viewer = OpenSeadragon({
  id: 'map',
  prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@3.1/build/openseadragon/images/', 
  gestureSettingsMouse: {
    clickToZoom: false
  },
  gestureSettingsTouch: {
    pinchRotate: true
  },
  showRotationControl: true,
  tileSources: [url]
});
var anno = AnnotoriousOSD.createOSDAnnotator(viewer, {
  autoSave: true,
  drawingEnabled: false,
});
viewer.addHandler('open', () => {
  const item = viewer.world.getItemAt(0);
  const size = item.getContentSize();
  const smallestSide = size['x'] > size['y'] ? size['y'] : size['x']
  const boxSize = smallestSide/2;
  const imageCenter = viewer.world.getItemAt(0).viewportToImageCoordinates(viewer.viewport.getCenter());

  const x = imageCenter['x'] - (boxSize/2)
  const y = imageCenter['y'] - (boxSize/2)
  anno.addAnnotation({
  id: 'annotation',
  target: {
    selector: {
      type: 'RECTANGLE',
      geometry: {
        bounds: {
          minX: x,
          minY: y,
          maxX: boxSize + x,
          maxY: boxSize + y
        },
        x,
        y,
        w: boxSize,
        h: boxSize,
      }
    }
  }});
  anno.setSelected('annotation');
});

anno.on('updateAnnotation', selected => updateArea(selected));
anno.on('viewportIntersect', selected => updateArea(selected));


function CopyClipboard(){
  var copyText = document.getElementById("urlArea").innerHTML;
  navigator.clipboard.writeText(copyText);
}

function updateArea(selected) {
  const annotation = Array.isArray(selected) ? selected[0] : selected;
  const geometry = annotation['target']['selector']['geometry'];
  const x = geometry['x'] < 0 ? 0 : parseInt(geometry['x']);
  const y = geometry['y'] < 0 ? 0 : parseInt(geometry['y']);
  var region = [x, y, parseInt(geometry['w']), parseInt(geometry['h'])]
  let rotation = viewer.viewport.getRotation();
  // if you rotate more than once the rotation is over 360.
  // If you click rotate 5 times, the result is 450, this is not in line with IIIF
  // if you rotate left the number is in negative, i.e. -90 for one click left
  rotation = rotation < 0 ? (rotation + (360 * (parseInt(Math.abs(rotation/360) + 1)))) : rotation - (360 * parseInt(rotation/360)) 
  rotation = rotation == 360 ? 0 : rotation;
  var region_url = `${url.replace("info.json", "")}${region.join(",")}/full/${Math.abs(rotation)}/default.jpg`
  document.querySelector('#urlArea').innerHTML = region_url
}
