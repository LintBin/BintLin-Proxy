var http = require("http");
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var config = require("./proxy_lib/config");
var console = require("./proxy_lib/log");
var common = require("./proxy_lib/commonUtil");
var method = require("./proxy_lib/method");
var connector = require("./proxy_lib/connector");



var totalProxy = config.totalProxy;
var serverConfigList = config.proxy;

/*if(JSON.stringify(totalProxy) != "{}"){ 
	http.createServer(function(req, proxyRes){

		var hostname = req.headers.host;

		var id = totalProxy[hostname];

		var requestUrl = req.url;

		for(var i in serverConfigList){
			var serverConfig = serverConfigList[i];

			if(serverConfig.id == id){

				var options = {
					hostname: "localhost",
					port: serverConfig.localProxyPort,
					path: requestUrl,
					headers:req.headers
				}
				var methodStr = req.method.toUpperCase();

				if(methodStr == "POST"){
					options.method = "POST";
					connector.postForward(req,options,proxyRes);
				}

				if(methodStr == "GET"){
					options.method = "GET";
					connector.getForward(options,proxyRes,serverConfig);
				}

			}

		}
		
	}).listen(80);
}*/


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


				connector.postForward(req,options,proxyRes);
				
				return ;
			}

			if(methodStr == "GET"){
				options.method = "GET";

				options.path = ignoreQuestionMark(serverConfig,requestUrl);

				console.log(options.path);
				connector.getForward(options,proxyRes,serverConfig);

			}

		    return ;
		}

		//从本地取数据
		var localWorkspacePath = serverConfig.workspace;

		var localRequestUri = null;
		
		if(localWorkspacePath != "" && localWorkspacePath != undefined){

			if(common.endWith(localWorkspacePath,"/")){

				localWorkspacePath = localWorkspacePath.slice(0,localWorkspacePath.length-1);
			}

			localRequestUri = localWorkspacePath + requestUrl;

		}else{

			localRequestUri = requestUrl;
		}

		localRequestUri = ignoreQuestionMark(serverConfig,localRequestUri);

		fs.readFile(localRequestUri ,function (err, data){
			//如果在本地找不到则到服务器端去找
			if (err){

				var host = serverConfig.remoteServer;
				var port = serverConfig.remotePort;

				console.log("load file from remote server :" );
				console.log(host + ":" + port + requestUrl);

				var options = {
					hostname: host,
					port: port,
					path: requestUrl,
					headers:req.headers
				}

				connector.getForward(options,proxyRes,serverConfig);

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



function ignoreQuestionMark(serverConfig,requestUrl){
	if(serverConfig.ignoreQuestionMark){

		if(requestUrl.indexOf(".html") != -1 || requestUrl.indexOf(".js")!= -1  || requestUrl.indexOf(".css")!= -1  ){
			var questionMarkIndex = requestUrl.indexOf("?");

			if(questionMarkIndex != -1){

				requestUrl = requestUrl.substring(0,questionMarkIndex);

			}
		}
	}

	return requestUrl;
}