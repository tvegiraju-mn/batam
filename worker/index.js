var amqp = require('amqp'),
    util = require('util'),
    config = require('./config.js'),
    importer = require('./process/importer.js'),
    bodyParser = require("body-parser"),
    express = require('express'),
    http = require('http'),
    _ = require('underscore'),
    mongoskin = require('mongoskin'),
    HashMap = require('hashmap'),
    Array = require('array');

var dbUrl = process.env.MONGOHQ_URL || config.database.URL,
    db = mongoskin.db(dbUrl, {safe: true}),
    collections = {
        builds: db.collection('builds'),
        buildcriterias: db.collection('buildcriterias'),
        commits: db.collection('commits'),
        reports: db.collection('reports'),
        testcriterias: db.collection('testcriterias'),
        tests: db.collection('tests')};

var app = express();
app.set('port', process.env.PORT || 5000);
app.use( bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit:50000
}));
app.use(bodyParser.json());

//Start the server
var server = http.createServer(app);
var boot = function () {
    server.listen(app.get('port'), function () {
        console.info('Express server listening on port ' + app.get('port'));
    });
};

var shutdown = function () {
    server.close();
};

if (require.main === module) {
    boot();
} else {
    console.info('Running app as a module');
    exports.boot = boot;
    exports.shutdown = shutdown;
    exports.port = app.get('port');
}

app.post('/api/createManualTests', function (req, res) {
    var buildId = req.get('buildId');
    var buildName = req.get('buildName');
    console.log('Request buildId :: ' + buildId);
    console.log('Request buildName :: ' + buildName);
    var body = req.body;
    var totalPassCount = 0;
    var totalFailCount = 0;
    var totalCount = 0;

    var findOrCreateBuild = function (error, build) {
        if (error) {
            console.log("ERROR :: " + error);
        }
        if (_.isNull(build)) {
            console.log("Cannot find a build with :: " + buildId + ". Creating a new build");
            createBuild(buildId, buildName);
        } else {
            console.log("Found build with ID :: " + build.id);
            totalCount = build.tests.value;
            totalFailCount = build.failures.value;
            totalPassCount = build.passes.value;
        }
    };

    collections.builds.findOne({id: buildId}, findOrCreateBuild);

    var map = new HashMap();
    req.body.forEach(function (test) {
        if (map.has(test.report_name)) {
            var testArray = map.get(test.report_name);
            testArray.push(test);
            map.set(test.report_name, testArray);
        } else {
            var newTest = new Array();
            newTest.push(test);
            map.set(test.report_name, newTest);
        }
    });

    map.forEach(function (values, reportName) {

        var passCount = 0;
        var failCount = 0;
        var totalTestCount = 0;

        collections.reports.findOne({build_id: buildId, name: reportName}, (function (error, report) {
            var reportId;
            if (error) {
                console.log("ERROR :: " + error);
            }
            if (_.isNull(report)) {
                console.log("Cannot find the report with buildId:: " + buildId + " and report name :: " + reportName + ". Creating a new Report");
                createReportObject(reportName, buildId, buildName);
                reportId = reportName + buildId;
                reportId = reportId.replace('&', 'and');
                reportId = reportName + buildId.replace('/', 'or');
            } else {
                console.log("Found Report with name :: " + reportName);
                reportId = report.id.replace('&', 'and');
                reportId = report.id.replace('/', 'or');
                passCount = report.tests.passes.value;
                failCount = report.tests.failures.value;
                totalTestCount = report.tests.all.value;
            }
            values.forEach(function (testObject) {
                reportId = reportId.replace('&', 'and');
                reportId = reportId.replace('/', 'or');
                testObject.report_id = reportId;
                collections.tests.findOne({build_id: buildId, report_id: reportId, name: testObject.name}, (function (error, testObj) {
                    if (error) {
                        console.log("ERROR :: " + error);
                    }
                    if (_.isNull(testObj)) {
                        collections.tests.insert(testObject, (function (error, test) {
                            if ("pass" == testObject.status) {
                                passCount++;
                                totalPassCount++;
                            } else {
                                failCount++;
                                totalFailCount++;

                            }
                            totalCount++;
                            //update results of counts at report level
                            reportId = reportId.replace('&', 'and');
                            reportId = reportId.replace('/', 'or');

                            collections.reports.update({id: reportId, build_id: buildId}, {$set: {"tests.all.value": values.length + totalTestCount,
                                "tests.failures.value": failCount, "tests.passes.value": passCount}}, (function (error, count) {

                                if (error) {
                                    console.log("ERROR :: " + error);
                                }
                                else {
                                    console.log("Updated Reports with count :: " + count);
                                }
                            }));
                            //update build with total counts of test cases with pass and fail results
                            collections.builds.update({id: buildId}, {$set: {"tests.value": totalCount,
                                "failures.value": totalFailCount, "passes.value": totalPassCount}}, (function (error, count) {

                                if (error) {
                                    console.log("ERROR :: " + error);
                                }
                                else {
                                    console.log("Updated builds with count :: " + count);
                                }
                            }));

                        }));
                    } else {
                        console.log("Skipping creation of test with name :: " + testObject.name);
                    }
                }));
            });

        }));
    });

    res.end("Successful");
});

