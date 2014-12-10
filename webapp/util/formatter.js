exports.formatStatus = function(status){
	if(status == 'pass'){
		return '<span class="label label-success">'+status+'</span>';
	}else if(status == 'fail' || status == 'error'){
		return '<span class="label label-danger">'+status+'</span>';
	}else{
		return '<span class="label label-default">'+status+'</span>';
	}
}

exports.formatRegression = function(status, regression){
	if(status == 'pass'){
		if(regression != 'new'){
			return '<span class="label label-success">'+regression+'</span>';
		}else{
			return '<span class="label label-default">'+regression+'</span>';
		}
	}else if(status == 'fail' || status == 'error'){
		if(regression == 'same'){
			return '<span class="label label-danger">'+regression+'</span>';
		}else if(regression == 'new'){
			return '<span class="label label-warning">'+regression+'</span>';
		}else{
			return '<span class="label label-default">'+regression+'</span>';
		}
	}else{
		return '<span class="label label-default">'+regression+'</span>';
	}
	//Not possible
	return regression;
}

exports.formatTime = function(time){
	if(time.indexOf('h') != -1){
		return '<span class="label label-danger">'+time+'</span>';
	}
	if(time.indexOf('s') != -1){
		return '<span class="label label-success">'+time+'</span>';
	}
	return '<span class="label label-warning">'+time+'</span>';
}