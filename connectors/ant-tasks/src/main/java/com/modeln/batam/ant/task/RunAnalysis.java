package com.modeln.batam.ant.task;

import java.io.IOException;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.wrapper.BuildEntry;

public class RunAnalysis extends AbstractBuildTask {
	@Override
	protected void operation(Object object) {
		try {
			connector.runAnalysis((BuildEntry) object);
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}
}
