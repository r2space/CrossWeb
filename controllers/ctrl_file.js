/**
 * @file 存取组信息的controller
 * @author lizheng
 * @copyright Dreamarts Corporation. All Rights Reserved.
 */

"use strict";

var ctrlFile     = smart.ctrl.file
  , image        = smart.framework.image
  , _            = smart.util.underscore;

/**
 * 结果转换，SmartCore -> Cross
 */
function transResult(result) {

  var newResult = [];

  _.each(result, function(el) {
    newResult.push({
        "_id": el._id.toString()
      , "filename": el.name
      , "contentType": el.contentType
      , "length": el.length
      , "uploadDate": el.updateAt
      , "metadata": {
        "author": el.createBy
        }
    });
  });

  return newResult;
}

/**
 * 保存文件
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回文件列表
 */
exports.save = function(handler, callback) {

  ctrlFile.add(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    return callback(err, transResult(result));
  });
};

/**
 * 获取文件
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回图片
 */
exports.get = function(handler, callback) {

  handler.addParams("fileInfoId", handler.params.id);

  ctrlFile.get(handler, function(err, result) {
    if(err) {
      return callback(err);
    }

    return callback(err, result);
  });
};

/**
 * 裁剪并生成缩略图
 * @param {Object} handler 上下文对象
 * @param {Function} callback 回调函数，返回图片文件信息
 */
exports.cropAndThumb = function(handler, callback) {

  var params = handler.params;

  handler.addParams("crops", [
    {key: "crop", width: Number(params.width), height: Number(params.width), x: Number(params.x), y: Number(params.y)}
  ]);
  handler.addParams("thumbs", [
    {key: "big", width: 100}
    , {key: "middle", width: 50}
    , {key: "small", width: 30}
  ]);

  image.cropAndThumb(handler, 0, function(err, result) {
    if(err) {
      return callback(err);
    }

    console.log(JSON.stringify(result));

    return callback(err, result);
  });
};



