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

	for(var i=0;i<transferUrls.length;i++){
		var transferUrl = transferUrls[i];

		if(common.startWith(requestUrl,transferUrl)){
			flag = true;
			break;
		}
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
				var postData = decodeURIComponent(data);

				options.method = "POST";

				method.post(options,postData,proxyRes);
				
			});
			return ;
		}

		if(methodStr == "GET"){
			options.method = "GET";

			method.get(options,proxyRes);

			/*fs.readFile('',function (err, data){
	    		
	    	});*/
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