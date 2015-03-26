# BATAM Worker Module

This module corresponds to the back end of the BATAM application.

## Install and Run
1. Install [RabbitM](http://www.rabbitmq.com/).
	- Enable the [Management User Interface](https://www.rabbitmq.com/management.html) for ease of use.
	- Create a User with a password (username and password should not be the same!).
	- Create a VHost and give User permission over the created vhost.
	- There is no need to create a Queue since it will be created automatically by the Worker module.
2. Install [Node JS](http://nodejs.org/) (See [how-to-install-nodejs](http://howtonode.org/how-to-install-nodejs) or [node-and-npm-in-30-seconds.sh](https://gist.github.com/isaacs/579814)).
3. Install [MongoDB](http://www.mongodb.org/) (See [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)).
4. Configure the [config.js](https://github.com/ModelN/batam/blob/master/worker/config.js) file to point to your RabbitMQ and MongoDB instance.
	```
	message_broker: {
		host: 'localhost',
		port: 5672, 
		queue: 'batam',
		username : 'batam',
		password : 'batam2',
		vhost : 'batam'
	},
	database:{
		URL: 'mongodb://@localhost:27017/batam' 
	}
	```
	The schema name here is `batam`.

5. Start your server with ```node index.js```.

NOTE: You can run as many workers as you need and each worker can be configured with a distinct configuration.

## Reset MongoDb Database
The easier way to clean the database is to drop every collections. To do so run the following command in Mongo Client:
WARNING: The command below will delete every entries in your database. Data will be lost! 

```
db.tests.drop(); db.builds.drop(); db.testcriterias.drop(); db.buildcriterias.drop(); db.reports.drop(); db.tests.drop(); db.commits.drop(); db.errors.drop()
```

## Error Messages
The Worker can throw various error messages. Error messages are stored in the **errors** collection in MongoDb.
You can see errors in MongoDb Client by using the following command:
```
db.errors.find()
```

Error Entries have the following JSON structure:
```
{	
	name: "error description", 
	date: "ISODate("2015-03-18T01:10:54.799Z")",
	data: {json message sent read from RabbitMQ}
}
```

In the terminal, error messages will be displayed as in the below example:
```
update_test action.
An Error occurred:
	data: { end_date: '1426547301912',
		status: 'pass',
		override: false,
		criterias: null,
		description: null,
		name: 'com.modeln.batam.connector.WorkerTest.createNewBuildAndUpdate',
		report_name: 'WorkerTestSuite',
		report_id: null,
		log: null,
		start_date: '1426547301787' 
	}
	message: Test doesn't exist. Please make sure to create the test using create_test action before to update it.
```

In the above example, we tried to update a test using the **update_test** action. The error description show the JSON data consumed from the RabbitMQ instance. The message describe why this issue happened.
In this case it says "Test doesn't exist. Please make sure to create the test using create_test action before to update it.". 
It means that we are trying to update a test that doesn't exist in the first place. 
To fix this issue, we need to make sure we create the test first.