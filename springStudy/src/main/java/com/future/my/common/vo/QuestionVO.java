package com.future.my.common.vo;

import java.util.ArrayList;

public class QuestionVO {

		private int qId;
		private String qContent;
		
		private ArrayList<OptionVO> options;

		public QuestionVO() {
		}

		public int getqId() {
			return qId;
		}

		public void setqId(int qId) {
			this.qId = qId;
		}

		public String getqContent() {
			return qContent;
		}

		public void setqContent(String qContent) {
			this.qContent = qContent;
		}

		public ArrayList<OptionVO> getOptions() {
			return options;
		}

		public void setOptions(ArrayList<OptionVO> options) {
			this.options = options;
		}

		@Override
		public String toString() {
			return "QuestionVO [qId=" + qId + ", qContent=" + qContent + ", options=" + options + "]";
		}
		
		
		
}
