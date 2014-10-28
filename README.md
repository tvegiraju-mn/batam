# Build And Test Automation Management

## Modules
### Connector
- Java connector that provide a set of APIs to push informations from your build system to the system.
- In the future, we may may have many connectors for various programming languages.

This Connector is the agent used in your continuous integration system. Using this agent you can send information to the BATAM application.
Information are pushed to a Message Broker service ([RabbitMQ](http://www.rabbitmq.com/))

### Worker
- Node JS application that process/analyse and crunch informations received by connectors. 
- Multiple workers can be deployed at the same time for scalability.

### Webapp
- Node JS application used to visualize reports.