function createBuild(buildId, buildName) {
    var build = {};
    build.lifecycle_status = "completed";
    build.description = buildName;
    build.name = buildName;
    build.status = "completed";
    build.next_id = null;
    build.id = buildId;
    build.date = new Date();
    build.end_date = new Date();
    build.duration = {};
    build.duration.value = parseInt(build.end_date.getTime()) - parseInt(build.date.getTime());
    build.duration.trend = 0;
    build.criterias = [];
    build.infos = [];
    build.reports = [];
    build.commits = 0;
    build.tests = {};
    build.tests.value = 0;
    build.failures = {};
    build.failures.value = 0;
    build.passes = {};
    build.passes.value = 0;
    build.previous_id = null;
    collections.builds.insert(build, console.log);
}

function createReportObject(reportName, buildId, buildName) {
    var report = {};
    report.lifecycle_status = "completed";
    report.status = "completed";
    report.next_id = null;
    var name = reportName.replace('&', 'and');
    name = reportName.replace('/', 'or');
    report.name = name;
    report.description = name;
    report.id = name + buildId;
    report.build_id = buildId;
    report.build_name = buildName;
    report.date = new Date();
    report.end_date = new Date();
    report.duration = {};
    report.duration.value = parseInt(report.end_date.getTime()) - parseInt(report.date.getTime());
    report.duration.trend = 0;
    report.logs = {};
    report.tests = {};
    report.tests.all = {};
    report.tests.failures = {};
    report.tests.passes = {};
    report.tests.regressions = {};
    report.tests.all.value= 0;
    report.tests.failures.value= 0;
    report.tests.passes.value= 0;
    report.tests.regressions.value= 0;
    report.isCustomFormatEnabled = false;
    report.customEntry = null;
    report.customFormat = null;
    report.previous_id = null;
    collections.reports.insert(report, (function (error, report) {
        if (error) {
            console.log("ERROR :: " + error);
        }
    }));
}

var connection = amqp.createConnection({url: "amqp://" + config.message_broker.username + ":" + config.message_broker.password + "@" + config.message_broker.host + ":" + config.message_broker.port + "/" + config.message_broker.vhost});

// Wait for connection to become established.
connection.on('ready', function () {
	//console.log('connection is ready');
	// Use the default 'amq.topic' exchange
	connection.exchange('',{confirm: true}, function(exchange){
		//console.log('in exchange');
		connection.queue(config.message_broker.queue, {autoDelete:false}, function(queue){
			//console.log('Queue '+queue.name+' is open');
			// Catch all messages
			queue.bind('#');

			// Receive messages
			queue.subscribe({ ack: true, prefetchCount: 1 }, function (message, headers, deliveryInfo, ack) {
				var object = message.data.toString('utf8');
				importer.process(object, ack);
			});
		});
	});
});
