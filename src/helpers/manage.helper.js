//imports
jwt = require('jsonwebtoken');

var manage = {};


manage.getTokenContent = function(token, secret, callback){
  //check token schema
  if(token.indexOf('Bearer ') != -1){
    //using Bearer schema
    jwt.verify(token.substring( token.indexOf("Bearer ") + "Bearer ".length ), secret, callback);
  }
}

manage.getRawToken = function(token){
  if(token.indexOf('Bearer ') != -1){
    return token.substring( token.indexOf("Bearer ") + "Bearer ".length );
  }
}

module.exports = manage;
