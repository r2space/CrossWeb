/**
 * API File
 * Copyright (c) 2012 Author Name dd_dai
 */

"use strict";

var ctrlFile     = require("../controllers/ctrl_file")
  , context  = smart.framework.context
  , response = smart.framework.response;


exports.save = function(req, res){

  var handler = new context().bind(req, res);

  ctrlFile.save(handler, function(err, result) {
    if (err) {
      return response.send(res, err);
    } else {
      return response.send(res, err, {items: result});
    }
  });
};

exports.image = function(req, res) {

  var handler = new context().bind(req, res);

  ctrlFile.get(handler, function(err, result){

    if (err) {
      return response.send(res, err);
    }

    return response.sendFile(res, err, result);
  });

};

exports.cropAndThumb = function(req, res) {

  var handler = new context().bind(req, res);

  ctrlFile.cropAndThumb(handler, function(err, result){

    if (err) {
      return response.send(res, err);
    }

    return response.send(res, err, result);
  });

};