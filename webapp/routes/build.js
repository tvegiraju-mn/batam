var _ = require('underscore');
var util = require('util');
var validator = require('validator');

function isNullOrUndefined(value){
	return _.isUndefined(value) || _.isNull(value);
}

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

/**
 * PAGE path /
 */
exports.showAll = function(req, res, next){
	res.render('build/list');
}


	
function showBuild(req, res, next){
	var fetchCompletedBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    
	    if(!isNullOrUndefined(build)){
	    	if(build.lifecycle_status == 'completed'){
	    		res.render('build/view', {build_id: req.params.build_id});
	    	}else{
	    		return next(new Error('Build '+req.params.build_id+' not complete.'));
	    	}
	    }else{
	    	return next(new Error('Build '+req.params.build_id+' not found.'));
	    }
	};
	
	//Validate inputs
	if(!req.params.build_id) {
		return next(new Error('No build_id param in url.'));
	}
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+.'));
	}
	
	//Fetch build.
	req.collections.builds.findOne({id: req.params.build_id}, fetchCompletedBuild);
	
}

/**
 * PAGE path /:build_id
 */
exports.show = showBuild;

/**
 * API path /api/builds?<search params>
 */
exports.list = findBuildList; 

function findBuildList(req, res, next){
	var findBuildsWithFilters = function (error, criterias)	{
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    	
	    //Fetch search values for each criterias passed in the request as query params.
	    _.each(criterias, defineFilters, filters);
	    
	    //Fetch all builds and then we filter down in the callback. 
	    //NOTE: for performance reasons we may want to query the db with filters.
	    req.collections.builds.find({lifecycle_status: 'completed'}, 
	    	{_id:0, name:1, id:1, description:1, failures:1, errors:1, date:1, criterias: 1})
	    	.toArray(findCompletedBuildsWithFilters);
	};
	
	var findCompletedBuildsWithFilters = function (error, builds){
		var findLatestBuild = function(element, index, list){
			if(_.isUndefined(latestBuild[element.name])){
				latestBuild[element.name] = element;
			}else{
				latestBuild[element.name] = latestBuild[element.name].date < element.date? element:latestBuild[element.name];
			}
		};
		
		var latestBuild = {};
		var filteredBuilds = [];
		var result = [];
		var filteredBuildsIndex = 0;
		var resultIndex = 0;
		
		//Handle Error.
		if(error) {
			return next(error);
		}
			
		//If no filters need to be applied we return the entire build list.
		if(_.isEmpty(filters)){
			filteredBuilds = builds;
	    }else{
	    	_.each(builds, function(element, index, list){
	    		var criterias = element.criterias;
	    		//convert build criterias on same filter format.
	    		var convertedCriterias = [];
	    		_.each(criterias, function(element, index, list){
	    			this[index] = {};
	    			this[index].name = replaceAll(" ", "_", element.name.toLowerCase());
	    			this[index].value = replaceAll(" ", "_", element.value.toLowerCase());
	    		}, convertedCriterias);
	    		var isValid = true;
	    		_.each(filters, function(element, index, list){
	    			var isContained = false;
	    			for(var j = 0; j < convertedCriterias.length; j++){
	    				if(convertedCriterias[j].name == element.name && convertedCriterias[j].value == element.value){
	    					isContained = true;
	    				}
	    			}
	    			if(!isContained){
	    				isValid = false;
	    			}
	    		}, convertedCriterias);
	    		if(isValid){
	    			filteredBuilds[filteredBuildsIndex] = element;
	    			filteredBuildsIndex++;
	    		}
	    	});
	    }
		
		//Need to keep latest build only.
	    _.each(filteredBuilds, findLatestBuild, latestBuild);
	    	
	    _.each(latestBuild, function addBuildToResult(element, index, list){
	    	result[resultIndex] = element;
	    	resultIndex++;        
	    });
	    
		res.send({builds: result});
	};
	
	var defineFilters = function (element, index, list){
		var currentCriteriaTag = replaceAll(" ", "_", element.name.toLowerCase());
		
		//Fetch params based on their origin (GET or POST).
		var param = null;
		if(!_.isUndefined(req.query[currentCriteriaTag])){
			param = req.query[currentCriteriaTag];
		}else if(!_.isUndefined(req.body[currentCriteriaTag])){
			param = req.body[currentCriteriaTag];
		}
		
		//Create the filter object that contained non null search params with corresponding values submitted either in the search form (POST) or in the URL (GET).
		if(param!= null && !_.isEmpty(param)){
			this[i] = {};
			this[i].name = currentCriteriaTag;
			this[i].value = param;
			i++;
		}
	};
	
	var filters = [];
	var i = 0;
  
	//Fetch build criterias used to filter builds.
	req.collections.buildcriterias.find({}, {name:1}).toArray(findBuildsWithFilters);
}

/**
 * API path /api/criterias/build
 */
exports.search = findCriterias; 

function findCriterias(req, res, next){
	var findBuildCriterias = function (error, criterias){
		//Handle Error.
		if(error) {
			return next(error);
		}

		for(var j = 0; j < criterias.length; j++){
			var currentCriterias = criterias[j].criterias;
			if(!_.isUndefined(currentCriterias)){
				for(var k = 0; k < currentCriterias.length; k++){
					if(_.isUndefined(allCriterias[currentCriterias[k].name])){
						allCriterias[currentCriterias[k].name] = {};
					}
					allCriterias[currentCriterias[k].name][currentCriterias[k].value] = true;
				}
			}
		}
		
		_.each(allCriterias, function addCriteriasNameToResult(element, index, list){
			result[i] = {};
			result[i].name = index;
			var l = 0;
			result[i].values = [];
			_.each(element, function addCriteriasValueToResult(value, index, list){
				result[i].values[l] = index;
				l++;
			}, result);
			i++;
		}, result);
		
		res.send({criterias: result});
	};
	
	var allCriterias = {};
	var result = [];
	var i = 0;
	
	req.collections.builds.find({lifecycle_status: 'completed'}, {_id:0, criterias: 1}).toArray(findBuildCriterias);
}

/**
 * API path /api/builds/:build_id
 */
exports.view = findBuild;

function findBuild(req, res, next){
	var findCompletedBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    	
	    if(_.isNull(build) || build.lifecycle_status != 'completed'){
	    	res.send({build: null});
		}else{
			res.send({build: build});
		}
	    
	};
	
	//Validate inputs
	if(!req.params.build_id) {
		return next(new Error('No build_id param in url.'));
	}
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
		
	req.collections.builds.findOne({id: req.params.build_id}, findCompletedBuild);
}


