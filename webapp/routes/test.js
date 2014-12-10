var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var validator = require('validator');
var formatter = config = require('../util/formatter.js');

/**
 * PAGE path /:build_id/report/:report_id/test/:test_id
 */
exports.show = function(req, res, next){
	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id || !req.params.test_id){
		return next(new Error('No build_id, report_id or test_id params in url.'));
	}
	if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
		
	//Fetch query result.
	req.collections.builds.findOne({id: req.params.build_id}, function(error, build){
		//Handle Error.
		if(error){
			return next(error);
		}
		if(_.isEmpty(build) || _.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}
		if(build.lifecycle_status != 'completed'){
			return next('Build '+req.params.build_id+' not complete.');
		}
		
		//Fetch build report.
		req.collections.reports.findOne({id: req.params.report_id, build_id: build.id}, function(error, report){
		    
			//Handle Error.
			if(error){ 
		    	return next(error);
		    }
		    if(_.isEmpty(report) || _.isNull(report)){
		    	return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
			}
		    
			//Fetch test.
	    	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id), report_id: req.params.report_id}, function(error, test){
	    		
	    		//Validate query result.
	    		if(error){
	    			return next(error);
	    		}
	    		if(_.isEmpty(report) || _.isNull(test)){
	    			return next('Test '+req.params.test_id+' for report '+req.params.report_id+' in build '+req.params.build_id+' not found.');
	    		}
	    		
	    		//Render page
	    		res.render('build/report/test/view', {build_id: build.id, build_name: build.name, report_id: report.id, report_name: report.name, test_id: test._id});
	    	});
		 
		});
	});
}

/**
 * API path /api/tests
 */
