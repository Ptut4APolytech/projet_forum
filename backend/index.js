'use strict';

require('dotenv').config();

var fs = require('fs'),
    path = require('path'),
    http = require('http');

var app = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var serverPort = process.env.PORT || 8080;
var cors=require('cors');

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.ENVIRONMENT === 'dev' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/index.inc.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  app.use(cors({origin:true,credentials: true}));

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // This must be placed before the swaggerRouter
  app.use(
      middleware.swaggerSecurity({
        //manage token function in the 'auth' module
        ApiKeyAuth: LoginService.verifyToken
      })
  );

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Gestion des erreurs JSON
  app.use(function(err, req, res, next) {
    if (err) {
        const data = { message: err.message };

        // Erreur de validation du schema API, on indique les champs
        if (err.results && err.results.errors) {
            data.fields = err.results.errors;
        }
        res.setHeader('Content-Type', 'application/json');
        const result = JSON.stringify(data);
        res.end(result);
    } else {
        next();
    }
});


  // Start the server
  http.createServer(app).listen(serverPort, '0.0.0.0', function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });

});


var serviceAccount = require("./service-account-file.json");
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: JSON.parse(process.env.FIREBASE_CONFIG).databaseURL,
  storageBucket: JSON.parse(process.env.FIREBASE_CONFIG).storageBucket
});

const LoginService = require('./services/LoginService');
