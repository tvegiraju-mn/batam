var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var validator = require('validator');
var formatter = config = require('../../util/formatter.js');

/**
 * API path /api/tests
 */
exports.list = findTestList; 

function findTestList(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			var countTest = function (error, count){
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
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = ['<a href="/'+tests[index].build_id+'/report/'+tests[index].report_id+'/test/'+tests[index]._id+'">'+tests[index].name+'</a>', formatter.formatStatus(tests[index].status), formatter.formatRegression(tests[index].status, tests[index].regression), formatter.formatTime(tests[index].time), tests[index].tags]; 
				for(var i = 0; i < criterias.length; i++){
					var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
					if(!_.isUndefined(tests[index][currentCriterias])){
						data[index][5+i] = tests[index][currentCriterias];
					}else{
						data[index][5+i] = " ";
					}
				}
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count(searchCriterias, countTest);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchObject(req, criterias);
		console.log(util.inspect(searchCriterias));
		//Fetch tests based on defined searchCriterias
		req.collections.tests.find(searchCriterias)
			.limit(parseInt(req.query.length))
			.skip(parseInt(req.query.start))
				.toArray(findTests);
	};
	
	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start || !req.query.build_id){
		return next(new Error('No draw, length, start, build_id or report_id query params.'));
	}
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
	if(!validator.isNull(req.query.report_id)){
		if(!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
			return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
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
	req.collections.testcriterias.find().toArray(findTestCriterias);
}
	
/**
 * API path /api/tests/stat
 */
exports.stat = findStat; 

function findStat(req, res, next){
	var findTestCriterias = function (error, criterias){
		var aggregateTestStat = function (error, stat){
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
		};
		
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
		var searchCriterias = createSearchObject(req, criterias);
		
		//Fetch stats based on search criterias.
		req.collections.tests.group([req.query.graph],
			searchCriterias,
			{count: 0},
			"function(curr, prev){prev.count++;}", 
			aggregateTestStat);
	};
	
	//Validate inputs.
	if(!req.query.build_id || !req.query.graph) {
		return next(new Error('No build_id or graph query params.'));
	}
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(!validator.isNull(req.query.report_id) && !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.graph) || !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')){
		return next(new Error('graph param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Create response object.
	var result = {};
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * Function that create a SearchCriterias object based on query param send in the URL.
 * This Object can be then used to filter result while using MongoDb apis.
 */
function createSearchObject(req, criterias){
	
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
	return searchCriterias;
}

/**
 * API path /api/tests/:test_id
 */
exports.view = findTest;

function findTest(req, res, next){
	var fetchTest = function (error, test){
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
	};
	
	//Validate inputs.
	if(!req.params.test_id) {
		return next(new Error('No test_id param in url.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
	
	//Fetch test requested.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, fetchTest);
}

/**
 * API path /api/tests/criterias
 */
exports.criterias = findTestCriterias;

function findTestCriterias(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			//Handle Error.
			if(error){
				return next(error);
			}
				
			//For each test, we add criterias values to allCriterias objects for each criteria names.
			for(var j = 0; j < tests.length; j++){
				var currentTest = tests[j];
			
				for(var index in allCriterias){
					var convertedIndex = replaceAll(" ","_", index.toLowerCase());
					if(!_.isUndefined(currentTest[convertedIndex]) && !_.isEmpty(currentTest[convertedIndex]) && !_.isNull(currentTest[convertedIndex])){
						allCriterias[index][currentTest[convertedIndex]] = true;
					}
				}
			}
			
			//Convert the allCriterias object (Map<String, List>) to the result object (Array of objects with 2 attributes, name and values, values being of type String[])
			var result = [];
			var i = 0;
			_.each(allCriterias, function addCriteriasNameToResult(element, index, list){
				result[i] = {};
				result[i].name = index;
				var l = 0;
				result[i].values = [];
				_.each(element, function addCriteriasValueToResult(value, index, list){
					//If the criterias is Tag then we split the current test tag value and add distinct value to the value array
					if(result[i].name == 'Tags'){
						var splittedTags = index.split(",");
						for(var splittedTagsIndex = 0; splittedTagsIndex < splittedTags.length; splittedTagsIndex++){
							if(!_.contains(result[i].values, splittedTags[splittedTagsIndex])){
								result[i].values[l] = splittedTags[splittedTagsIndex];
								l++;
							}
						}
					}else{
						result[i].values[l] = index;
						l++;
					}
						
				}, result);
				i++;
			}, result);
			
			//Transform the Tags criterias into a list of distinct values
			var tagsCriterias = result.tag
			//Send result.
			res.send({criterias: result});
		};
		//Handle Error.
		if(error){
			return next(error);
		}
		var allCriterias = {};
		//Add static criterias.
		allCriterias['Status'] = {};
		allCriterias['Regression'] = {};
		allCriterias['Time'] = {};
		allCriterias['Tags'] = {};
		
		//Add dynamic criterias.
		for(var j = 0; j < criterias.length; j++){
			var currentCriterias = criterias[j].name;
			allCriterias[currentCriterias] = {};
		}

		//Fetch all tests for this report or build.
		if(req.query.report_id != null){
			req.collections.tests.find({report_id: req.query.report_id}).toArray(findTests);
		}else{
			req.collections.tests.find({build_id: req.query.build_id}).toArray(findTests);
		}
	};
	
	//Validate inputs.
	if(validator.isNull(req.query.report_id) && validator.isNull(req.query.build_id)){
		return next(new Error('report_id or build_id param should be not null'));
	}
	if(!validator.isNull(req.query.report_id)){
		if(!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
			return next(new Error(req.query.report_id+'report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	if(!validator.isNull(req.query.build_id)){
		if(!validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
			return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	if(validator.isNull(req.query.report_id) && validator.isNull(req.query.build_id)){
		return next(new Error("Either build_id or report_id should be defined"));
	}
	
	
	
	
	//Fetch all tests criterias.
	req.collections.testcriterias.find({type: "criteria"}).toArray(findTestCriterias);
}

/**
 * API path /api/tests/history
 */
exports.history = findTestHistory; 

function findTestHistory(req, res, next){
	var findTest = function (error, test){
		var findTests = function (error, tests){
			var countTest = function (error, count){
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
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = [
	               tests[index].build_id, 
	               tests[index].report_id, 
				   tests[index]._id, 
	               tests[index].start_date, 
	               formatter.formatTime(tests[index].time),
	               formatter.formatStatus(tests[index].status)]; 
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }}, countTest);
		}
		
		if(error){
			return next(error);
		}
		
		//fetch build name
		var test_name = test.name;
		var build_name = test.build_name;
		
		//Fetch all test criterias.
		req.collections.tests.find({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }})
			.sort({start_date: -1})
			.skip(parseInt(req.query.start)).limit(parseInt(req.query.length))
			.toArray(findTests);
	}

	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start){
		return next(new Error('No draw, length, start query params.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.matches(req.params.test_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_name param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
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
	
	//Create response object.
	var result = {};
	//Set draw value.
	result.draw = req.query.draw;
	//Create data obejct array.
	var data = [];

	//Fetch all test criterias.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, findTest)
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

