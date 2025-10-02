package com.future.my.common.vo;

import java.util.ArrayList;

public class MailVO {

	private String title;
	private String content;
	private ArrayList<String> email;
	
	public MailVO() {
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public ArrayList<String> getEmail() {
		return email;
	}
	public void setEmail(ArrayList<String> email) {
		this.email = email;
	}
	@Override
	public String toString() {
		return "MailVO [title=" + title + ", content=" + content + ", email=" + email + "]";
	}
	
	
}
