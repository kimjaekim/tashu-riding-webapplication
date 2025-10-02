package com.future.my.free.vo;

public class FreeBoardVO {
	
	   private int boNo;                 /*글 번호*/
	   private String boTitle;           /*글 제목*/
	   private String boCategory;        /*글 분류 코드*/
	   private String boCategoryNm;      /*글 분류*/
	   private String boWriter;          /*작성자명*/
	   private String boPass;            /*비밀번호*/
	   private String boContent;         /*글 내용*/
	   private String boIp;              /*등록자IP*/
	   private int boHit;                /*조회수*/
	   private String boRegDate;         /*작성일*/
	   private String boModDate;         /*수정일*/
	   
	   public FreeBoardVO() {
	   }

	public int getBoNo() {
		return boNo;
	}

	public void setBoNo(int boNo) {
		this.boNo = boNo;
	}

	public String getBoTitle() {
		return boTitle;
	}

	public void setBoTitle(String boTitle) {
		this.boTitle = boTitle;
	}

	public String getBoCategory() {
		return boCategory;
	}

	public void setBoCategory(String boCategory) {
		this.boCategory = boCategory;
	}

	public String getBoCategoryNm() {
		return boCategoryNm;
	}

	public void setBoCategoryNm(String boCategoryNm) {
		this.boCategoryNm = boCategoryNm;
	}

	public String getBoWriter() {
		return boWriter;
	}

	public void setBoWriter(String boWriter) {
		this.boWriter = boWriter;
	}

	public String getBoPass() {
		return boPass;
	}

	public void setBoPass(String boPass) {
		this.boPass = boPass;
	}

	public String getBoContent() {
		return boContent;
	}

	public void setBoContent(String boContent) {
		this.boContent = boContent;
	}

	public String getBoIp() {
		return boIp;
	}

	public void setBoIp(String boIp) {
		this.boIp = boIp;
	}

	public int getBoHit() {
		return boHit;
	}

	public void setBoHit(int boHit) {
		this.boHit = boHit;
	}

	public String getBoRegDate() {
		return boRegDate;
	}

	public void setBoRegDate(String boRegDate) {
		this.boRegDate = boRegDate;
	}

	public String getBoModDate() {
		return boModDate;
	}

	public void setBoModDate(String boModDate) {
		this.boModDate = boModDate;
	}

	@Override
	public String toString() {
		return "FreeBoardVO [boNo=" + boNo + ", boTitle=" + boTitle + ", boCategory=" + boCategory + ", boCategoryNm="
				+ boCategoryNm + ", boWriter=" + boWriter + ", boPass=" + boPass + ", boContent=" + boContent
				+ ", boIp=" + boIp + ", boHit=" + boHit + ", boRegDate=" + boRegDate + ", boModDate=" + boModDate + "]";
	}
	   
	   
	   
		   
}
