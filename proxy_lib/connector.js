var fs = require('fs');

var method = require("./method");
var common = require("./commonUtil");


function readFromLocalFile(localRequestUri,proxyRes){

	try{
		var localFlileData = fs.readFileSync(localRequestUri , 'utf-8');
		
	}catch(e){
		return "";
	}

	return localFlileData;
}



function postForward(request,options,proxyRes){


	var postData ;
	request.on('data',function(data){


		var contentType = request.headers['content-type'];

		if(common.startWith(contentType,"multipart/form-data")){
		
			postData = data;

		}else{

			postData = decodeURIComponent(data);

		}

	});


	request.on('end' , function(){

		options.method = "POST";

		method.post(options,postData,proxyRes);
	});
}


function getForward(options,proxyRes,serverConfig){
	method.get(options,proxyRes,serverConfig);
}


exports.readFromLocalFile = readFromLocalFile;
exports.postForward = postForward;
exports.getForward = getForward;