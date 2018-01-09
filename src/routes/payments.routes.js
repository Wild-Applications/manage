var Router = require('restify-router').Router,
router = new Router(),
verifyToken = require('restify-jwt-community'),
tokenHelper = require('../helpers/token.helper.js'),
restify = require('restify');

var secret = process.env.JWT_SECRET;

var grpc = require("grpc");
var paymentDescriptor = grpc.load(__dirname + '/../proto/payment.proto').payment;
var paymentClient = new paymentDescriptor.PaymentService('service.payment:1295', grpc.credentials.createInsecure());


router.post('/code', verifyToken({secret:secret}), function(req, res, next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    paymentClient.connect({code: req.body.code}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});

router.get('/', verifyToken({secret:secret}), function(req,res,next){
  var token = req.header('Authorization');
  tokenHelper.getTokenContent(token, secret, function(err, decodedToken){
    if(err){
      res.status(400);
      res.send(err);
      return;
    }

    var metadata = new grpc.Metadata();
    metadata.add('authorization', tokenHelper.getRawToken(token));
    paymentClient.get({}, metadata, function(err, result){
      if(err){
        res.send(err)
      }else{
        res.send(result);
      }
    });
  });
});


module.exports = router;
