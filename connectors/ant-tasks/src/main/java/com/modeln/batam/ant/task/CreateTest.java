package com.modeln.batam.ant.task;

import java.io.IOException;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.wrapper.TestEntry;

public class CreateTest extends AbstractTestTask {

	@Override
	protected void operation(Object object) {
		try {
			connector.createTest((TestEntry) object);
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}

}
