# Java Connector

This connector can be used either as a **standalone application** / **command line tool** (CLI) or as a **java library** in your java project.

## Command Line Interface

```
java -jar connector.jar -a <action_name> -f <json_file>
```

This command only has two options:

 - **-a** : Specify an action among the following *"create_build"*, *"update_build"*, *"create_report"*, *"update_report"*, *"create_test"*, *"update_test"* and *"start_analysis"*.
 - **-f** : Specify a JSON file containing data to send to the BATAM system.
 
When using actions **create_build**, **update_build** or **start_analysis**, the JSON file you need to send should corresponds to a **Build json object**.
When using actions **create_report** or **update_report**, the JSON file you need to send should corresponds to a **TestReport json object**.
When using actions **create_test** or **update_test**, the JSON file you need to send should corresponds to a **TestInstance json object**.
 
When integrating with your continuous integration system, you need to make sure that the BATAM system receives the following information.
*A build, with one or multiple reports and one or multiple tests per reports.* 
Whatever the outcome of your build execution is (pass, failed, error, etc...), you need to execute the **start_analysin** action at the very end of your process.

The **start_analysis** action tells the system that the build execution is done and it gives the BATAM system the green light to start crunching and analysis data received. 
If this action is not called, the system will not know the build is over. As a consequence, it will not analyze it until you create a new build version.
 
The Connector doesn't have any particular data validations. It is strongly recommended to send informations for every fields. 
However, it is up to your integration to send informations as part of a *create* or *update* action.
 
During your integration, you need to decide how you will identify your distinct build executions. Here is the list of fields that can be used as identifiers:
 - The *Build json object* has an **id** and **name** fields.
 - The *TestReport json object* has an **id**, **name**, **build_id** and **build_name** fields.
 - The *TestInstance json object* has an **report_id** and **report_name** fields.

 - **build name** and **report name** (including *report build_name* and *test report_name* fields) are mandatory and used to differentiate **build executions** (build for project 1 vs project 2).
 - **build id** and **report id** (including *report build_id* and *test report_id*) are used to differentiate **same build versions**. 

If build for project 1 is executed every 5 minutes but takes 10 minutes to complete, the BATAM system will receive data from the same build and for two versions at the same time (known as parallel build executions).
Ids fields are used to differentiate which data belongs to which build version. If your build is setup to be executed sequentially then you can omit them.
 
It is possible to only send build information with no reports or build and reports with no tests. Just call the **start_analysis** action when you are done sending your data.
However, you can not send test information if you haven't created a report first and you can not create a report if you haven't created a build first.

Any other fields are optional. You can send information in one shot by only calling *create_** actions, or in multiple steps by first calling *create_** actions and one or multiple *update_** actions.
More informations = Better reports in the end.

## Library


## Configure

The `batam.properties` file allows you to configure the following properties:

 - **com.modeln.batam.host=localhost** specify the message broker host
 - **com.modeln.batam.port=5672** specify the message broker port
 - **com.modeln.batam.queue=batam** specify the message broker queue the connector publish data to.
 - **com.modeln.batam.test_mode=off** when set to **on**, it prints messages in your console (stdout) instead of publishing them to the message broker. 

## JSON objects
### Build 
```
{
 		"id" : "Unique identifier",
 		"name" : "Build name (used as identifier in sequential build execution)",
 		"start_date" : "23452345", //Time in millisecond
 		"end_date" : "23452345",
 		"status" : "completed|failed|error| name it",
 		"description" : "Build description",
 		"criterias" : [[Pair](#pair)],
 		"infos" : [[Pairs](#pair])],
 		"reports" : [[Pairs](#pair)],
		"steps" : [[Steps](#step)],
 		"commits" : [[Commits](#commit)],
}
```

### Test Report
```
{
 		"id" : "Report Identifier",
 		"build_id" : "build identifier this test belong to",
 		"build_name" : "build name this test belong to",
 		"name" : "Report name",
 		"description" : "Report description",
 		"start_date" : "12341234", // Time in millisecond
 		"end_date" : "12341234", // Time in millisecond
 		"status" : "completed|failed|error| name it",
 		"logs" : ["list of html link to archived log files"]
}
```

### Test Instance
```
{
		"report_id" : "report identifier this test belong to",
		"report_name" : "report name this test belong to",
		"name" : "package#testname()",
		"start_date" : "12341234", // Time in millisecond
		"end_date" : "12341234", // Time in millisecond
		"status" : "pass|failed|error| name it",
		"log" : "test logs",
		"criterias" : [[Pair](#pair)]
}
```

### Pair
```
{
		"name" : "pair name",
 		"value" : "pair value"
}
```

### Step
```
{
 		"name" : "step name",
 		"start_date" : "12341234", // Time in millisecond
 		"end_date" : "12341234" // Time in millisecond
}
```

### Commit
```
{
		"build_id" : "Build identifier this commit belong to",
 		"build_name" : "Build name this commit belong to",
 		"commit_id" : "647df1d1728f7787c467d93dc5bcbb9de3ec2261",
 		"url" : "https://github.com/user_name/project_name/commit/647df1d1728f7787c467d93dc5bcbb9de3ec2261"
		"author" : "username@company.com",
 		"date_committed" : "23452345" //Time in millisecond
}
``` 
 
## Build

### Maven

java-connector uses [Maven](http://maven.apache.org) to verify each build.  If you are not familiar with Maven, check out the [getting started guide](http://maven.apache.org/guides/getting-started/index.html) for an introduction and installation instructions.

Before submitting a pull request, please run the Maven tasks.  To do so:

First, make sure you can compile without error. 

```
mvn compile
```

Then compile and run tests

```
mvn test
```

Make sure you can generate the jar file

```
mvn package shade:shade
```

You can also install you jar file in your local Maven repository

```
mvn install
```