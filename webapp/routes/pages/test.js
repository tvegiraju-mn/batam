var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var validator = require('validator');
var formatter = config = require('../../util/formatter.js');

/**
 * PAGE path /:build_id/report/:report_id/test/:test_id
 */
exports.show = showTest;

function showTest(req, res, next){
	var findBuild = function (error, build){
		var findReport = function (error, report){
			var findTest = function (error, test){
				
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isEmpty(report) || _.isNull(test)){
					return next('Test '+req.params.test_id+' for report '+req.params.report_id+' in build '+req.params.build_id+' not found.');
				}
				
				//Render page
				res.render('build/report/test/view', {build_id: build.id, build_name: build.name, report_id: report.id, report_name: report.name, test_id: test._id});
			};
		    
			//Handle Error.
			if(error){ 
				return next(error);
			}
			if(_.isEmpty(report) || _.isNull(report)){
				return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
			}
			
			//Fetch test.
			req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id), report_id: req.params.report_id}, findTest);
		
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		if(_.isEmpty(build) || _.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}
		
		//Fetch build report.
		req.collections.reports.findOne({id: req.params.report_id, build_id: build.id}, findReport);
	};
	
	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id || !req.params.test_id){
		return next(new Error('No build_id, report_id or test_id params in url.'));
	}
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
		
	//Fetch query result.
	req.collections.builds.findOne({id: req.params.build_id}, findBuild);
}