# Web Mapping Example

### A very simple example of accessing and rendering spatial data on a map.

* **All functionality uses open source libraries [OpenStreetMap](https://www.openstreetmap.org), [Openlayers](https://openlayers.org), [MDC Web](https://material.io/develop/web)**
* **Captures user public IP, ISP, and general location**
  * I cache this IP data in localstorage to prevent excessive hits to the server
  * If you've moved to another pulic IP you won't this change unless you clear cache
* **Loads markers for a handful of public live video feeds from a geojson source.** 
  * I don't actively maintain that these sources will stay online
  * I also didn't bother writing error handler to ensure they fail gracefully
* **GPS button utilizes device Geolocation capabilities to locate user and provide visual accuracy**
  * Color coded GPS positoin according to accuracy of coordinate provided
  * I arbitrarily color code as red>20m; orange<15m; green<10m
* **Moving around the map runs a reverse geocode to display POI at the maps center**
  * The header at the top is the location information
  * The polygon, linestring, or point drawn is the geometry of the POI
  * I don't bother reducing the geometry complexity of large POIs. China (for example) has a few hundred thousand points. Rendering this on a low power phone may be slow.
  * The red square is the extent of the POI
  * There is an intentional delay between geocode requests to prevent excessive map activity from flooding the OSM server

## Demo: https://pattisano.github.io
