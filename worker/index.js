var amqp = require('amqp');
var util = require('util');
var config = require('./config.js');
var importer = require('./process/importer.js'); 

var connection = amqp.createConnection({url: "amqp://"+config.message_broker.username+":"+config.message_broker.password+"@"+config.message_broker.host+":"+config.message_broker.port+"/"+config.message_broker.vhost});

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
