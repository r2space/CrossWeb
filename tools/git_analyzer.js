
var fs = require('fs')
  , _  = require('underscore')
  , lineReader = require('./line_reader')
  , exec = require('child_process').exec;

var regexp_commit     = /^commit[ ]+(.*)$/
  , regexp_merge      = /^Merge:[ ]+(.*)$/
  , regexp_author     = /^Author:[ ]+([^ ]*)[ ]+([^ ]*)$/
  , regexp_date       = /^Date:[ ]+(.*)$/
  , regexp_empty      = /^[ ]*$/
  , regexp_comment    = /^[ ]+(.*)$/
  , regexp_code       = /^(\d+)[\t]+(\d+).*$/
  , regexp_code_none  = /^-[\t]+-.*$/;

var log = "git_history.log"
  , step = ""
  , block = {}
  , blocks = []
  , users = []

  // 命令行参数
  , y = parseInt(process.argv[2])
  , m = parseInt(process.argv[3])
  , d = parseInt(process.argv[4])
  , date = new Date(y, m - 1, d, 0, 0, 0);

// command : $git log --numstat > filename
var child = exec("git log --numstat > " + log, function(error, stdout, stderr){

  if (error != null) {
    console.log(error);
    return false;
  }

  lineReader.eachLine(log, function(line, last){

    if (last) {
      report();
    }

    if (regexp_empty.test(line)) {
      return true;
    }

    if (regexp_commit.test(line)) {

      if (block.commit && !block.marge) {
        blocks.push(block);
      }

      step = "commit";
      block = {"insert": 0, "delete": 0};
      block.commit = RegExp.$1;
      return true;
    }

    if (regexp_merge.test(line)) {
      step = "marge";
      block.marge = "marge";
      return true;
    }

    if (regexp_author.test(line)) {
      step = "author";
      block.author = RegExp.$1;
      block.mail = RegExp.$2;

      if (!_.contains(users, block.author)) { users.push(block.author); }
      return true;
    }

    if (regexp_date.test(line)) {
      step = "date";
      block.date = new Date(RegExp.$1);
      return true;
    }

    if (step == "date") {
      if (regexp_comment.test(line)) {
        block.comment = RegExp.$1;
        return true;
      }

      if (regexp_code.test(line)) {
        block.insert = block.insert + parseInt(RegExp.$1);
        block.delete = block.delete + parseInt(RegExp.$2);
        return true;
      }

      if (regexp_code_none.test(line)) {
        return true;
      }

    }

  });
});

function report() {
  _.each(users, function(u) {

    var ins = 0, del = 0;
    _.each(blocks, function(b){
      if (b.author == u && b.date > date) {
        ins += b.insert; 
        del += b.delete;
      }
    });

    console.log(u + " -> insert: " + ins + ". delete: " + del + ". sum:" + (ins + del));
  });

  fs.unlinkSync(log);
}
