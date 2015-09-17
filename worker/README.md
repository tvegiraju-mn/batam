# BATAM Worker Module

This module corresponds to the back end of the BATAM application.

## Install and Run
1. Install [RabbitMQ](http://www.rabbitmq.com/).
	- RabbitMQ Server (and its dependencies) based on your operating system (see [documentation](https://www.rabbitmq.com/download.html))
	- start or stop the server using the following command: ```/sbin/service rabbitmq-server stop/start```. (As documented, you can also use ```rabbitmqctl stop/start```)
	- Enable the [Management User Interface](https://www.rabbitmq.com/management.html) for ease of use.
		- Enable plugin with the following command and restart your RabbitMQ Server : ```rabbitmq-plugins enable rabbitmq_management```
		- From the localhost web browser, connect to the web UI ([http://localhost:15672/](http://localhost:15672/)) with default guest account using username/password as guest/guest.
	- Create a User with a password (username and password should not be the same!).
	- Create a VHost and give User permission over the created vhost.
	- There is no need to create a Queue since it will be created automatically by the Worker module.
2. (If not already installed) Install [Node JS](http://nodejs.org/) (See [how-to-install-nodejs](http://howtonode.org/how-to-install-nodejs) or [node-and-npm-in-30-seconds.sh](https://gist.github.com/isaacs/579814)).
3. (If not already installed) Install and start [MongoDB](http://www.mongodb.org/) (See [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)).
	- Make sure to install Python 2.5 at least. Otherwise you will run into an error when you will start the worker.
	- Start MongoDB with the following command: ```mongod``` (Make sure to add your MongoDB bin directory your PATH variable)
	- (Optional) Start your MongoDB client to query your instance: ```mongo```
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
	The schema name for MongoDB is `batam`. MongoDb will create the schema automatically when the worker module will start to write to the database.
	In this configuration, we created a user called batam with password batam2 and a vhost named batam. We gave the batam user all permissions over the batam vhost.
	
5. Install and start your worker module.
	- Fetch Batam source code either by cloning the repository or by manually downloading the source from the GitHub website.
	- Go to the worker folder and run command ```node index.js``` or ```npm start``` to start the server. 
6. Install and deploy the webapp module (See [Documentation](https://github.com/ModelN/batam/tree/master/webapp) ).

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