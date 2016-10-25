var http = require("http");

var config  = require("./config");
var common = require("./commonUtil");


function get(options,proxyResponse){

	var req = http.request(options, function(serverRes) {

		serverRes.setEncoding('utf8');

		var body = '';
		serverRes.on('data', function (chunk) {
			body += chunk;
		});

		serverRes.on('end', function() {

			var headers = serverRes.headers;
			var serverLocation = headers.location;
			//console.log(serverLocation);
			if(serverRes.statusCode == 302){
				if(serverLocation.indexOf("localhost") != -1 ){

					var reg = new RegExp('localhost.*/','g');
					var regResult = serverLocation.match(reg);

					regResult = regResult[0];

					var	redirctPort ;

					if(common.startWith(regResult,":")){
						regResult = regResult.subStr(1,regResult.length);
						redirctPort = regResult.replace("localhost:" , "");
					}else{
						redirctPort = 80;

						//补充80端口到url
						serverLocation = serverLocation.replace("localhost" , "localhost:80");
					}

				
					if(redirctPort != config.port){
						proxyResponse.write("重定向的端口和指定端口不一致，代理失败！");
						proxyResponse.end();

						return;
					}else{

						serverLocation = serverLocation.replace(redirctPort,config.proxyPort);

						console.log(serverLocation);
						headers.location = serverLocation;

						console.log(headers);
					}

				}
			}

			proxyResponse.writeHead(serverRes.statusCode, headers);
    		proxyResponse.write(body);
    		
    		proxyResponse.end();

    		
  		});
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	req.end();
}






function post(options,postData,proxyRes){

	var req = http.request(options, function(serverRes) {

		serverRes.setEncoding('utf8');

		var body = '';

		serverRes.on('data', function (chunk) {
			body += chunk;
		});

		serverRes.on('end', function() {
    		proxyRes.headers = serverRes.headers;
    		proxyRes.write(body);

    		console.log(body);

    		proxyRes.end();
  		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	// write data to request body
	req.write(postData);
	req.end();
}


exports.get = get;
exports.post = post;