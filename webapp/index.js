//Load require libraries
var express = require('express'),
  	consolidate = require('consolidate'),
  	routes = require('./routes'),
  	http = require('http'),
  	path =  require('path'),
  	config = require('./config.js'),
  	_ = require('underscore');

var mongoskin = require('mongoskin'),
  	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
  	db = mongoskin.db(dbUrl, {safe:true}),
  	collections = {
    	builds: db.collection('builds'),
    	buildcriterias : db.collection('buildcriterias'),
    	commits: db.collection('commits'),
    	reports: db.collection('reports'),
    	testcriterias: db.collection('testcriterias'),
    	tests: db.collection('tests')
  	};

var logger = require('morgan'),
	errorHandler = require('errorhandler'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');

//Configure settings
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');

//Define middleware
app.use(function(req, res, next){
	if(!collections.builds || !collections.reports || !collections.tests) return next(new Error('No collections.'))
	req.collections = collections;
	return next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

if('development' == app.get('env')){
	app.use(errorHandler());
}

//Define Routes and views
app.get('/', routes.pages.build.showAll);
app.get('/:build_id', routes.pages.build.show);
app.get('/:build_id/print', routes.pages.build.print);
app.get('/:build_id/search', routes.pages.build.search);
app.get('/:build_id/report/:report_id', routes.pages.report.show);
app.get('/:build_id/report/:report_id/download', routes.pages.report.download);
app.get('/:build_id/report/:report_id/test/:test_id', routes.pages.test.show);

//REST API ROUTES
app.get('/api/commits', routes.apis.commit.list);

app.get('/api/builds', routes.apis.build.list);
app.get('/api/builds/criterias', routes.apis.build.criterias);
app.get('/api/builds/:build_id', routes.apis.build.view);

app.get('/api/reports', routes.apis.report.list);
app.get('/api/reports/:report_id', routes.apis.report.view);

app.get('/api/tests', routes.apis.test.list);
app.get('/api/tests/criterias', routes.apis.test.criterias);
app.get('/api/tests/stat', routes.apis.test.stat);
app.get('/api/tests/:test_id', routes.apis.test.view);
app.get('/api/tests/:test_id/history', routes.apis.test.history);

app.post('/api/:build_id/importAttachments', routes.apis.build.importAttachments);
app.get('/:build_id/imagesImportResult/:result', routes.pages.build.show);

//new rest calls for fetching data  from batam for pdf report generation
app.get('/api/testnames/:report_name/:build_id', routes.apis.test.testNames);//api to fetch the test names of  report with a given buildId
app.get('/api/testdescription/:report_name/:build_id', routes.apis.test.testDescriptions);//api to fetch the test case descriptions of  report with a given buildId
app.get('/api/testcaseid/fail/:build_id', routes.apis.test.failTestCaseIds);//api to get the failed TestCaseId for a given build
app.get('/api/reportnames/:build_id', routes.apis.test.reportNames);//api to get the reportnames of all test cases for a build
app.get('/api/tests/:build_id/:report_name/:status', routes.apis.test.testsForaBuildWithStatus);//api to get the tests  for a report with given buildId and Status
app.get('/api/tests/:build_id/:report_name', routes.apis.test.testsForaReport);//api to get the tests  for a report with a given build id
app.get('/api/:build_id/reportIds', routes.apis.test.getReportIds);//api to get the reportIds for a given build

app.all('*', function(req, res){
  res.status(404).end();
});

//Start the server
var server = http.createServer(app);
var boot = function(){
	if (config.screenshotsLocation == config.manualTestcasesScreenshotsLocation)
	{
		console.error('The value of the screenshots location and manual screenshots storage location Must be different, can not start server...')
		return;
	}
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}

var shutdown = function(){
  server.close();
}

if(require.main === module){
  boot();
}else{
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}

//Prototype changes
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

