package com.future.my.common.vo;

public class MessageVO {
	
	private boolean result;
	private String title;
	private String message;    // 모달 출력 메세지
	private String url;        // 이동 URL
	private String urlTitle;   // 이동 화면명
	
	public MessageVO() {
	}
	
	public MessageVO(boolean result, String title, String message, String url, String urlTitle) {
		this.result = result;
		this.title = title;
		this.message = message;
		this.url = url;
		this.urlTitle = urlTitle;
	}
	
	public boolean isResult() {
		return result;
	}
	public void setResult(boolean result) {
		this.result = result;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public String getUrlTitle() {
		return urlTitle;
	}
	public void setUrlTitle(String urlTitle) {
		this.urlTitle = urlTitle;
	}

	@Override
	public String toString() {
		return "MessageVO [result=" + result + ", title=" + title + ", message=" + message + ", url=" + url
				+ ", urlTitle=" + urlTitle + "]";
	}
	
	
	
	

}
