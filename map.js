var map;
const geocodeVectors = new ol.source.Vector({
    features: []
});

async function initializeMap() {
    
    
    map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    wrapX: false
                })
            }),
            new ol.layer.Vector({
                source: geocodeVectors
            })
        ],
        target: document.querySelector('.map'),
        view: new ol.View({
            center: [0, 0],
            zoom: 1
        })
    });
    initializeMarkers();
    const ipInfo = await getIPInfo();
    //const loc = ipInfo.location;
    //const userLoc = ol.proj.fromLonLat([loc.lng, loc.lat]);
    document.getElementById('ip').textContent = `${ipInfo.ip} [${ipInfo.isp}]`;
    document.getElementById('loc').textContent = `${ipInfo.location.country} ${ipInfo.location.region} ${ipInfo.location.city}`;
    
    map.on('moveend', (e) => {
        if(!map.getView().getCenter()[0])
            return;
        document.getElementById('geocode_displayname').textContent = "Processing request . . .";
    
        ui.delay(() => {
            const center = map.getView().getCenter();
            const proj = map.getView().getProjection();
            const lonLat = ol.proj.transform(center, proj, 'EPSG:4326');
            updateGeocodeInfo(...lonLat, map.getView().getZoom());
        }, 1500);        
    })
}

async function updateGeocodeInfo(lon, lat, zoom){
    const geoInfo = await reverseGeocodeLonLat(lon, lat, zoom);
    geocodeVectors.clear(true);
    document.getElementById('geocode_displayname').textContent = "No info found at this location";
    document.getElementById('geocode_attribution').textContent = "try panning to another loaction";
    if(!geoInfo || !geoInfo.features || !geoInfo.features.length)
        return;
    document.getElementById('geocode_displayname').textContent = geoInfo.features[0].properties.display_name;
    document.getElementById('geocode_attribution').textContent = geoInfo.licence;
    const features = (new ol.format.GeoJSON({
        featureProjection: map.getView().getProjection()
    })).readFeatures(geoInfo);
    features.push(new ol.Feature({
        geometry: ol.geom.Polygon.fromExtent(ol.proj.transformExtent(geoInfo.features[0].bbox, 'EPSG:4326', map.getView().getProjection())),
    }));
    features[features.length -1].setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2,
            lineDash: [5,5]
        })
    }));
    geocodeVectors.addFeatures(features);
}

async function reverseGeocodeLonLat(lon, lat, zoom){
        
    if(typeof zoom !== 'number')
        zoom = 18;
    
    const parms = {
        lat: lat,
        lon: lon,
        zoom: Math.round(zoom),
        format: 'geojson',
        polygon_geojson: 1
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    for(const [k, v] of Object.entries(parms))
        url.searchParams.append(k, v);
    
    const geoInfo = await getJSON(url.href);
    return geoInfo;
}

function onMarkerClick(e){
    const data = e.currentTarget.dataset;
    ui.dialog.root.classList.add('webcam-loading');
    const webcamImg = ui.dialog.root.querySelector('.webcam');
    ui.dialog.root.querySelector('.mdc-dialog__title').textContent = data.title;
    const loadingImg = webcamImg.previousElementSibling;
    loadingImg.style.display = '';
    webcamImg.style.display = 'none';
    webcamImg.onload = (e) => {
        e.currentTarget.previousElementSibling.style.display = 'none';
        e.currentTarget.style.display = '';
        ui.dialog.root.classList.remove('webcam-loading');
    }

    webcamImg.src = data.url;
    ui.dialog.open();
    
}

function onDialogClose(e){
    const webcamImg = ui.dialog.root.querySelector('img.webcam');
    const loadingImg = webcamImg.previousElementSibling;
    loadingImg.style.display = 'none';
    webcamImg.style.display = 'none';
    // be a good citizen and turn off the feed
    webcamImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
}

async function initializeMarkers(){
    const geojson = await getJSON('cams.json')
    geojson.features.forEach(fea => {
        const btn = ui.createFAB('videocam', 'live webcam');
        btn.classList.add('mdc-fab--mini');
        btn.setAttribute('data-url', fea.properties.url);
        btn.setAttribute('data-title', fea.properties.title || '');
        btn.setAttribute('data-coordinate', fea.geometry.coordinates.join(','));
        btn.onclick = onMarkerClick;
        document.body.appendChild(btn);
        map.addOverlay(new ol.Overlay({
            position: ol.proj.fromLonLat(fea.geometry.coordinates),
            positioning: 'center-center',
            element: btn,
            stopEvent: false
        }));
    });
    ui.dialog.listen('MDCDialog:closed', onDialogClose);
}

async function getJSON(url){
    return await (await fetch(url)).json();
}

async function getIPInfo() {
    let data = localStorage.getItem('ip_info');
    if (!data) {
        data = await getJSON('https://geo.ipify.org/api/v1?apiKey=at_VKZPguJh0svArfP3qq25NhWEZ7PDe');
        localStorage.setItem('ip_info', JSON.stringify(data));
    }
    return (typeof data === 'string') ? JSON.parse(data) : data;
}

initializeMap();
