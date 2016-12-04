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

			if(serverRes.statusCode == 302){
				if(serverLocation.indexOf("localhost") != -1 ){

					var reg = new RegExp('localhost.*/','g');
					var regResult = serverLocation.match(reg);

					regResult = regResult[0];

					regResult = regResult.replace("localhost" , "");

					var	redirctPort;

					if(common.startWith(regResult,":")){

						regResult = regResult.substring (1,regResult.length - 1);
						redirctPort = regResult;
					}else{
						redirctPort = 80;

						//补充80端口到url
						serverLocation = serverLocation.replace("localhost" , "localhost:80");
					}

					serverLocation = serverLocation.replace(redirctPort,config.proxyPort);

					headers.location = serverLocation;

				}
			}


			proxyResponse.writeHead(serverRes.statusCode, headers);
    		proxyResponse.write(body);

    		//console.log(body);
    		
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
			
    		proxyRes.writeHead(serverRes.statusCode, serverRes.headers);

    		proxyRes.write(body);

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