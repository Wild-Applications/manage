var Router = require('restify-router').Router,
tableRouter = new Router(),
verifyToken = require('restify-jwt-community'),
tokenHelper = require('../helpers/token.helper.js'),
restify = require('restify'),
errors = require('../errors/errors.json');

var secret = process.env.JWT_SECRET;

var grpc = require("grpc");
var tableDescriptor = grpc.load(__dirname + '/../proto/table.proto').table;
var tableClient = new tableDescriptor.TableService('service.table:1295', grpc.credentials.createInsecure());


tableRouter.get('/', function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    tableClient.getAll({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

tableRouter.post("/", verifyToken({secret:secret}), function(req,res,next){
  //create request
  //get user id in order to link new premises to user
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }
    if(req.body && req.body.name && req.body.name != ""){
      tableClient.create(req.body, function(err, result){
        if(err){
          res.status(err.code || 500);
          res.send(err.message);
          return;
        }
        res.send(result);
      });
    }else{
      var error = errors['0002'];
      res.status(error.code || 500);
      res.send(error);
      return;
    }
  });
});

tableRouter.put('/:_id', function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    req.body._id = req.params._id;
    tableClient.update(req.body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send(result);
    });
  });
});

tableRouter.del('/:_id', function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400).send(err);
      return;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    var body = {}
    body._id = req.params._id;
    tableClient.delete(body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send();
    });
  });
});

module.exports = tableRouter;
