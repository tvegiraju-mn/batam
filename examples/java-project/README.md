# Java Maven Example Project

The project examples illustrates how to integrate the **[java-connector](https://github.com/ModelN/batam/tree/master/connectors/java-connector)** with your build process.
This project is a **Java Maven project running JUnit tests**.

To track your build using BATAM. You need to run the following script `. scripts/build.sh`.
The **[build.sh](https://github.com/ModelN/batam/blob/master/examples/java-project/scripts/build.sh)** script uses the *java-connector* jar to :
- Create and track build progression while handling errors properly.  
- Delegate the build execution (code compilation, test execution) to *Maven*.
- Start the Build Analysis.

The Java Maven project use the *JUnit* java library to executes tests.
The *java-connector* is used as a java library and integrated with JUnit tests to:
- Create test suites.
- Track and submit test results.
Check out the integration done in [AppTest.java](https://github.com/ModelN/batam/blob/master/examples/java-project/src/test/java/com/modeln/batam/example/javaproject/AppTest.java).

## Build

The project is build using *Maven*. The Java Connector is used as a **Java library** and as a **command line tool**.
As a consequence the Java Connector as been added as a test dependency to the Maven **[pom.xml](https://github.com/ModelN/batam/blob/master/examples/java-project/pom.xml)** file.

```xml
<dependency>
	<groupId>com.modeln.batam</groupId>
	<artifactId>java-connector</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<scope>test</scope>
</dependency>
```

There are no public repository for BATAM connectors. 
As a consequence, you need to build, package and install the java connector to your local Maven repository manually.

To install the java connector to your local Maven repository. Check out the java-connector source code and run the following command
`cd connectors/java-connector; mvn clean package shade:shade install`
It will build and package the *java-connector*. The jar file will be located here `java-connector/target/java-connector-0.0.1-SNAPSHOT.jar`.
The Maven *install* goal will install the *java-connector* jar to your local Maven repository so that it can be seen and used as a dependency by the *java-project*.

At this point, you can build your project using Maven. However, it won't be tracked by the BATAM system. Instead, you need to execute the `. scripts/build.sh` file.
The *build.sh* script use the *java-connector* jar as a command line tool.
Open the *build.sh* file and make sure the **CONNECTOR** variable points to the *java-connector* jar created earlier while installing the *java-connector* jar to your local Maven repository.

