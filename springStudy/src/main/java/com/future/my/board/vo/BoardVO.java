package com.future.my.board.vo;

public class BoardVO {

	private int boardNo;
	private String boardTitle;
	private String boardContent;
	private String memId;
	private String memNm;
	private String createDt;
	private String updateDt;

	public BoardVO() {
	}

	public int getBoardNo() {
		return boardNo;
	}

	public void setBoardNo(int boardNo) {
		this.boardNo = boardNo;
	}

	public String getBoardTitle() {
		return boardTitle;
	}

	public void setBoardTitle(String boardTitle) {
		this.boardTitle = boardTitle;
	}

	public String getBoardContent() {
		return boardContent;
	}

	public void setBoardContent(String boardContent) {
		this.boardContent = boardContent;
	}

	public String getMemId() {
		return memId;
	}

	public void setMemId(String memId) {
		this.memId = memId;
	}

	public String getMemNm() {
		return memNm;
	}

	public void setMemNm(String memNm) {
		this.memNm = memNm;
	}

	public String getCreateDt() {
		return createDt;
	}

	public void setCreateDt(String createDt) {
		this.createDt = createDt;
	}

	public String getUpdateDt() {
		return updateDt;
	}

	public void setUpdateDt(String updateDt) {
		this.updateDt = updateDt;
	}

	@Override
	public String toString() {
		return "BoardVO [boardNo=" + boardNo + ", boardTitle=" + boardTitle + ", boardContent=" + boardContent
				+ ", memId=" + memId + ", memNm=" + memNm + ", createDt=" + createDt + ", updateDt=" + updateDt + "]";
	}

}
