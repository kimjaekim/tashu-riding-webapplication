package com.future.my.member.vo;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import com.future.my.member.valid.Regist;

/**
 * Class Name  : MemberVO
 * Author      : LeeApGil
 * Created Date: 2025. 9. 11.
 * Version: 1.0
 * Purpose: 회원정보 관리 빈
 * Description: VO이지만 DTO처럼 사용
 */
public class MemberVO {
	
	@NotEmpty(message="아이디 필수!!!", groups= {Regist.class})
	private String memId;           /*회원 아이디*/
	@Pattern(regexp="^\\w{4,10}$", message="패스워드는 영문 숫자 4 ~ 10", groups= {Regist.class})
	private String memPw;           /*회원 비번*/
	@Size(min=1, max=20, message="이름 20자 내외로!", groups= {Regist.class})
	private String memNm;           /*회원 이름*/
	private String profileImg;      /*회원 프로필이미지*/
	private String memAddr;         /*회원 주소*/
	//1.생성자
	//2.setter, getter
	//3.toString 
	//Controller에서 바인딩 하려면 setter, 기본 생성자 필수
	public MemberVO() {
	}
	public String getMemId() {
		return memId;
	}
	public void setMemId(String memId) {
		this.memId = memId;
	}
	public String getMemPw() {
		return memPw;
	}
	public void setMemPw(String memPw) {
		this.memPw = memPw;
	}
	public String getMemNm() {
		return memNm;
	}
	public void setMemNm(String memNm) {
		this.memNm = memNm;
	}
	public String getProfileImg() {
		return profileImg;
	}
	public void setProfileImg(String profileImg) {
		this.profileImg = profileImg;
	}
	public String getMemAddr() {
		return memAddr;
	}
	public void setMemAddr(String memAddr) {
		this.memAddr = memAddr;
	}
	@Override
	public String toString() {
		return "MemberVO [memId=" + memId + ", memPw=" + memPw + ", memNm=" + memNm + ", profileImg=" + profileImg
				+ ", memAddr=" + memAddr + "]";
	}
	
	

}
