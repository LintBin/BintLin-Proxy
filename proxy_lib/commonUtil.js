

//判断str是否以substr结束
function endWith(str , substr){

	var substrLength = substr.length;

	var endSubStr = str.substr(str-substr,str.length);

	if(endSubStr == substr){
		return true;
	}else{
		return false;
	}
}


//判断str是否以substr开始
function startWith(str , substr){
	var substrLength = substr.length;

	var startSubStr = str.substr(0,substr.length);

	if(startSubStr == substr){
		return true;
	}else{
		return false;
	}
}

exports.endWith = endWith;
exports.startWith = startWith;
