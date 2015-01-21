var _ = require('underscore');
var util = require('util');
var validator = require('validator');

/**
 * PAGE path /api/commits
 */
exports.list = findCommitList;
	
function findCommitList(req, res, next){
	var checkCompletedBuildExist = function (error, build){
		//Handle Error.
		if(error) {
			return next(error);
		}	
		
		if(_.isNull(build) || build.lifecycle_status != 'completed'){
			res.send({});
		}
	};
	
	var findCommits = function (error, commits){
		var data = [];
		var result = {};
		
		var createCommitListresponse = function (error, count){
			//Handle Error.
	    	if(error) {
		    	return next(error);
		    }

			result.draw = req.query.draw;
			result.recordsTotal = count;
			result.recordsFiltered = count;
			result.data = data
			res.send(result);
		};
		
		if(error) {
			return next(error);
		}
		
		for(var index in commits){
			data[index] = ['<a href="'+commits[index].url+'">'+commits[index].sha+'</a>', commits[index].date_committed.toString(), commits[index].author];      
		}
		
		req.collections.commits.count({build_id: req.query.build_id}, createCommitListresponse);
	};
	
	//Validate inputs
	if(!req.query.build_id || !req.query.draw || !req.query.length || !req.query.start) {
		return next(new Error('No build_id, draw, length or start query params.'));
	}	
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.draw) || !validator.isInt(req.query.draw)){
		return next(new Error('draw param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.length) || !validator.isInt(req.query.length)){
		return next(new Error('length param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.start) || !validator.isInt(req.query.start)){
		return next(new Error('start param should not be null and should be a number.'));
	}
	
	req.collections.builds.findOne({id: req.query.build_id}, checkCompletedBuildExist);
	
	req.collections.commits.find({build_id: req.query.build_id}, {_id:0})
		.limit(parseInt(req.query.length))
		.skip(parseInt(req.query.start))
		.toArray(findCommits);
}

