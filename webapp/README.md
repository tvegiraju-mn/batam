# BATAM Webapp Module

This module corresponds to the front end of the BATAM application.

## Install and Run

1. Install [Node JS](http://nodejs.org/) (See [how-to-install-nodejs](http://howtonode.org/how-to-install-nodejs) or [node-and-npm-in-30-seconds.sh](https://gist.github.com/isaacs/579814)).
2. Install [MongoDB](http://www.mongodb.org/) (See [http://docs.mongodb.org/manual/installation/](http://docs.mongodb.org/manual/installation/)).
3. Configure the config.js file to point to your MongoDB instance.
```
database:{
	URL: 'mongodb://@localhost:27017/batam' 
}
```
The schema name here is `batam`.

4. Start your server with ```node index.js```.
5. Access your application on port 3000.
 