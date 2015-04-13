function handleError(data){
	//TODO Handle error better
	alert("error "+data); 
}

function handleFailure(data){
	//TODO Handle error better
	alert("fail "+data); 
}

function isNullOrUndefined(value){
	return _.isUndefined(value) || _.isNull(value);
}

function formatWithLabel(value, trend, threshold, isTime){
	if(trend == undefined || trend == null){
		trend = 0;
	}
	if(value <= threshold){
		if(isTime){
			value = durationToStr(value);
		}
		if(trend > 0){
			return '<span class="label label-success">'+value+' <span class="glyphicon glyphicon-chevron-up"></span></span>';
		}else if(trend < 0){
			return '<span class="label label-success">'+value+' <span class="glyphicon glyphicon-chevron-down"></span></span>';
		}else{
			return '<span class="label label-success">'+value+' </span>';
		}
	}
	if(value > 0){
		if(isTime){
			value = durationToStr(value);
		}
		if(trend > 0){
			return '<span class="label label-danger">'+value+' <span class="glyphicon glyphicon-chevron-up"></span></span>';
		}else if(trend < 0){
			return '<span class="label label-warning">'+value+' <span class="glyphicon glyphicon-chevron-down"></span></span>';
		}else{
			return '<span class="label label-warning">'+value+' </span>';
		}
	}else{
		return null;
	}
}

function durationToStr (milliseconds) {
	var result = '';
    var temp = Math.floor(milliseconds / 1000);

    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
    	result += days + ' d ';
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
    	result += hours + ' h ';
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
    	result += minutes + ' m ';
    }
    var seconds = temp % 60;
    if (seconds) {
    	result += seconds + ' sec ';
    }
    if(result == 0){
    	return milliseconds + ' ms ';
    }
    return result; 
}

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

function getUrlParams(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}