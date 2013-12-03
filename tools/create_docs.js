var fs = require("fs");

var arguments = process.argv.splice(2);
if(arguments.length === 0){
	console.log("please input original dir and target dir!");
	return;
}

var originalPath = arguments[0];
var targetPath = arguments[1] ? arguments[1] : arguments[0];
if(originalPath.indexOf("\\") !== -1){
	if(originalPath.lastIndexOf("\\") !== originalPath.length-1){
		originalPath += "\\";
	}
	if(targetPath.lastIndexOf("\\") !== targetPath.length-1){
		targetPath += "\\";
	}
}else if(originalPath.indexOf("/") !== -1){
	if(originalPath.lastIndexOf("/") !== originalPath.length-1){
		originalPath += "/";	
	}
	if(targetPath.lastIndexOf("/") !== targetPath.length-1){
		targetPath += "/";
	}
}
fs.exists(targetPath, function (exists) {
	if(!exists){
		fs.mkdirSync(targetPath);
	}
	main();
});

//读取所有api/docs下面的html文件，处理后放到根目录的doc文件夹下，如果不是.js.html的直接拷贝过去
function main(){
	fs.readdir(originalPath, function(err, files){
		if(err){
			console.log("read dir error! dir:"+originalPath);
			throw err;
		}
		for(var i in files){
			if(files[i].indexOf(".js.html") !== -1){
				FileOperation(files[i], originalPath, targetPath);
			}else{
				(function(file){
					fs.stat(originalPath+file, function (err, stats) {
						if(stats.isDirectory()){
							return;
						}else{
							fs.readFile(originalPath+file, function(err, data){
					 			if (err){
									console.log("read file error! path:"+originalPath+file);
					 				throw err;
					 			}
								fs.writeFile(targetPath+file, data, function(err){
					 				if (err){ 
										console.log("write file error! path:"+targetPath+file);
					 					throw err;
					 				}
								});
							});
						}
					});
				})(files[i]);
			}
		}
	});
}

function FileOperation(file, opath, tpath){
	fs.readFile(opath+file, function (err, data) {
		if (err){ 
			console.log("read file error! path:"+opath+file);
			throw err;
		}

	  var fileContent = "";
	  data = data.toString();
	  //为html文件加载两个js文件，一个是jquery，一个是处理页面的createDoc.js
	  if(data.indexOf("</head>") !== -1){
	  	fileContent += data.substring(0, data.indexOf("</head>"));
	  	
	  	//得到实际路径取其前缀到smart为止
		  var realPath = fs.realpathSync(tpath);
		  var pathPrefix = realPath.substring(0, realPath.lastIndexOf("smart")+5);
		  pathPrefix = pathPrefix.replace(/\\/g, '/');
		  fs.readFile(pathPrefix+"/tools/docHelper.js", function(err, data){
	 			if (err){
					console.log("read file error! path:"+pathPrefix+"/tools/docHelper.js");
	 				throw err;
	 			}
				fs.writeFile(tpath+"docHelper.js", data, function(err){
	 				if (err){ 
						console.log("write file error! path:"+tPath+"docHelper.js");
	 					throw err;
	 				}
				});
			});
	  	if(fileContent.indexOf("jquery_script") === -1){
	  		fileContent += "<script type='text/javascript' id='jquery_script' src='"+pathPrefix+"/public/vendor/jquery-1.9.1.min.js'></script>";
	  	}
	  	fileContent += data.substring(data.indexOf("</head>"), data.length);
	  	
	  	if(fileContent.indexOf("createDoc_script") === -1){
	  		fileContent += "<script type='text/javascript' id='createDoc_script' src='docHelper.js'></script>";
	  	}
	  }

	  //给Example中的Resource - Object:添加带框样式，注意必须这样写，空格也不能少
	  var endIndex = 0;
	  var objIndex = fileContent.indexOf("Resource - Object:", endIndex);
	  var tmpContent = "";
	  while(objIndex !== -1){
	  	tmpContent = fileContent.substring(0, objIndex+18);
	  	tmpContent += "<div class='details'>";
	  	tmpContent += fileContent.substring(objIndex+18, fileContent.indexOf("</p>", objIndex));
	  	tmpContent += "</div>";
	  	tmpContent += fileContent.substring(fileContent.indexOf("</p>", objIndex), fileContent.length);
	  	fileContent = tmpContent;
	  	endIndex = objIndex + 1;
	  	objIndex = fileContent.indexOf("Resource - Object:", endIndex);
	  }

	  fs.writeFile(tpath+file, fileContent, function(err){
			if (err){ 
				console.log("write file error! path:"+tpath+file);
				throw err;
			}
	  });
	});
}

/*
var ndir = require('ndir');

var lineNumber = 0;
var header="", body=new Array(), footer="", index=1;
var head_flag = false;
var foot_flag = false;
ndir.createLineReader('./api/docs/user.js.html').on('line', function(line) {
	
	line = line.toString();
  if(line){
	  if(!head_flag && line.indexOf("<tbody>") === -1){
	  	header += line;
		}else if(!head_flag){
			var index_end = line.indexOf("<tbody>") + 7;
			header += line.substring(0, index_end); 
			head_flag = true;
		}

		if(head_flag && !foot_flag){
			if(line.indexOf("<tr id=\"section-") !== -1 && line.indexOf("</tr>") !== -1 && line.indexOf("</tr>") > line.indexOf("<tr id=\"section-")){
				index = getIndex(line);
				body[index] = line.substring(line.indexOf("<tr id=\"section-"), line.indexOf("</tr>")+5);
			}else {
				if(line.indexOf("<tr id=\"section-") !== -1){
					index = getIndex(line);
					body[index] = line.substring(line.indexOf("<tr id=\"section-"), line.length);
				}
				if(line.indexOf("</tr>") !== -1){
					body[index] += line.substring(0, line.indexOf("</tr>")+5);
					//console.log("-----------------------"+line.substring(0, line.indexOf("</tr>")+5));
				}
				if(line.indexOf("<tr id=\"section-") === -1 && line.indexOf("</tr>") === -1){
					body[index] += line;
				}
			}
		}

		if(foot_flag){
			footer += line;
		}
		if(line.indexOf("</tbody>") !== -1){
			footer += line.substring(line.indexOf("</tbody>"), line.length);
			foot_flag = true;
		}
  }
}).on('end', function() {
	body.forEach(function(i){
		if(i.indexOf("<div class=\"summary\"><h2>") !== -1){
			var begin = i.indexOf("<div class=\"summary\"><h2>")+25;
			var funcName = i.substring(begin, i.indexOf("</h2>", begin));

			i = removeCode(i);

			fs.open("./doc/"+funcName+".html", "w", function(e, fd){
		    if(e) throw e;
		    fs.write(fd, header+i+footer, 0, 'utf8',function(e){
		        if(e) throw e;
		        fs.closeSync(fd);
		    });
	  	});
			//console.log("===============: "+i);
		}
	});
}).on('error', function(err) {
  console.log('error: ', err.message)
});

function getIndex(line){
	var i = line.substring(line.indexOf("<tr id=\"section-")+16, line.indexOf("<tr id=\"section-")+18);
	if(isNaN(i)){
		i = line.substring(line.indexOf("<tr id=\"section-")+16, line.indexOf("<tr id=\"section-")+17);
	}
	return i;
}

function removeCode(i){
	var begin_i = i.indexOf("<td class=\"code\">");
	var tmp = i.substring(0, begin_i);
	tmp += i.substring(i.indexOf("</td>", begin_i)+5, i.length);
	return tmp;
}*/