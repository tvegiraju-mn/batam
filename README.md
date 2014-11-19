# Build And Test Automation Management

The BATAM application is a flexible build reporting and monitoring application. 
It integrates with your continuous integration system and allows you to go from a high level to a very detail view of your build and tests execution. 
Ideal for large and complex build systems.

![Figure 1.0 : Architecture Diagram.](https://raw.github.com/ModelN/batam/tree/master/doc/img/architecture_diagram.png)
Figure 1.0 : Architecture Diagram.

As described in Figure 1.0, connectors are connected to your Continuous Integration System. 
It can be [Jenkins](http://jenkins-ci.org/) systems or any other framework. In the future, we will have as many connectors as programming languages for easy of use. 
These [connectors](https://github.com/ModelN/batam/tree/master/connectors are light weight. Their goal is to implement a well defined API and push messages to the message broker following a specific format. 
[Workers](https://github.com/ModelN/batam/tree/master/worker) are consumers of the message broker system. They consume messages, crunch the data by running some analytics and persist reports into a database. 
The [Webapp](https://github.com/ModelN/batam/tree/master/webapp) is just a reporting user interface on top of the database. 
Workers persist data that is then retrieve by the Webapp module.

## Modules
The Batam System is composed of 3 distinct parts.
- Connector used to send information from your build system to the batam system.
- Workers that consume and analyze informations sent by connectors.
- A Web application for visualizing reports.

### [Connectors](https://github.com/ModelN/batam/tree/master/connectors)
Executable connector that provides a set of APIs to push informations from your build system to the system.
So far, we only have one connector built in Java. In the future, we will have many connectors for various programming languages.

- [Java Connector](https://github.com/ModelN/batam/tree/master/connectors/java-connector): Can be used as Java Library or as a command line tool.

This Connector is the agent used in your continuous integration system. Using this agent you can send information to the BATAM application.
Information are pushed to a Message Broker service ([RabbitMQ](http://www.rabbitmq.com/))

### [Worker](https://github.com/ModelN/batam/tree/master/worker)
- Node JS application that process/analyse and crunch informations received by connectors. 
- Multiple workers can be deployed at the same time for scalability.

### [Webapp](https://github.com/ModelN/batam/tree/master/webapp)
Node JS application used to visualize reports.

### [Examples](https://github.com/ModelN/batam/tree/master/examples)
Connector integration examples:
- [Java Project](https://github.com/ModelN/batam/tree/master/examples/java-project) : Maven Base project. Test Suite executed using The [Junit](http://junit.org/) Library.


## Install
- Install a MongoDb database
- Install RabbitMq
- Install, configure and run the webapp module.
- Install, configure and run one or multiple workers.
- Use connectors in your build environment.

## License
The MIT License (MIT)

Copyright (c) 2014 Model N

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.