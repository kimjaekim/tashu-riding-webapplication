package com.future.my.free.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import com.future.my.free.vo.FreeBoardSearchVO;
import com.future.my.free.vo.FreeBoardVO;

@Mapper
public interface IFreeBoardDAO {
	
	//전체 건수
	public int getTotalRowCount(FreeBoardSearchVO searchVO);
	//목록 조회	
	public ArrayList<FreeBoardVO> getBoardList(FreeBoardSearchVO searchVO);
	//게시글 조회
	public FreeBoardVO getBoard(int boNo);
	//게시글 조회 증가
	public int increaseHit(int boNo);
	//작성
	public int insertFreeBoard(FreeBoardVO vo);
	
	public int freeBoardUpdate(FreeBoardVO vo);
}
