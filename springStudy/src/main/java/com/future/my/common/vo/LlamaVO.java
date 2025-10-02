package com.future.my.common.vo;

public class LlamaVO {
	
	private String prompt;
	private String answer;
	
	public LlamaVO() {
	}
	
	public LlamaVO(String prompt, String answer) {
		this.prompt = prompt;
		this.answer = answer;
	}
	
	public String getPrompt() {
		return prompt;
	}
	public void setPrompt(String prompt) {
		this.prompt = prompt;
	}
	public String getAnswer() {
		return answer;
	}
	public void setAnswer(String answer) {
		this.answer = answer;
	}

	@Override
	public String toString() {
		return "LlamaVO [prompt=" + prompt + ", answer=" + answer + "]";
	}
	
	
	
	

}
