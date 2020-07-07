
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
    })
}));

let geolocation;

document.body.appendChild(ui.createElement('div', {
    classList: ['geolocation_info']
}));

document.body.appendChild(ui.createFAB('gps_not_fixed', 'locate me'));
document.body.lastChild.id = 'geolocation_button';
document.body.lastChild.onclick = (e) => {
    if(geolocation)
        return;
    geolocation = new ol.Geolocation({
        tracking: true,
        trackingOptions: {
            enableHighAccuracy: true
        },
        projection: map.getView().getProjection()
    });

    geolocation.on('error', function(error) {
        console.error(error);
    });

    geolocation.on('change', (e) => {
        let str = '';
        let color = 'green';
        let fill = 'white';
        const accuracy = geolocation.getAccuracy();
        if(accuracy && accuracy < 10)
            str = `High`;
            
        if(accuracy && !str && accuracy < 20){
            str = 'Medium';
            color = 'orange';
            fill = 'yellow';
        }
            
        if(!str){
            str = 'Low';
            color = 'red';
        }
            
        positionFeature.getStyle().setText(new ol.style.Text({
            text: `${str} accuracy within ${accuracy} [m]` ,
            font: '22px Roboto',
            textAlign: 'end',
            stroke: new ol.style.Stroke({
                color: color,
                width: 3
            }),
            fill: new ol.style.Fill({
                color: fill
            })
        }))
    });
    
    geolocation.on('change:accuracyGeometry', (e) => {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.on('change:position', (e) => {
        const coord = geolocation.getPosition();
        positionFeature.setGeometry(coord ? new ol.geom.Point(coord) : null);
    });

    map.addLayer(new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [accuracyFeature, positionFeature]
        })
    }))
    
    geolocation.setTracking(true);   

}