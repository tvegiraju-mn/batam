package com.modeln.batam.ant.task;

import java.io.IOException;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.wrapper.ReportEntry;

public class CreateReport extends AbstractReportTask {

	@Override
	protected void operation(Object object) {
		try {
			connector.createReport((ReportEntry) object);
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}
}
