
var path = require("path")
  , confapp = require("config").app;

// init librarys
Object.defineProperty(global, 'lib', {
  get: function(){
    console.log("" + __dirname + path.sep + "../.." + path.sep + confapp.libs);
    return require("" + __dirname + path.sep + "../.." + path.sep + confapp.libs);
  }
});

// jscoverage or original library
var contact = process.env.COVER ?
  require('../../cover_modules/mod_contact') :
  require('../../modules/mod_contact');

describe("Contact Module", function() {

  var obj = {
      title: ""
    , member: ["user2", "user3"]
    , photo: {
        big: "p1"
      , middle: "p2"
      , small: "p3"
      }
    , createby: "li"
    , createat: new Date()
    , editby: "li"
    , editat: new Date()
    };

  // /*****************************************************************/
  // // 创建
  // it("test create function", function(done) {
  //   contact.create(obj, function() {
  //     contact.findOneOnOne("user2", "user1", function(err, result) {
  //       console.log(result);
  //       done();
  //     });
  //   });
  // });

  /*****************************************************************/
  // 创建
  it("test createOneOnOne function", function(done) {
    contact.createOneOnOne("user2", "user4", function(err, result) {
      console.log(result);
      done();
    });
  });

});