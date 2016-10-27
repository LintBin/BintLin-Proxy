var http = require("http");
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');

var config = require("./proxy_lib/config");
var console = require("./proxy_lib/log");
var common = require("./proxy_lib/commonUtil");
var method = require("./proxy_lib/method");


http.createServer(function(req, proxyRes){

	var requestUrl = req.url;

	var transferUrls = config.transferUrl;

	var flag = false;

	//配置了以XX开头的则去请求服务器
	for(var i=0;i<transferUrls.length;i++){
		var transferUrl = transferUrls[i];

		if(common.startWith(requestUrl,transferUrl)){
			flag = true;
			break;
		}
	}

	var localFileObj = config.localFile;



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
			hostname: config.server,
			port: config.port,
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
			if(config.ignoreQuestionMark){
				if(requestUrl.indexOf(".html") != -1){
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
	requestUrl = requestUrl.slice(1,requestUrl.length);


	fs.readFile(requestUrl,function (err, data){
		//如果在本地找不到则到服务器端去找
		if (err){

			console.log("404 for this page :" + requestUrl);

			var options = {
				hostname: config.server,
				port: config.port,
				path: "/" + requestUrl,
				headers:req.headers
			}

			
			method.get(options,proxyRes);

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
            proxyRes.end();
        }
	});



}).listen(config.proxyPort);