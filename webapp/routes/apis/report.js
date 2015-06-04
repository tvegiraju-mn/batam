var _ = require('underscore');
var util = require('util');
var validator = require('validator');

/**
 * API path /api/reports/:report_id
 */
exports.view = findReport;

function findReport(req, res, next){
	var fetchReport = function (error, report){
		var findBuild = function (error, build){
		    //Handle Error.
	    	if(error) {
		    	return next(error);
		    }
		    	
		    if(_.isNull(build)/* || build.lifecycle_status != 'completed'*/){
		    	res.send({report: null});
		    }else{
		    	//Add build previous and next Id to report object.
		    	if(!_.isUndefined(report.previous_id)){
		    		report.build_previous_id = build.previous_id;
		    	}
		    	if(!_.isUndefined(report.next_id)){
		    		report.build_next_id = build.next_id;
		    	}
		    	
		    	res.send({report: report});
		    }
	    };
	    
		//Handle Error.
		if(error) {
	    	return next(error);
	    }
	    
	    if(_.isNull(report)){
	    	res.send({report: null});
	    }
	    
	    req.collections.builds.findOne({id: report.build_id}, findBuild);
	    
	};
	
	//Validate inputs.
	if(!req.params.report_id) {
		return next(new Error('No report_id param in url.'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	req.collections.reports.findOne({id: req.params.report_id}, {_id: 0}, fetchReport);
}

/**
 * API path /api/reports
 */
exports.list = findReportList; 

function findReportList(req, res, next){
	var validateBuild = function (error, build){
		var findReport = function (error, reports){
	    	//Handle Error.
	    	if(error) {
		    	return next(error);
		    }
	    	
		    res.send({reports: reports});
		};
		
		//Handle Error.
    	if(error) {
	    	return next(error);
	    }
    	
	    if(_.isNull(build)){
	    	res.send({reports: []});
	    }
	    
	    req.collections.reports.find({build_id: req.query.build_id}, 
    	{_id:0, id: 1, build_id: 1, name: 1, description: 1, status: 1, duration: 1, date: 1, tests: 1, lifecycle_status: 1})
    		.toArray(findReport);
    };
    
	//Validate inputs
	if(!req.query.build_id) {
		return next(new Error('No build id query param.'));
	}
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	req.collections.builds.findOne({id: req.query.build_id}, validateBuild);
    
}



