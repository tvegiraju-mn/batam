var amqp = require('amqp');
var util = require('util');
var config = require('./config.js');

var connection = amqp.createConnection({ host: config.message_broker.host });

// Wait for connection to become established.
connection.on('ready', function () {
	console.log('connection is ready');
	// Use the default 'amq.topic' exchange
	connection.exchange('',{confirm: true}, function(exchange){
		console.log('in exchange');
		connection.queue(config.message_broker.queue, {autoDelete:false}, function(queue){
			console.log('Queue '+queue.name+' is open');
			// Catch all messages
			queue.bind('#');

			// Receive messages
			queue.subscribe(function (message) {
				console.log(message.data.toString('utf8'));
			});
		});
	});
});
