var log = lib.core.log
  , common = lib.api.common;

/**
 * GuidingFileApi:
 *  Routing requests to the API functions.
 * @param {app} app
 */
exports.guiding = function(app){

  app.get('/file/list.json', function(req, res){
    common.list(req, res);
  });

  app.get('/file/history_ios.json', function(req, res){
    common.ioshistory(req, res);
  });

  app.get('/file/history.json', function(req, res){
    common.history(req, res);
  });

  app.get('/file/download.json', function(req, res){
    common.download(req, res);
  });

  app.post('/file/upload.json', function(req, res){
    common.upload(req, res);
  });

  app.post('/gridfs/save.json', function(req, res){
    common.save(req, res);
  });

  app.put('/file/follow.json', function(req, res){
    common.follow(req, res);
  });
  
  app.put('/file/unfollow.json', function(req, res){
    common.unfollow(req, res);
  });

  app.get('/file/get.json', function(req, res){
    common.detail(req, res);
  });

  app.get('/file/detail.json', function(req, res){
    common.detailNew(req, res);
  });

};

