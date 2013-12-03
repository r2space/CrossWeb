(function(){
	Operation();
})();

function Operation(){
	//去掉背景样式
	$("#background").remove();
	//移除代码部分
	$(".code").remove();
	//让文档部分居中
	$("#container").attr("align", "center");
	//调整文档宽度
	$("th[class=docs]").css("max-width", "750px");
	$("td[class=docs]").css("max-width", "750px");

	//添加左上角的导航栏
	$("<div id='nav'></div>").prependTo("#container");
	$("#nav").css({"position":"fixed", "top":"5px", "width":"170px", "margin-left": "5px"});

	//主要是给导航栏加链接
	var titles = $(".summary");
	//如果有Example，则把Example放到该API的最后面
	for(var i = 0; i < titles.length; i++){
		var detailsNode = $(titles[i]).next("div");
		var exampleNode = $(titles[i]).children("h2:contains('Example')");
		if(exampleNode){
			$(detailsNode).insertBefore(exampleNode);
		}
		var pNode = $(titles[i]).children("p:contains('API')");
		var h2Node = $(titles[i]).children("h2:first");
		if(pNode && h2Node){
			var phtml = pNode.html();
			if(phtml){
				var tmpName = phtml.substring(0, phtml.indexOf("<")).replace(/\s/g, "").replace("API-", "");
				h2Node.html(tmpName);
			}
		}
	}
	for(var i = titles.length - 1; i >= 0; i--){
		if(titles[i].children[0].nodeName.toLowerCase() !== "h2"){
			continue;
		}
		var sectionNode = titles[i].parentNode.parentNode.parentNode;
		if(sectionNode.id.indexOf("section") !== -1){
			sectionNode.name = sectionNode.id;
		}
		var sectionName = sectionNode.name; 
		$("<p><a href='#"+ sectionName +"' class='source' id='link_"+ sectionName 
				+"'><span class='file_name'>"+ titles[i].children[0].innerHTML +"</span></a></p>").prependTo("#nav");
		$("#link_"+sectionName).css({"float":"left", "width":"170px", "margin-right":"5px", "background":"#CCC", "text-align":"center",
				"height":"24px", "line-height":"24px"});
	}
}
