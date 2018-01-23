var Router = require('restify-router').Router,
premisesRouter = new Router(),
verifyToken = require('restify-jwt-community'),
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

    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));

    var premisesToCreate = req.body;
    premisesClient.create(premisesToCreate, metadata, function(err, result){
      if(err){
        err = JSON.parse(err);
        res.status(err.error.status || 500);
        res.send(err);
        return;
      }
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
      console.log('immediate errro', err);
      res.status(400);
      res.send(err);
      return;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));
    premisesClient.update(req.body, metadata, function(err, result){
      if(err){
        console.log('premises error', err);
        res.status(err.code || 500);
        res.send({message: err.message});
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
        res.status(err.code || 500);
        res.send(err.message);
      }else{
        res.send(result);
      }
    });
  });
});

premisesRouter.post("/open", verifyToken({secret: secret}), function(req,res,next){
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));
    premisesClient.open({}, metadata, function(err, result){
      if(err){
        console.log(err);
        res.status(400);
        res.send(err);
      }else{
        res.send(result);
      }
    });
  });
});

premisesRouter.post("/close", verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  manageHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', manageHelper.getRawToken(token));
    premisesClient.close({}, metadata, function(err, result){
      if(err){
        console.log(err);
        res.status(400);
        res.send(err);
      }else{
        res.send(result);
      }
    });
  });
});

module.exports = premisesRouter;
