
var log   = lib.core.log
  , group = lib.api.group;

/**
 * GuidingGroupApi:
 *  Routing requests to the API functions.
 * @param {app} app
 */
exports.guiding = function(app){

  app.get('/group/list.json', function(req, res){
    group.getGroupList(req, res);
  });

  app.get('/group/get.json', function(req, res){
    group.getGroup(req, res);
  });

  app.post('/group/create.json', function(req, res){
    group.createGroup(req, res);
  });

  app.put('/group/update.json', function(req, res){
    group.updateGroup(req, res);
  });

  app.put('/group/join.json', function(req, res){
    group.addMember(req, res);
  });
  
  app.put('/group/leave.json', function(req, res){
    group.removeMember(req, res);
  });

  app.get('/group/members.json', function(req, res){
    group.getMember(req, res);
  });
  
};
