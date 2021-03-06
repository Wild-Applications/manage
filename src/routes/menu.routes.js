var Router = require('restify-router').Router,
menuRouter = new Router(),
verifyToken = require('restify-jwt-community'),
tokenHelper = require('../helpers/token.helper.js'),
restify = require('restify'),
errors = require('../errors/errors.json');

var secret = process.env.JWT_SECRET;

var grpc = require("grpc");
var menuDescriptor = grpc.load(__dirname + '/../proto/menu.proto').menu;
var menuClient = new menuDescriptor.MenuService('service.menu:1295', grpc.credentials.createInsecure());


menuRouter.get('/', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    menuClient.getAll({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

menuRouter.get('/:_id', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    menuClient.get({_id: req.params._id}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});


menuRouter.post("/", verifyToken({secret:secret}), function(req,res,next){
  //create request
  //get user id in order to link new premises to user
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));

    var menuToCreate = req.body;
    menuClient.create(menuToCreate, metadata, function(err, result){
      if(err){
        res.status(err.code || 400);
        res.send(err.message);
        return;
      }
      res.send(result);
    });
  });
});

menuRouter.put('/:_id', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(401);
      res.send(err);
      return;
    }


    var present = [];
    for(var key in req.body){
      present[present.length] = key;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    metadata.add('present', present.toString());

    console.log('params ', req.params);
    if(req.body){
      req.body._id = req.params._id;
      delete req.body.contents;
      menuClient.update(req.body, metadata, function(err, result){
        if(err){
          res.status(err.code || 500);
          res.send({message: err.message});
          return;
        }
        res.send(result);
      });
    }else{
      var error = errors['0001'];
      res.status(error.code || 500);
      res.send(error);
      return;
    }
  });
});

menuRouter.put('/contents/:_id', verifyToken({secret:secret}), function(req,res,next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(401);
      res.send(err);
      return;
    }

    var present = [];
    for(var key in req.body){
      present[present.length] = key;
    }
    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    metadata.add('present', present.toString());

    if(req.body){
      console.log(req.body);
      req.body._id = req.params._id;
      menuClient.updateContents(req.body, metadata, function(err, result){
        if(err){
          res.status(400);
          res.send(err);
          return;
        }
        res.send(result);
      });
    }else{
      var error = error['0001'];
      res.status(error.code || 500);
      res.send(error);
      return;
    }
  });
})

menuRouter.del('/:_id', function(req, res, next){
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
    menuClient.delete(body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send();
    });
  });
});

menuRouter.post('/active/:_id', verifyToken({secret:secret}), function(req,res,next){
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
    menuClient.makeActive(body, metadata, function(err, result){
      if(err){
        res.status(400);
        res.send(err);
        return;
      }
      res.send(result);
    });
  });
});

module.exports = menuRouter;
