package com.modeln.batam.junit.listener;

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
 *          	<batam.build.name>My Build</batam.report.name>
 *          	<batam.report.name>TestSuite Report</batam.report.name>
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
 *  <li><b>batam.build.name</b> : Specify the Build Name reports need to be registered into (optional if batam.build.id is defined).</li>
 *  <li><b>batam.build.id</b> : Specify the Build Id reports need to be registered into (optional if batam.build.name is defined and unique across your BATAM builds).</li>
 * 	<li><b>batam.report.name</b> : Specify the Report Name tests need to be registered into (optional if batam.report.id is defined).</li>
 * 	<li><b>batam.report.id</b> : Specify the Report Id tests need to be registered into (optional if batam.report.name is defined and unique across your BATAM build reports).</li>
 *  <li><b>batam.publish</b> : Publish information to the BATAM system when set to true, Otherwise set to false.</li>
 * </ul>
 * @author gzussa
 *
 */
public class BatamRunListener extends RunListener {
	private final static String BATAM_PUBLISH_PROPERTY = "batam.publish";
	
	private final static String BATAM_REPORT_ID_PROPERTY = "batam.report.id";
	
	private final static String BATAM_REPORT_NAME_PROPERTY = "batam.report.name";
	
	private final static String BATAM_BUILD_ID_PROPERTY = "batam.build.id";
	
	private final static String BATAM_BUILD_NAME_PROPERTY = "batam.build.name";

    public void testRunStarted(Description description) throws Exception {
    	String publish = System.getProperty(BATAM_PUBLISH_PROPERTY);
        String reportId = System.getProperty(BATAM_REPORT_ID_PROPERTY);
        reportId = reportId != null && !reportId.isEmpty() ? reportId : null;
        String reportName = System.getProperty(BATAM_REPORT_NAME_PROPERTY);
        reportName = reportName != null && !reportName.isEmpty() ? reportName : null;
        String buildId = System.getProperty(BATAM_BUILD_ID_PROPERTY);
        buildId = buildId != null && !buildId.isEmpty() ? buildId : null;
        String buildName = System.getProperty(BATAM_BUILD_NAME_PROPERTY);
        buildName = buildName != null && !buildName.isEmpty() ? buildName : null;
        
        if("true".equals(publish)) {
            ConnectorHelper.createReport(reportId, reportName, buildId, buildName, null, new Date(), null, null, null);
        }
    }
    
    public void testStarted(Description description) throws Exception {        
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
                    new Date(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null);
        }
    }

    public void testFinished(Description description) throws Exception {
        
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
                    new Date(),
                    "pass",
                    null,
                    null,
                    null,
                    null,
                    false);
        }
    }

    public void testRunFinished(Result result) throws Exception {
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
                        null, 
                        null,
                        failure.getException().getMessage() + " " + exception,
                        false);
            }
        }
        
        String buildId = System.getProperty(BATAM_BUILD_ID_PROPERTY);
        buildId = buildId != null && !buildId.isEmpty() ? buildId : null;
        String buildName = System.getProperty(BATAM_BUILD_NAME_PROPERTY);
        buildName = buildName != null && !buildName.isEmpty() ? buildName : null;
        
        if("true".equals(publish)) {
            ConnectorHelper.updateReportEndDate(reportId, reportName, buildId, buildName, new Date());
            ConnectorHelper.updateReportStatus(reportId, reportName, buildId, buildName, "completed");
        }
    }
}
