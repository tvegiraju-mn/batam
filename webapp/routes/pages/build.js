var _ = require('underscore');
var util = require('util');
var validator = require('validator');
var PDFKit = require('pdfkit');
var batam_util = config = require('../../util/util.js');

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
exports.show = function (req, res, next){
	searchTests('build/view', req, res, next)
}

/**
 * PAGE path /:build_id/search
 */
exports.search = function (req, res, next){
	searchTests('build/search', req, res, next)
}

/**
 * PAGE path /:build_id/print
 */
exports.print = function (req, res, next){
	searchTests('build/print', req, res, next)
}

function searchTests(view, req, res, next){
	var fetchBuild = function (error, build){
	    //Handle Error.
		if(error) {
	    	return next(error);
	    }
	    
	    if(!isNullOrUndefined(build)){
	    	res.render(view, {build_id: req.params.build_id});
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
 * PAGE path /:build_id/download
 */
exports.download = downloadPDF; 

function downloadPDF(req, res, next){
	var findBuild = function(error, build){
		var findReports = function(error, reports){
			var findTests = function(error, tests){
				//Handle Error.
				if(error){
					return next(error);
				}
				
				//Create a pdf document
				var doc = new PDFKit({bufferPages: true});
				var stream = doc.pipe(res);
				
				//First page (Build infos)
				doc.fillColor('black').fontSize(30).text('Build Report');
				doc.moveDown();
				doc.fontSize(15).text('Build Name', {underline:true, continued: true}).text(': '+build.name, {underline:false});
				doc.moveDown();
				doc.fontSize(15).text('Date', {underline:true, continued: true}).text(': '+build.date, {underline:false});
				doc.moveDown();
				if(!_.isNull(build.duration.value)){
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': '+batam_util.durationToStr(build.duration.value), {underline:false});
				}else{
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}	
				doc.moveDown();
				doc.fontSize(15).text('Total Tests', {underline:true, continued: true}).text(': '+build.tests.value, {underline:false});
				doc.moveDown();
				doc.fontSize(15).text('Passes', {underline:true, continued: true}).text(': '+build.passes.value, {underline:false});
				doc.moveDown();
				if(!_.isUndefined(build.regressions) && !_.isUndefined(build.regressions.value)){
					doc.fontSize(15).text('Regressions', {underline:true, continued: true}).text(': '+build.regressions.value, {underline:false});
				}else{
					doc.fontSize(15).text('Regressions', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}	
				doc.moveDown();
				if(!_.isUndefined(build.failures) && !_.isUndefined(build.failures.value)){
					doc.fontSize(15).text('Failures', {underline:true, continued: true}).text(': '+build.failures.value, {underline:false});
				}else{
					doc.fontSize(15).text('Failures', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}
				doc.moveDown();
				if(!_.isUndefined(build.errors) && !_.isUndefined(build.errors.value)){
					doc.fontSize(15).text('Errors', {underline:true, continued: true}).text(': '+build.errors.value, {underline:false});
				}else{
					doc.fontSize(15).text('Errors', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}
				//Table of Content
				doc.addPage();
				doc.fillColor('black').fontSize(20).text('Table of Content');
				doc.moveDown();
				
				//Summary
				doc.addPage();
				var summaryPage = doc.bufferedPageRange().count -1;
				var initialYAxis = 150;
				doc.fontSize(30).fillColor('black').text('Summary');
				doc.rect(75, initialYAxis, 200, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(275, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(325, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(375, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(425, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(475, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.fontSize(8).fillColor('black').text('Functional Areas', 80, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Tests', 280, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Passes', 330, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Regressions', 380, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Failures', 430, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Errors', 480, initialYAxis + 5);
				var totalTests = 0;
				var totalPasses = 0;
				var totalRegressions = 0;
				var totalFailures = 0;
				var totalErrors = 0;

				var rowPerPage = 20;
				var pageIndex = 1;
				for(var i = 1; i <= reports.length; i++){
					if(pageIndex % rowPerPage == 0){
						doc.addPage();
						pageIndex = 1;
						rowPerPage = 25;
						initialYAxis = 50; 
					}
					doc.rect(75, initialYAxis+(pageIndex*25), 200, 25).fillAndStroke("white", "black");
					doc.rect(275, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
					doc.rect(325, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
					if(reports[i-1].tests.regressions.value != 0){
						doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i-1].tests.failures.value != 0){
						doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i-1].tests.errors.value != 0){
						doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					
					doc.fontSize(9).fillColor('black').text(reports[i-1].name, 80, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.all.value, 280, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.passes.value, 330, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.regressions.value, 380, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.failures.value, 430, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.errors.value, 480, initialYAxis+(pageIndex*25)+5);
					
					totalTests += reports[i-1].tests.all.value;
					totalPasses += reports[i-1].tests.passes.value;
					totalRegressions += reports[i-1].tests.regressions.value;
					totalFailures += reports[i-1].tests.failures.value;
					totalErrors += reports[i-1].tests.errors.value;
					
					pageIndex++;
				}
				doc.rect(75, initialYAxis+(pageIndex*25), 200, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(275, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
				doc.rect(325, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
				if(totalRegressions != 0){
					doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				if(totalFailures != 0){
					doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				if(totalErrors != 0){
					doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				doc.fontSize(9).fillColor('black').text("Total", 80, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalTests, 280, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalPasses, 330, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalRegressions, 380, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalFailures, 430, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalErrors, 480, initialYAxis+(pageIndex*25)+5);
				
				//Tests results per reports
				doc.addPage();
				var reportPage = doc.bufferedPageRange().count -1;
				doc.fontSize(30).fillColor('black').text('Results by Functional Area');
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(20).fillColor('black').text(reports[i].name, {underline:false});
					doc.moveDown();
					doc.fontSize(10).fillColor('black').text('Tests', {underline:true, continued: true}).text(': '+reports[i].tests.all.value+", ", {underline:false, continued: true})
					.text('Pass', {underline:true, continued: true}).text(': '+(reports[i].tests.all.value - reports[i].tests.regressions.value)+", ", {underline:false, continued: true})
					.text('Failures', {underline:true, continued: true}).text(': '+reports[i].tests.regressions.value+", ", {underline:false, continued: true})
					.text('Run Time', {underline:true, continued: true}).text(': '+batam_util.durationToStr(reports[i].duration.value), {underline:false});
					doc.moveDown();
					doc.fontSize(10).text(reports[i].description, {underline:false});
					
					doc.rect(60, 200, 380, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(435, 200, 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(495, 200, 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.fontSize(8).fillColor('black').text('Test Name / Description', 65, 205);
					doc.fontSize(8).fillColor('black').text('Status', 440, 205);
					doc.fontSize(8).fillColor('black').text('Run Time', 500, 205);
					var rowPerPage = 9;
					initialYAxis = 175;
					var pageIndex = 1;
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id){
							if(pageIndex % rowPerPage == 0){
								doc.addPage();
								pageIndex = 1;
								rowPerPage = 12;
								initialYAxis = 50;
							}
						
							if(tests[j].status != 'pass'){
								doc.rect(60, initialYAxis+(pageIndex * 50), 5, 50).fillAndStroke("#990000", "black");
							}else{
								doc.rect(60, initialYAxis+(pageIndex * 50), 5, 50).fillAndStroke("#669966", "black");
							}
							if(pageIndex % 2 == 0){
								doc.rect(65, initialYAxis+(pageIndex * 50), 490, 50).fillAndStroke("white", "black");
							}else{
								doc.rect(65, initialYAxis+(pageIndex * 50), 490, 50).fillAndStroke("#F0F0F0", "black");
							}
								
							if(tests[j].status != 'pass'){
								doc.rect(435, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(435, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#669966", "black");
							}
							doc.rect(495, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("white", "black");
							
							doc.fontSize(6).fillColor('black').text(tests[j].name, 70, initialYAxis + (pageIndex * 50) + 5);
							doc.fontSize(6).fillColor('black').text(tests[j].status, 440, initialYAxis + (pageIndex * 50) + 5);
							doc.fontSize(6).fillColor('black').text(batam_util.durationToStr(tests[j].duration.value), 500, initialYAxis + (pageIndex * 50) + 5);
							
							doc.fontSize(6).fillColor('black').text(tests[j].description == null ? "Description Not Available" : tests[j].description, 70, initialYAxis + (pageIndex * 50) + 30);

							var dynamicFields = 'Criterias: ';
					      	for(var field in tests[j]){
					      		if(field != '_id' &&
					      				field != 'description' &&
					      				field != 'report_id' &&
					      				field != 'name' &&
					      				field != 'start_date' &&
					      				field != 'end_date' &&
					      				field != 'status' &&
					      				field != 'time' &&
					      				field != 'regression' &&
					      				field != 'log' &&
					      				field != 'duration' &&
					      				field != 'steps' &&
					      				field != 'report_name' &&
					      				field != 'build_name' &&
					      				field != 'build_id' &&
					      				field != 'test_suite' &&
					      				field != 'author' &&
					      				field != 'previous_id' &&
					      				field != 'next_id'){
					      			dynamicFields += field+" ";
					      		}
					      	}
					      	doc.fontSize(6).fillColor('black').text(dynamicFields, 70, initialYAxis + (pageIndex * 50) + 40);
							
							pageIndex++;
						}
					}
					//Sub Total
					doc.rect(60, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(120, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(180, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(240, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(300, initialYAxis+(pageIndex * 50), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.fontSize(9).fillColor('black').text('Total', 65, initialYAxis+(pageIndex  * 50) + 5);
					doc.fontSize(9).fillColor('black').text('Pass', 125, initialYAxis+(pageIndex  * 50) + 5);
					doc.fontSize(9).fillColor('black').text('Regressions', 185, initialYAxis+(pageIndex  * 50) + 5);
					doc.fontSize(9).fillColor('black').text('Failues', 245, initialYAxis+(pageIndex  * 50) + 5);
					doc.fontSize(9).fillColor('black').text('Errors', 305, initialYAxis+(pageIndex  * 50) + 5);
					doc.rect(60, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("white", "black");
					doc.rect(120, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("white", "black");
					if(reports[i].tests.regressions.value != 0){
						doc.rect(180, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(180, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i].tests.failures.value != 0){
						doc.rect(240, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(240, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i].tests.errors.value != 0){
						doc.rect(300, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(300, initialYAxis+((pageIndex + 1) * 50) - 25, 60, 25).fillAndStroke("#669966", "black");
					}
					doc.fontSize(10).fillColor('black').text(reports[i].tests.all.value, 65, initialYAxis+((pageIndex + 1)  * 50) - 25 + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.passes.value, 125, initialYAxis+((pageIndex + 1)  * 50) - 25 + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.regressions.value, 185, initialYAxis+((pageIndex + 1)  * 50) - 25 + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.failures.value, 245, initialYAxis+((pageIndex + 1)  * 50) - 25 + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.errors.value, 305, initialYAxis+((pageIndex + 1)  * 50) - 25 + 5);
				}
				
				//Failing test log messages
				doc.addPage();
				var logPage = doc.bufferedPageRange().count -1;
				initialYAxis = 150;
				doc.fontSize(30).fillColor('black').text('Message Logs');
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(20).fillColor('black').text(reports[i].name);
					doc.moveDown();
					doc.fontSize(12).fillColor('black').text('Tests', {underline:true, continued: true}).text(': '+reports[i].tests.all.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Pass', {underline:true, continued: true}).text(': '+(reports[i].tests.passes.value), {underline:false});
					doc.fontSize(12).fillColor('black').text('Regressions', {underline:true, continued: true}).text(': '+(reports[i].tests.regressions.value), {underline:false});
					doc.fontSize(12).fillColor('black').text('Failures', {underline:true, continued: true}).text(': '+reports[i].tests.failures.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Errors', {underline:true, continued: true}).text(': '+reports[i].tests.errors.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Run Time', {underline:true, continued: true}).text(': '+batam_util.durationToStr(reports[i].duration.value), {underline:false});
					doc.moveDown();
					doc.fontSize(9).text(reports[i].description == null ? "No description available" : reports[i].description, {underline:false});
						
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id){
							doc.addPage();
							doc.fontSize(10).fillColor('black').text('Test Name', {underline:true, continued: true}).text(": "+tests[j].name, {underline:false});
							doc.moveDown();
							doc.fontSize(9).text(tests[j].description == null ? "No description available" : tests[j].description, {underline:false, continued: false});
							
							doc.rect(100, initialYAxis+(0 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							if(tests[j].status != 'pass'){
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#669966", "black");
							}			
							doc.fontSize(9).fillColor('black').text("Status", 105, 150 + (0 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(tests[j].status, 205, 150 + (0 * 25) + 5);
							
							doc.rect(100, initialYAxis+(1 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(1 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(9).fillColor('black').text("Start Time", 105, 150 + (1 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(tests[j].start_date+" ms", 205, 150 + (1 * 25) + 5);
							
							doc.rect(100, initialYAxis+(2 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(2 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(9).fillColor('black').text("Duration", 105, 150 + (2 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(batam_util.durationToStr(tests[j].duration.value), 205, 150 + (2 * 25) + 5);
							
							doc.moveDown();
							doc.fontSize(12).fillColor('black').text("Logs:", 65, 250);
							doc.fontSize(8).text(tests[j].log == null ? '' : tests[j].log);
								
						}
					}
				}
				
				//Finish table of content
				doc.switchToPage(1);
				doc.moveDown();
				doc.fillColor('black').fontSize(12).text('Summary',75, 150);
				doc.fillColor('black').fontSize(12).text('Page '+summaryPage, 450, 150);
				doc.fillColor('black').fontSize(12).text('Results By Functional Area',75, 170);
				doc.fillColor('black').fontSize(12).text('Page '+reportPage, 450, 170);
				doc.fillColor('black').fontSize(12).text('Results By Test',75, 190);
				doc.fillColor('black').fontSize(12).text('Page '+logPage, 450, 190);
				
				//Add page numbers
				var range = doc.bufferedPageRange();
				for(var i = range.start; i < range.start + range.count; i++){
					if(i != 0){
						doc.switchToPage(i);
						doc.fontSize(8).text("Page "+(i + 1)+" of "+range.count, 470, 700);
					}
				}
				
				
				// end and display the document in the iframe to the right
				doc.end();
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			if(reports == null){
				return next(new Error('Reports does not exist.'));
			}
			
			//Fetch all build tests
			req.collections.tests.find({build_id : build.id}).toArray(findTests);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		if(build == null){
			return next(new Error('Build does not exist.'));
		}
		
		//Fetch Reports
		req.collections.reports.find({build_id : build.id}).toArray(findReports);
	};
	
	//Validate inputs.
	if(!req.params.build_id){
		return next(new Error('No build_id param in url.'));
	}
	
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Fetch Build
	req.collections.builds.findOne({id : req.params.build_id}, findBuild);
	
}
