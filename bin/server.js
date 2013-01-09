var http            = require('http'),
    fs              = require('fs'),
    express         = require('express'),
    app             = express(),
    port            = process.env.npm_package_config_port,
    assetsRoot      = './assets',
    docRoot         = (process.env.NODE_ENV === 'production' || process.env.npm_package_config_prod) ? './dist' : './src';


app.disable('x-powered-by');


// Configure application

app.configure('all',function () {
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(docRoot));
    app.use(express.static(assetsRoot));
});


// REST API - Simple example of an API

app.get('/api/status', function(req, res, next) {
    db.status(function(obj){
        res.json({now: +new Date(), root: docRoot, assets: assetsRoot});
    });
});


// Start server

var httpServer = http.createServer(app).listen(port);
console.info('Server running at http://localhost:' + port + '/');
console.info('Serving documents from ' + docRoot);
console.info('Serving assets from ' + assetsRoot);


// Prevent exceptions to bubble up to the top and eventually kill the server

process.on("uncaughtException", function (err) {
    console.warn(err.stack);
});