var http = require("http");
var config = require("./config");


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(logStr){
	console.log(logStr);
}


function close(){
	rl.close();
}

exports.log = log;
exports.close = close;
