
var gridfs = require('../modules/gridfs')
  , user = require('../modules/mod_user')
  , path
  , uid;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdout.write("photo path : ");
process.stdin.on('data', function (chunk) {

  if (path) {
    uid = chunk.split("\n")[0];
    gridfs.save("untitled.png", path, function(err, doc){

      console.log(doc);
      var val = {
        "photo.big": doc._id,
        "photo.middle": doc._id,
        "photo.small": doc._id
      };

      user.update(uid, val, function(err, u){
        process.exit(1);
      });
    });
  } else {
    path = chunk.split("\n")[0];
    process.stdout.write("uid : ");
  }

});


// /Users/lilin/Pictures/untitled.png