# BATAM Worker Module

This module corresponds to the back end of the BATAM application.

## Install and Run

1. Install [Node JS](http://nodejs.org/) (See [how-to-install-nodejs](http://howtonode.org/how-to-install-nodejs) or [node-and-npm-in-30-seconds.sh](https://gist.github.com/isaacs/579814)).
2. Install [MongoDB](http://www.mongodb.org/) (See [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)).
3. Configure the config.js file to point to your RabbitMQ and MongoDB instance.
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

4. Start your server with ```node index.js```.
NOTE: You can run as many workers as you need and each worker can be configured with a distinct configuration.