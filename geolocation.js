
const accuracyFeature = new ol.Feature();
const positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 18,
        fill: new ol.style.Fill({
            color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
        })
    }),
    text: new ol.style.Text({
        text: `Searching . . .`,
        font: '22px Roboto',
        textAlign: 'end',
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'white'
        })
    })
}));

let geolocation;

document.body.appendChild(ui.createElement('div', {
    classList: ['geolocation_info']
}));

document.body.appendChild(ui.createFAB('gps_not_fixed', 'locate me'));
document.body.lastChild.id = 'geolocation_button';
document.body.lastChild.onclick = (e) => {
    if(geolocation){
        centerMapToUserLocation();
        fitMapToUserLocation();
        return;
    }



    geolocation = new ol.Geolocation({
        tracking: true,
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: map.getView().getProjection()
    });

    geolocation.triggerRecenter = true;
    geolocation.triggerFit = true;

    geolocation.on('error', function(error) {
        console.error(error);
    });

    geolocation.on('change', (e) => {
        let color = 'red';
        let accuracy = geolocation.getAccuracy();
        
        if(typeof accuracy === 'number'){
            accuracy = Math.round(accuracy);
            if(accuracy < 10)
                color = 'green';
            if(accuracy > 10 && accuracy < 20)
                color = 'orange';
        }
        if(accuracyFeature.getStyle())
            accuracyFeature.getStyle().getStroke().setColor(color);
        positionFeature.getStyle().getText().getStroke().setColor(color);
        positionFeature.getStyle().getText().setText(`Accuracy ${accuracy} [m]`);

    });
    
    geolocation.on('change:accuracyGeometry', (e) => {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        if(geolocation.triggerFit){
            delete geolocation.triggerFit;
            fitMapToUserLocation();
        }

    });

    geolocation.on('change:position', (e) => {
        const coord = geolocation.getPosition();
        positionFeature.setGeometry(coord ? new ol.geom.Point(coord) : null);
        if(geolocation.triggerRecenter){
            delete geolocation.triggerRecenter;
            centerMapToUserLocation();
        }
    });

    map.addLayer(new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [accuracyFeature, positionFeature]
        })
    }))
    
    
    geolocation.setTracking(true);   

}

function centerMapToUserLocation(){
    const coord = geolocation.getPosition();
    if(coord)
        map.getView().setCenter(coord);
}

function fitMapToUserLocation(){
    const geom = geolocation.getAccuracyGeometry();
    if(geom)
        map.getView().fit(geom.getExtent(), map.getSize());
}