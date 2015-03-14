package com.modeln.batam.junit.listener;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.junit.runner.Description;
import org.junit.runner.Result;
import org.junit.runner.notification.Failure;
import org.junit.runner.notification.RunListener;

import com.modeln.batam.connector.ConnectorHelper;

/**
 * RunListener class to use with the Maven Surefire plugin in order to send test to the batam application.
 * Here is a configuration example.
 * <pre>
 * 	<plugin>
 *  	<groupId>org.apache.maven.plugins</groupId>
 *      <artifactId>maven-surefire-plugin</artifactId>
 *      <version>2.12.4</version>
 *      <configuration>
 *      	<properties>
 *          	<property>
 *              	<name>listener</name>
 *                 	<value>com.modeln.batam.junit.listener.BatamRunListener</value>
 *              </property>
 *          </properties>
 *          <systemPropertyVariables>
 *          	<batam.report.name>Incentives Java build</batam.report.name>
 *              <batam.publish>true</batam.publish>
 *          </systemPropertyVariables>
 *          <testFailureIgnore>true</testFailureIgnore>
 * 		</configuration>
 * 	</plugin>
 * </pre>
 * 
 * The property testFailureIgnore need to be turned on in order to rercord every tests result.
 * 
 * The listener can be configured using 3 properties.
 * <ul>
 * 	<li><b>batam.report.name</b> : Specify the Report Name tests need to be registered into (optional if batam.report.id is defined).</li>
 * 	<li><b>batam.report.id</b> : Specify the Report Id tests need to be registered into (optional if batam.report.name is defined and unique across your BATAM build reports).</li>
 *  <li><b>batam.publish</b> : Publish information to the BATAM system when set to true, Otherwise set to false.</li>
 * </ul>
 * @author gzussa
 *
 */
public class BatamRunListener extends RunListener {
	private final static String BATAM_PUBLISH_PROPERTY = "batam.bublish";
	
	private final static String BATAM_REPORT_ID_PROPERTY = "batam.report.id";
	
	private final static String BATAM_REPORT_NAME_PROPERTY = "batam.report.name";
	
    private Date startDate = null;

    private Date endDate = null;

    public void testStarted(Description description) throws IOException {
        startDate = new Date();
        
        String publish = System.getProperty(BATAM_PUBLISH_PROPERTY);
        String reportId = System.getProperty(BATAM_REPORT_ID_PROPERTY);
        reportId = reportId != null && !reportId.isEmpty() ? reportId : null;
        String reportName = System.getProperty(BATAM_REPORT_NAME_PROPERTY);
        reportName = reportName != null && !reportName.isEmpty() ? reportName : null;
        
        if("true".equals(publish)) {
            ConnectorHelper.createTest(reportId,
            		reportName,
                    description.getClassName() + "." + description.getMethodName(),
                    null,
                    startDate,
                    null,
                    null,
                    null,
                    null);
        }
    }

    public void testFinished(Description description) throws IOException {
        endDate = new Date();
        
        String publish = System.getProperty(BATAM_PUBLISH_PROPERTY);
        String reportId = System.getProperty(BATAM_REPORT_ID_PROPERTY);
        reportId = reportId != null && !reportId.isEmpty() ? reportId : null;
        String reportName = System.getProperty(BATAM_REPORT_NAME_PROPERTY);
        reportName = reportName != null && !reportName.isEmpty() ? reportName : null;
        
        if("true".equals(publish)) {
            ConnectorHelper.updateTest(reportId,
            		reportName,
                    description.getClassName() + "." + description.getMethodName(),
                    null,
                    null,
                    endDate,
                    "pass",
                    null,
                    null,
                    false);
        }
    }

    public void testRunFinished(Result result) throws IOException {
        List<Failure> failures = result.getFailures();
        
        String publish = System.getProperty(BATAM_PUBLISH_PROPERTY);
        String reportId = System.getProperty(BATAM_REPORT_ID_PROPERTY);
        reportId = reportId != null && !reportId.isEmpty() ? reportId : null;
        String reportName = System.getProperty(BATAM_REPORT_NAME_PROPERTY);
        reportName = reportName != null && !reportName.isEmpty() ? reportName : null;
        
        if("true".equals(publish)) {
            for (Iterator<Failure> it = failures.iterator(); it.hasNext(); ) {
                Failure failure = it.next();

                StringWriter errors = new StringWriter();
                failure.getException().printStackTrace(new PrintWriter(errors));
                String exception = errors.toString();

                ConnectorHelper.updateTest(reportId,
                		reportName,
                        failure.getDescription().getClassName() + "." + failure.getDescription().getMethodName(),
                        null,
                        null,
                        null,
                        "fail",
                        null,
                        failure.getException().getMessage() + " " + exception,
                        false);
            }
        }
    }
}
