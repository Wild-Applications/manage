//Authentication Service
//Entry Point
var secret = process.env.JWT_SECRET;
//imports
var restify = require('restify'),
restifyPlugins = require('restify-plugins'),
Logger = require('bunyan'),
corsMiddleware = require('restify-cors-middleware'),
verifyToken = require('restify-jwt'),
jwt = require('jsonwebtoken'),
manageHelper = require('./helpers/manage.helper.js');

//
//
//Logging setup
//
//
var log = new Logger.createLogger({
  name:'MAIN',
  //define where to write each log
  streams:[
    {
      level:'info',
      path: __dirname + '/logs/info.log'
    },
    {
      level:'error',
      path: __dirname + '/logs/error.log'
    },
    {
      level:'fatal',
      path: __dirname + '/logs/error.log'
    },
    {
      level:'warn',
      path: __dirname + '/logs/error.log'
    },
    {
      level:'debug',
      stream: process.stdout
    },
    {
      level:'trace',
      path: __dirname + '/logs/trace.log'
    }
  ],
  //how to serialise messages
  serializers: {
    req: Logger.stdSerializers.req,
    res: Logger.stdSerializers.res,
  }
});


//
//
//Server Setup
//
//
var server = restify.createServer({
  name:'manage',
  version:'0.0.0',
  //certificate:fs.readFileSync('../certificate'),
  //key:fs.readFileSync('../key')
  log:log
});

//use body parser to deal with JSON
server.use(restifyPlugins.bodyParser());
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.fullResponse());


const cors = corsMiddleware({
  preflighMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['authorization']
});
server.pre(cors.preflight);
server.use(cors.actual);


//
//
//Server routes
//
//
//version request
//return latest default version
server.get("/version", function(req,res,next){
  server.log.info("Version Request");
  res.send(server.name + " is running on v" + server.versions);
});





//
//
//Create premises request
//
server.post("/", function(req,res,next){

});


//
//
//Delete premises request
//
server.del("/premises/:_id", verifyToken({secret:secret}), function(req,res,next){
  res.send("Delete Presmises - Not Implemented");
});

//
//
//Update User
//
server.put("/premises/:_id", verifyToken({secret:secret}), function(req,res,next){
  res.send("Update Premises - Not Implemented");
});

//
//
//Get User
//
server.get("/premises", verifyToken({secret: secret}), function(req,res,next){
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', userHelper.getRawToken(token));
    accountClient.get({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

//
//
//
//
//


//
//
//
//begin listening on port 8080
//
//
server.listen(8080, function(){
  console.log(server.name + " listening on ", server.url);
});
