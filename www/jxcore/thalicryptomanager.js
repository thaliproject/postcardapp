
var crypto = require('crypto');
var fs = require('fs');

var pkcs12FileName = '/pkcs12.pfx';
var password = 'password';
var certname = 'certname';
var country = 'country';
var organization = 'organization';
var macName = 'SHA256';
var hashSizeInBytes = 16;

var fileLocation222 = 'AAA';




module.exports = {
  
  getPublicKeyHash: function (callback) {
  console.log('start getPublicKeyHash()');
  
    Mobile.GetDocumentsPath(function (err, fileLocation) {
      if (err) {
        console.error("GetDocumentsPath err: ", err);
        callback(null);
      } else {
        console.log("GetDocumentsPath fileLocation", fileLocation);
        var file = fileLocation + pkcs12FileName;
        fs.exists(file, function (exists) {
          if(exists) {
            console.log('pkcs12 file exists');
            console.log('reading pkcs12FileName');
            // read the file
            fs.readFile(file, function (err, pkcs12Content) {
              if (err) {
                console.log('failed to read pkcs12FileName - err: ', err);
                callback(null);
              }
              console.log('successfully read pkcs12Content');
              // extract publick key
              console.log('extracting publicKey from pkcs12Content');
              var publicKey = crypto.pkcs12.extractPublicKey(password, pkcs12Content);
              console.log('publicKey length:', publicKey.length);
              if (publicKey.length <= 0) {
                console.log('failed to extract publicKey');
                callback(null);
              }
              var hash = generateSHA256Hash(publicKey);
              console.log('got hash length: ', hash.length);
              console.log('got hash: ', hash);
              callback(hash);
            });
          } else {
            console.log('pkcs12 file does not exist');
            // create pkcs12 bundle
            //TODO: allow the user to pass in these values
            var pkcs12Content = crypto.pkcs12.createBundle(password, certname, country, organization);
            console.log('pkcs12Content length:', pkcs12Content.length);
            if (pkcs12Content.length <= 0) {
              console.log('failed to create pkcs12Content');
              callback(null);
            }
            console.log('writing pkcs12Content to pkcs12FileName');
            fs.writeFile(file, pkcs12Content, function (err) {
              if (err) {
                console.log('failed to save pkcs12Content - err: ', err);
                callback(null);
              }
              console.log('successfully saved pkcs12Content');
              // extract publick key
              console.log('extracting publicKey from pkcs12Content');
              var publicKey = crypto.pkcs12.extractPublicKey(password, pkcs12Content);
              console.log('publicKey length:', publicKey.length);
              if (publicKey.length <= 0) {
                console.log('failed to extract publicKey');
                callback(null);
              }
              var hash = generateSHA256Hash(publicKey);
              console.log('got hash length: ', hash.length);
              console.log('got hash: ', hash);
              callback(hash);
            });
          }
        });
      }
    });
    console.log('end getPublicKeyHash()');
  },
    
    
    
  getPublicKeyHash2: function () {
    console.log('start getPublicKeyHash2()');
    

      /*Mobile.GetDocumentsPath(function (err, fileLocation) {
          if (err) {
            console.error("GetDocumentsPath err: ", err);
            return null;
          } else {
            console.log("GetDocumentsPath fileLocation", fileLocation);
            fileLocation222 = fileLocation;
            return fileLocation;
          }
        })
        .then(function (fileLocation) {
          var file = fileLocation + pkcs12FileName;
          console.log('checking for file INSIDE THEN: ', file);
        });*/


        getfileLocation()
          .then(function (fileLocation) {
            if(fileLocation == null) {
              return null;
            }
            fileLocation222 = fileLocation + pkcs12FileName;
  
            var file = fileLocation + pkcs12FileName;
            console.log('checking for file INSIDE THEN: ', file);
          });
        
        var file = fileLocation222 + pkcs12FileName;
        console.log('checking for file AFTER THEN: ', file);
        
    /*Mobile.GetDocumentsPath(function(err, fileLocation) {
      if (err) {
        console.error("GetDocumentsPath err: ", err);
        return null;
      } else {
        console.log("GetDocumentsPath fileLocation", fileLocation);
        return fileLocation;
      }
    }).then(function (fileLocation) {
      var file = fileLocation + pkcs12FileName;
      console.log('checking for file INSIDE THEN: ', file);
      
      // check if the pkcs12 file already exists
      fs.exists(file, function (exists) {
        if(exists) {
          console.log('pkcs12 file exists');
          
          
        } else {
          console.log('pkcs12 file does not exist');
          // create pkcs12 bundle
          //TODO: allow the user to pass in these values
          var pkcs12Content = crypto.pkcs12.createBundle(password, certname, country, organization);
          console.log('pkcs12Content length:', pkcs12Content.length);
          
          if (pkcs12Content.length <= 0) {
            console.log('failed to create pkcs12Content');
            return null;
          }
          
          console.log('writing pkcs12Content to pkcs12FileName');
          fs.writeFile(file, pkcs12Content, function (err) {
            if (err) {
              console.log('failed to save pkcs12Content - err:', err);
              return null;
            }
          });
          
          // extract publick key
          console.log('extracting publicKey from pkcs12Content');
          var publicKey = crypto.pkcs12.extractPublicKey(password, pkcs12Content);
          console.log('publicKey length:', publicKey.length);
  
          if (publicKey.length <= 0) {
            console.log('failed to extract publicKey');
            return null;
          }
          
          var hash = generateSHA256Hash(publicKey);
          console.log('got hash length: ', hash.length);
          console.log('got hash: ', hash);
          return hash;
        }
      });
    });*/

    
   /* // check if the pkcs12 file already exists
    fs.exists(file, function (exists) {
      if(exists) {
        console.log('pkcs12 file exists');
        
        
      } else {
        console.log('pkcs12 file does not exist');
        // create pkcs12 bundle
        //TODO: allow the user to pass in these values
        var pkcs12Content = crypto.pkcs12.createBundle(password, certname, country, organization);
        console.log('pkcs12Content length:', pkcs12Content.length);
        
        if (pkcs12Content.length <= 0) {
          console.log('failed to create pkcs12Content');
          return null;
        }
        
        console.log('writing pkcs12Content to pkcs12FileName');
        fs.writeFile(file, pkcs12Content, function (err) {
          if (err) {
            console.log('failed to save pkcs12Content - err:', err);
            return null;
          }
        });
        
        // extract publick key
        console.log('extracting publicKey from pkcs12Content');
        var publicKey = crypto.pkcs12.extractPublicKey(password, pkcs12Content);
        console.log('publicKey length:', publicKey.length);

        if (publicKey.length <= 0) {
          console.log('failed to extract publicKey');
          return null;
        }
        
        var hash = generateSHA256Hash(publicKey);
        console.log('got hash length: ', hash.length);
        console.log('got hash: ', hash);
        return hash;
      }
    });*/
    
  },
  
  externalfn: function () {
    console.log('externalffffffffffffnnnnnnnnnnnnnnn');
  },
  
  externalfnWCB: function (callback) {
    console.log('externalfnWCB START');
    var file = 'C:\PCA_7_15_sync\postcardapp\www\jxcore\test.js';
    var bool = 'NA';
    console.log('calling fs.exists FIRST TIME');
    fs.exists(file, function (exists) {
      if(exists) {
        bool = 'exists111';
        console.log('pkcs12 file exists111');
        callback(bool);
      } else {
        bool = 'does not exists111';
        console.log('pkcs12 file does not exist111');
      }
      //callback(bool);
    });
    console.log('donecalling fs.exists FIRST TIME');
    console.log('calling fs.exists SECOND TIME');
    fs.exists(file, function (exists) {
      if(exists) {
        bool = 'exists222';
        console.log('pkcs12 file exists222');
      } else {
        bool = 'does not exists222';
        console.log('pkcs12 file does not exist222');
      }
      callback(bool);
    });
    console.log('donecalling fs.exists SECOND TIME');

  }
  
};



function internalfn() {
	console.log('internalffffffffffffnnnnnnnnnnnnnnn');
}

function getfileLocation() {
  Mobile.GetDocumentsPath(function(err, fileLocation) {
    if (err) {
      console.error("GetDocumentsPath err: ", err);
      return null;
    } else {
      console.log("GetDocumentsPath fileLocation", fileLocation);
      return fileLocation;
    }
  });
}


function generateSHA256Hash(publicKey) { //Returns a "Buffer"
    var hash = crypto.createHash(macName);
    hash.update(publicKey); //already encoded to 'base64'
    var fullSizeKeyHash = hash.digest('base64');
    var slicedKeyIndex = fullSizeKeyHash.slice(0, hashSizeInBytes);
    var keyIndexByteArray = new Buffer(slicedKeyIndex);
    return keyIndexByteArray;
}
