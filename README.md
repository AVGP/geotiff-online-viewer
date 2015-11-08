# geotiff-online-viewer
Visualise GeoTIFF LIDAR data using Three.js

# Usage

## Web version

Go to [geotiff-viewer.herokuapps.com](https://geotiff-viewer.herokuapps.com) and upload a GeoTIFF file with height information & hit "Upload & parse" and sit back.

You can try a few of these files:

* [Zurich around Bellevue](http://maps.zh.ch/download/hoehen/2014/dom/tif/6830_2460.tif)
* [Zurich "Niederdorf"](http://maps.zh.ch/download/hoehen/2014/dom/tif/6830_2470.tif)
* [Zurich, around Stauffacher](http://maps.zh.ch/download/hoehen/2014/dom/tif/6820_2470.tif)
* [Uetliberg top](http://maps.zh.ch/download/hoehen/2014/dom/tif/6790_2440.tif)

## Run your own version of the server

```shell
git clone https://github.com/AVGP/geotiff-online-viewer.git
cd geotiff-online-viewer/server
npm install
bin/www
```
Now the server should run at [localhost:3000](http://localhost:3000).

## Rebuild the client
```shell
git clone https://github.com/AVGP/geotiff-online-viewer.git
cd geotiff-online-viewer/server
npm install
npm run build
```
This will rebuild the `client/js/main.js` file into `server/public/javascripts/app.js`.

# Change it, make it yours & make it better

If you wanna hack on the client application, you can use `npm run dev`
to have it rebuild into the server directory whenever you change the `main.js` file.

Feel free to send a pull request or open an issue, if you need help or have improvements!

Have a lot of fun!
