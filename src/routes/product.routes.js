var Router = require('restify-router').Router,
productRouter = new Router(),
verifyToken = require('restify-jwt-community'),
tokenHelper = require('../helpers/token.helper.js'),
restify = require('restify');

var secret = process.env.JWT_SECRET;

var grpc = require("grpc");
var productDescriptor = grpc.load(__dirname + '/../proto/product.proto').product;
var productClient = new productDescriptor.ProductService('service.product:1295', grpc.credentials.createInsecure());


productRouter.get('/', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));

    productClient.getAll({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });

  });
});

productRouter.post('/batch', verifyToken({secret:secret}), function(req,res,next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));

    productClient.getBatch(req.body, metadata, function(err, result){
      if(err){
        res.send(err);
      }else{
        res.send(result);
      }
    });
  });
})


productRouter.get('/:_id', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    productClient.get({_id: req.params._id}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

productRouter.post("/", verifyToken({secret:secret}), function(req,res,next){
  //create request
  //get user id in order to link new premises to user
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }
    var productToCreate = req.body;
    productToCreate.owner = decodedToken.sub;

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));

    productClient.create(productToCreate, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send(result);
    });
  });
});

productRouter.put('/:_id', function(req, res, next){
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
    productClient.update(req.body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send(result);
    });
  });
});

productRouter.del('/:_id', function(req, res, next){
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
    productClient.delete(body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send();
    });
  });
});

module.exports = productRouter;
