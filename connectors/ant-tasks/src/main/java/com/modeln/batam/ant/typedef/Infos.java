package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Infos {
	private List<Info> infos = new ArrayList<Info>();

	public Infos() {
		super();
	}
	
	public Info createInfo() {                              
		Info info = new Info();
		infos.add(info);
        return info;
    }

	public List<Info> getInfos() {
		return infos;
	}

}
