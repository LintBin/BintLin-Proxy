var http = require("http");
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var config = require("./proxy_lib/config");
var console = require("./proxy_lib/log");
var common = require("./proxy_lib/commonUtil");
var method = require("./proxy_lib/method");



var totalProxy = config.totalProxy;
if(JSON.stringify(totalProxy) != "{}"){ 
	http.createServer(function(req, proxyRes){

		var hostname = req.headers.host;

		var id = totalProxy[hostname];

		
	}).listen(80);
}

var serverConfigList = config.proxy;
for(var i in serverConfigList){

	var serverConfig = serverConfigList[i];

	initServer(serverConfig);

	console.log("init server ,the port is " + serverConfig.localProxyPort + ",fiished!");
}




function initServer(serverConfig){
	http.createServer(function(req, proxyRes){

		var requestUrl = req.url;

		var transferUrls = serverConfig.transferUrl;

		var flag = false;

		//配置了以XX开头的则去请求服务器
		for(var i=0;i<transferUrls.length;i++){
			var transferUrl = transferUrls[i];

			if(common.startWith(requestUrl,transferUrl)){
				flag = true;
				break;
			}
		}

		var localFileObj = serverConfig.localFile;


		//处理是否指定url的代理
		var temp ;
		if(common.startWith(requestUrl,'/')){
			temp = requestUrl.substring(1,requestUrl.length);
		}

		var fileUrl = localFileObj[temp];

		if(fileUrl != undefined ){
			requestUrl = "/" + fileUrl;
			flag = false;
		}

		//如果需要从服务器请求数据
		if(flag){
			var options = {
				hostname: serverConfig.remoteServer,
				port: serverConfig.remotePort,
				path: requestUrl,
				headers:req.headers
			}

			var methodStr = req.method.toUpperCase();

			if(methodStr == "POST"){

				req.on('data',function(data){

					var contentType = req.headers['content-type'];

					var postData;
					if(common.startWith(contentType,"multipart/form-data")){
					
						postData = data;

					}else{

						postData = decodeURIComponent(data);

					}

					options.method = "POST";

					method.post(options,postData,proxyRes);
					
				});
				return ;
			}

			if(methodStr == "GET"){
				options.method = "GET";

				//是否要忽略掉"?"
				if(serverConfig.ignoreQuestionMark){
					if(requestUrl.indexOf(".html") != -1 || requestUrl.indexOf(".js") || requestUrl.indexOf(".css") ){
						var questionMarkIndex = requestUrl.indexOf("?");
						if(questionMarkIndex != -1){

							requestUrl = requestUrl.substring(0,questionMarkIndex - 1);

						}
					}
				}

				method.get(options,proxyRes);

			}

		    return ;
		}

		//从本地取数据
		var localWorkspacePath = serverConfig.workspace;

		var localRequestUri ;
		
		if(localWorkspacePath != "" && localWorkspacePath != undefined){

			if(common.endWith(localWorkspacePath,"/")){

				localWorkspacePath = localWorkspacePath.slice(0,localWorkspacePath.length-1);
			}

			localRequestUri = localWorkspacePath + requestUrl;

		}else{

			localRequestUri = requestUrl;
		}


		fs.readFile(localRequestUri ,function (err, data){
			//如果在本地找不到则到服务器端去找
			if (err){

				console.log("404 for this page :" + requestUrl);

				var options = {
					hostname: serverConfig.remoteServer,
					port: serverConfig.remotePort,
					path: requestUrl,
					headers:req.headers
				}

				method.get(options,proxyRes,serverConfig);

		    }else{

		    	//在本地找静态资源
		    	var responseHeader = {
		    		"Server":"Apache-Coyote/1.1",
		    	}

		    	if(common.endWith(requestUrl,".html")){
		    		responseHeader['Content-Type'] = "text/html;charset=UTF8";
		    	}

		    	if(common.startWith(requestUrl,".css")){
		    		responseHeader['Content-Type'] = "css/html;charset=UTF8";
		    	}
		    	
		    	responseHeader['Content-Length'] = data.length;

		        proxyRes.writeHead(200, responseHeader);
		        proxyRes.write(data);

		        console.log("local file : " + localRequestUri);
		        proxyRes.end();

			}
		});



	}).listen(serverConfig.localProxyPort);
}



