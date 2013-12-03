/**
 * API Document
 * Copyright (c) 2012 Author Name li
 */

var util = require('util')
  , ctrl = require("../controllers/ctrl_document") 
  , doc  = require("../modules/mod_document")
  , tmpl = require("../modules/mod_template");

/**
 * LastModified:
 *  To get the last modified files. 
 * Update On:
 *  2012/7/31 14:00
 * Resource Information:
 *  URL - /document/lastmodified.json
 *  Response Formats - json
 *  HTTP Methods - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * Example:
 *  Resource URL - http://10.2.8.234:3000/document/lastmodified.json?userid=user1
 *  Response Object - 
 *    {docs: [
 *      {doc: 'doc1'},
 *      {doc: 'doc2'},
 *      {doc: 'doc3'}
 *    ]}
 * @param {String} userid (option) If the userid is not specified, use a user who is currently logged.
 * @return {filelist} last modified files with title,type,last updateby,(to be determined).
 * @return {filenumber} 文件显示数目(固定)。
 * @return 如果是不公开的文件则不显示。
 * @return 如果此userid不存在，则提示无此用户。
 */

exports.lastmodified = function(req, res) {
  res.send({docs: [{doc: 'doc1'}, {doc: 'doc2'}, {doc: 'doc3'}]});
}

/**
 * LastViewed:
 *  To get a list file that you last viewed.
 * Update On:
 *  2012/7/31 14:00
 * Resource Information:
 *  URL - /document/lastviewed.json
 *  Response Formats - json
 *  HTTP Methods - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * Example:
 *  Resource URL - http://10.2.8.234:3000/document/lastviewed.json?userid=user1
 *  Response Object - 
 *    {docs: [
 *      {doc: 'doc1'},
 *      {doc: 'doc2'},
 *      {doc: 'doc3'}
 *    ]}
 * @param {String} userid (option) If the userid is not specified, use a user who is currently logged.
 * @return {filelist} last viewed files with title,last updateby(to be determined).
 * @return {filenumber} 文件显示数目(固定)。
 * @return 如果是不公开的文件则不显示。
 * @return 如果此userid不存在，则提示无此用户。
 */

exports.lastviewed = function(req, res) {
  res.send({docs: [{doc: 'doc1'}, {doc: 'doc2'}, {doc: 'doc3'}]});
}

/**
 * Followed:
 *  To get a list file that you follow.
 * Update On:
 *  2012/8/8 14:00
 * Resource Information:
 *  URL - /document/followed.json
 *  Response Formats - json
 *  HTTP Methods - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * Example:
 *  Resource URL - http://10.2.8.234:3000/document/followed.json?userid=user1
 *  Response Object - 
 *    {docs: [
 *      {doc: 'doc1'},
 *      {doc: 'doc2'},
 *      {doc: 'doc3'}
 *    ]}
 * @param {String} userid (option) If the userid is not specified, use a user who is currently logged.
 * @return {filelist} followed files with title,last updateby(to be determined).
 * @return 如果此userid不存在，则提示无此用户。
 */

exports.followed = function(req, res) {
  res.send({docs: [{doc: 'doc1'}, {doc: 'doc2'}, {doc: 'doc3'}]});
}

/**
 * Create:
 *  Create a file.
 * Update On:
 *  2012/8/8 17:00
 * Resource Information:
 *  URL - /document/create.json
 *  Response Formats - json
 *  HTTP Method - POST
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {String}  title -(optional) document title
 * @param {String}  descript -(optional) document description
 * @return {result}1: create success.
 * @return {result}0: fail to create.
 */

exports.create = function (req_, res_){
  ctrl.create(req_.body, function(err, result){
    res_.send(result);
  });
};

/**
 * Update:
 *  Update the file.
 * Update On:
 *  2012/8/8 17:00
 * Resource Information:
 *  URL - /document/update.json
 *  Response Formats - json
 *  HTTP Method - POST
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {String}  docid -(required) document　id 
 * @param {String}  title -(optional) document title
 * @param {String}  descript -(optional) document description
 * @return {result}1: update success.
 * @return {result}0: fail to update.
 */
exports.update = function (req_, res_){
  ctrl.update(req_.body, function(err, result){
    res_.send(result);
  });  
};

/**
 * Istemplate:
 *  文件作为模板
 * Update On:
 *  2012/8/8 17:00
 * Resource Information:
 *  URL - /document/istemplate.json
 *  Response Formats - json
 *  HTTP Method - POST
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {String}  docid -(required) document　id 
 * @param {String}  title -(optional) document title
 * @param {String}  descript -(optional) document description
 * @return {result}1: 成为模板。
 * @return {result}0: 不能作为模板。
 */

exports.totemplate = function (req, res){
  res.send({result: 1});
};

/**
 * Delete:
 *  Delete the file.
 * Update On:
 *  2012/8/8 17:00
 * Resource Information:
 *  URL - /document/delete.json
 *  Response Formats - json 
 *  HTTP Method - POST
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {String}  docid -(required) document　id 
 * @param {String}  title -(optional) document title
 * @param {String}  descript -(optional) document description
 * @return {result}1: delete success.
 * @return {result}0: fail to delete.
 */

exports.delete = function (req, res){
  res.send({result: 1});
};

/**
 * View:
 *  View files list
 * Update On:
 *  2012/8/8 17:00
 * Resource Information:
 *  URL - /document/view.json
 *  Response Formats - json
 *  HTTP Method - GET
 *  Requires Authentication? - YES
 *  Rate Limited - NO
 * @param {String} userid (option) If the userid is not specified, use a user who is currently logged.
 * @return {fileslist} view all files with title,last updateby(to be determined)
 */

exports.view = function(req_, res_){
  
  var _tmpl = tmpl;
  
  if (req_.params.id) {

    ctrl.read(req_.params.id, function(err, result){
      res_.send(result);
    });
    
  } else {
    
    doc.list(function(result) {
      res_.send(result);
    });
  }
};

// selectable document list(used to doc define)
exports.list = function(req_, res_){
  if (req_.query.type == "docs") {
    res_.send(doc.reflist(req_.query.type));
  } else {
    
    // selectable column list(used to doc define)
    res_.send(doc.items(req_.query.type));
  }
};

exports.saveItem = function(req_, res_){
  doc.addComponent(req_.body, function(doc){
    res_.send(doc);
  });
};