exports.list = function(req, res, next){
	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start || !req.query.build_id || !req.query.report_id){
		return next(new Error('No draw, length, start, build_id or report_id query params.'));
	}
	if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.draw) || !validator.isInt(req.query.draw)){
		return next(new Error('draw param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.length) || !validator.isInt(req.query.length)){
		return next(new Error('length param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.start) || !validator.isInt(req.query.start)){
		return next(new Error('start param should not be null and should be a numbe.r'));
	}
	
	//Create response object.
	var result = {};
	//Set draw value.
	result.draw = req.query.draw;
	//Create data obejct array.
	var data = [];
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(function(error, criterias){
		
		//Handle Error.
		if(error){
			return next(error);
		}
	
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		
		//Fetch tests based on defined searchCriterias
		req.collections.tests.find(searchCriterias).limit(parseInt(req.query.length)).skip(parseInt(req.query.start)).toArray(function(error, tests){
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = ['<a href="/'+req.query.build_id+'/report/'+req.query.report_id+'/test/'+tests[index]._id+'">'+tests[index].name+'</a>', formatter.formatStatus(tests[index].status), formatter.formatRegression(tests[index].status, tests[index].regression), formatter.formatTime(tests[index].time)]; 
				for(var i = 0; i < criterias.length; i++){
					var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
					if(!_.isUndefined(tests[index][currentCriterias])){
						data[index][4+i] = tests[index][currentCriterias];
					}else{
						data[index][4+i] = " ";
					}
				}
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count(searchCriterias, function(error, count){
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isNull(count)){
					count = 0;
				}				
				
				result.recordsTotal = count;
				result.recordsFiltered = count;
				result.data = data;
				//Send result.
				res.send(result);
			});
		});
	});
}
	
/**
 * API path /api/tests/stat
 */
exports.stat = function(req, res, next){
	//Validate inputs.
	if(!req.query.build_id || !req.query.report_id || !req.query.graph) {
		return next(new Error('No build_id, report_id or graph query params.'));
	}
	if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.graph) || !validator.isLength(req.query.graph, 3, 20) || !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 3 and 20 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Create response object.
	var result = {};
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(function(error, criterias){
		
		//Handle Error.
		if(error) {
			return next(error);
		}
		
		//Fetch the graph name that need to be returned.
		var statName;
		if(req.query.graph == 'status'){
			statName = "Status"
		}else if(req.query.graph == 'regression'){
			statName = "Regression"
		}else if(req.query.graph == 'time'){
			statName = "Time"
		}else{
			for(var i = 0; i < criterias.length; i++){
				var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
				if(currentCriterias == req.query.graph){
					statName = criterias[i].name;
				}
			}
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		
		//Fetch stats based on search criterias.
		req.collections.tests.group([req.query.graph],
			searchCriterias,
			{count: 0},
			"function(curr, prev){prev.count++;}", 
			function(error, stat){
				//Handle Error.
				if(error){
					return next(error);
				}
				
				//Set name
				result.name = statName;
				
				//Set Values
				var values = [];
				for(var j = 0; j < stat.length; j++){
					values[j] = {name: stat[j][req.query.graph] == null? "Others": stat[j][req.query.graph] , value : stat[j].count};
				}
				result.values = values;
				
				//Send result.
				res.send({stat: result});
		});
	});
}

/**
 * Function that create a SearchCriterias object based on query param send in the URL.
 * This Object can be then used to filter result while using MongoDb apis.
 */
function createSearchCriterias(req, criterias){
	
	var searchCriterias = {};
	//Add static criterias to searchCriterias Object.
	if(!_.isNull(req.query.status) && !_.isEmpty(req.query.status)){
		searchCriterias.status = req.query.status;
	}
	if(!_.isNull(req.query.regression) && !_.isEmpty(req.query.regression)){
		searchCriterias.regression = req.query.regression;
	}
	if(!_.isNull(req.query.time) && !_.isEmpty(req.query.time)){
		searchCriterias.time = req.query.time;
	}
	console.log("criterias = "+util.inspect(criterias))
	//Add dynamic criterias to searchCriterias Object.
	//Loop through name criterias and convert name field value into searchCriteria attributes set with value fetched from request query.
	for(var i = 0; i < criterias.length; i++){
		var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
		if(!_.isUndefined(req.query[currentCriterias]) && !_.isNull(req.query[currentCriterias]) && !_.isEmpty(req.query[currentCriterias])){
			searchCriterias[currentCriterias] = req.query[currentCriterias];
		}
	}
	console.log(util.inspect(searchCriterias));
	searchCriterias.report_id = req.query.report_id;	
	
	return searchCriterias;
}

/**
 * API path /api/tests/:test_id
 */
exports.view = function(req, res, next){
	//Validate inputs.
	if(!req.params.test_id) {
		return next(new Error('No test_id param in url.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
	
	//Fetch test requested.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, function(error, test){
	    //Handle Error.
		if(error) {
			return next(error);
		}
		var status = test.status;
		test.status = formatter.formatStatus(status);
		test.regression = formatter.formatRegression(status, test.regression);
		test.time = formatter.formatTime(test.time);
		//Send response.
	    res.send({test: test});
	});
}

/**
 * API path /api/criterias/test/:report_id
 */
exports.search = function(req, res, next){
	//Validate inputs.
	if(!req.params.report_id) {
		return next(new Error('No report_id param in url.'));
	}
	if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	var allCriterias = {};
	var result = [];
	var i = 0;
	
	//Fetch all tests criterias.
	req.collections.testcriterias.find().toArray(function(error, criterias){
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Add static criterias.
		allCriterias['Status'] = {};
		allCriterias['Regression'] = {};
		allCriterias['Time'] = {};
		
		//Add dynamic criterias.
		for(var j = 0; j < criterias.length; j++){
			var currentCriterias = criterias[j].name;
			allCriterias[currentCriterias] = {};
		}

		//Fetch all tests for this report.
		req.collections.tests.find({report_id: req.params.report_id}).toArray(function(error, tests){
			//Handle Error.
			if(error){
				return next(error);
			}
				
			//For each test, we add criterias values to allCriterias objects for each criteria names.
			for(var j = 0; j < tests.length; j++){
				var currentTest = tests[j];
			
				for(var index in allCriterias){
					convertedIndex = replaceAll(" ","_", index.toLowerCase());
					if(!_.isUndefined(currentTest[convertedIndex]) && !_.isEmpty(currentTest[convertedIndex]) && !_.isNull(currentTest[convertedIndex])){
						allCriterias[index][currentTest[convertedIndex]] = true;
					}
				}
			}
			
			//Convert the allCriterias object (Map<String, List>) to the result object (Array of objects with 2 attributes, name and values, values being of type String[])
			_.each(allCriterias, function(element, index, list){
				result[i] = {};
				result[i].name = index;
				var l = 0;
				result[i].values = [];
				_.each(element, function(value, index, list){
					result[i].values[l] = index;
					l++;
				}, result);
				i++;
			}, result);
			
			//Send result.
			res.send({criterias: result});
		});
	});
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

