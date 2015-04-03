package com.modeln.batam.ant.task;

import java.io.IOException;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.wrapper.BuildEntry;

public class CreateBuild extends AbstractBuildTask {
	
	@Override
	protected void operation(Object object) {
		try {
			connector.createBuild((BuildEntry) object);
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}
	
}
