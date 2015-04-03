package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Commits {
	private List<Commit> commits = new ArrayList<Commit>();

	public Commits() {
		super();
	}
	
	public Commit createCommit() {                              
		Commit commit = new Commit();
		commits.add(commit);
        return commit;
    }

	public List<Commit> getCommits() {
		return commits;
	}

}
