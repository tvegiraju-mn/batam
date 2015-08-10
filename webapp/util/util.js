var _ = require('underscore');
var util = require('util');

/**
 * Function that create a SearchCriterias object based on query param send in the URL.
 * This Object can be then used to filter result while using MongoDb apis.
 */
exports.createSearchObject = function (req, criterias){
	
	var searchCriterias = {};
	//Add static criterias to searchCriterias Object.
	if(!_.isNull(req.query.status) && !_.isUndefined(req.query.status)){
		searchCriterias.status = req.query.status;
	}
	if(!_.isNull(req.query.regression) && !_.isEmpty(req.query.regression)){
		searchCriterias.regression = req.query.regression;
	}
	if(!_.isNull(req.query.time) && !_.isEmpty(req.query.time)){
		searchCriterias.time = req.query.time;
	}
	if(!_.isNull(req.query.tags) && !_.isEmpty(req.query.tags)){
		var tagsList = req.query.tags.split(",");
		searchCriterias.tags = {};
		searchCriterias.tags.$all = tagsList;
	}

	//Add dynamic criterias to searchCriterias Object.
	//Loop through name criterias and convert name field value into searchCriteria attributes set with value fetched from request query.
	for(var i = 0; i < criterias.length; i++){
		var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
		if(!_.isUndefined(req.query[currentCriterias]) && !_.isNull(req.query[currentCriterias]) && !_.isEmpty(req.query[currentCriterias])){
			searchCriterias[currentCriterias] = req.query[currentCriterias];
		}
	}
	if(req.query.report_id != null && req.query.report_id != '' && req.query.report_id != 'null'){
		searchCriterias.report_id = req.query.report_id;	
	}
	if(req.query.build_id != null && req.query.build_id != '' && req.query.build_id != 'null'){
		searchCriterias.build_id = req.query.build_id;	
	}
	if(req.query.build_name != null && req.query.build_name != '' && req.query.build_name != 'null'){
		searchCriterias.build_name = req.query.build_name;	
	}
	return searchCriterias;
}

exports.durationToStr = function (milliseconds) {
	if(milliseconds == null){
		return "0 ms"
	}
	
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
    	result += minutes + ' min ';
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

exports.replaceAll = replaceAll;

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}