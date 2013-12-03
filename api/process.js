/**
 * API Process
 * Copyright (c) 2012 Author Name dd_dai
 */

/**
 * Create:
 *  Create the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/create.json
 *  Response Formats - json
 *  HTTP Method - POST
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to create
 * @return {result}0: create falied,message:fail to create
 */

exports.create = function (req,res){
  res.send({result:1});
};

 /**
 * Update:
 *  Update the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/update.json
 *  Response Formats - json
 *  HTTP Method - PUT
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to update
 * @return {result}0: create falied,message:fail to update
 */

exports.update = function (req,res){
  res.send({result:1});
};

 /**
 * Delet:
 *  Delete the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/delet.json
 *  Response Formats - json
 *  HTTP Method - DELETE
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to delete
 * @return {result}0: create falied,message:fail to delete
 */

exports.delet = function (req,res){
  res.send({result:1});
};

/**
 * Start:
 *  Start the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/start.json
 *  Response Formats - json
 *  HTTP Method - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to start
 * @return {result}0: create falied,message:fail to start
 */

exports.start = function (req,res){
  res.send({result:1});
};

 /**
 * Stop:
 *  Stop the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/stop.json
 *  Response Formats - json
 *  HTTP Method - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to stop
 * @return {result}0: create falied,message:fail to stop
 */

exports.stop = function (req,res){
  res.send({result:1});
};

 /**
 * Approve:
 *  Approve the process.
 * Update On:
 *  2012/8/2 14:00
 * Resource Information:
 *  URL - /process/approve.json
 *  Response Formats - json
 *  HTTP Method - GET
 *  Requires Authentication? - YES
 *  Rate Limited? - NO
 * @param {Number} procdefid process defined id 
 * @return {result}1: create success,message:success to approve
 * @return {result}0: create falied,message:fail to approve
 */

exports.approve = function (req,res){
  res.send({result:1});
};
