var Router = require('restify-router').Router,
premisesRouter = new Router(),
verifyToken = require('restify-jwt'),
restify = require('restify'),
manageHelper = require('../helpers/manage.helper.js');;

var secret = process.env.JWT_SECRET;

var grpc = require("grpc");
var premisesDescriptor = grpc.load(__dirname + '/../proto/premises.proto').premises;
var premisesClient = new premisesDescriptor.PremisesService('service.premises:1295', grpc.credentials.createInsecure());



//
//
//Create premises request
//
premisesRouter.post("/", verifyToken({secret:secret}), function(req,res,next){
  //create request
  //get user id in order to link new premises to user
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }
    console.log('got token');
    var premisesToCreate = req.body;
    premisesToCreate.owner = decodedToken.sub;
    premisesClient.create(premisesToCreate, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      console.log('got resuilt');
      res.send(result);
    });
  });
});


//
//
//Delete premises request
//
premisesRouter.del("/:_id", verifyToken({secret:secret}), function(req,res,next){
  res.send("Delete Premises - Not Implemented");
});

//
//
//Update User
//
premisesRouter.put("/", verifyToken({secret:secret}), function(req,res,next){
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));
    premisesClient.update(req.body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send(result);
    });
  });
});

//
//
//Get User
//
premisesRouter.get("/", verifyToken({secret: secret}), function(req,res,next){
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));
    premisesClient.get({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

module.exports = premisesRouter;
