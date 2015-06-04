var _ = require('underscore');
var util = require('util');
var validator = require('validator');

function isNullOrUndefined(value){
	return _.isUndefined(value) || _.isNull(value);
}

/**
 * PAGE path /
 */
exports.showAll = function(req, res, next){
	res.render('build/list');
}


/**
 * PAGE path /:build_id
 */
exports.show = showBuild;

function showBuild(req, res, next){
	var fetchBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    
	    if(!isNullOrUndefined(build)){
	    	res.render('build/view', {build_id: req.params.build_id});
	    }else{
	    	return next(new Error('Build '+req.params.build_id+' not found.'));
	    }
	};
	
	//Validate inputs
	if(!req.params.build_id) {
		return next(new Error('No build_id param in url.'));
	}
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+.'));
	}
	
	//Fetch build.
	req.collections.builds.findOne({id: req.params.build_id}, fetchBuild);
	
}

/**
 * PAGE path /:build_id/search
 */
exports.search = searchTests;

function searchTests(req, res, next){
	var fetchBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    
	    if(!isNullOrUndefined(build)){
	    	res.render('build/search', {build_id: req.params.build_id});
	    }else{
	    	return next(new Error('Build '+req.params.build_id+' not found.'));
	    }
	};
	
	//Validate inputs
	if(!req.params.build_id) {
		return next(new Error('No build_id param in url.'));
	}
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+.'));
	}
	
	//Fetch build.
	req.collections.builds.findOne({id: req.params.build_id}, fetchBuild);
	
}

