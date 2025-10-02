package com.future.my.member.dao;

import org.apache.ibatis.annotations.Mapper;

import com.future.my.member.vo.MemberVO;
//mapper xml의 id와 매핑됨
@Mapper
public interface IMemberDAO {
	
	public int registMember(MemberVO vo);
	
	public MemberVO loginMember(MemberVO vo);
	//프로필이미지 
	public int profileUpload(MemberVO vo); 
	
}
