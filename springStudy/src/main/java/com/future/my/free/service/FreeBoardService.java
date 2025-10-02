package com.future.my.free.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.future.my.free.dao.IFreeBoardDAO;
import com.future.my.free.vo.FreeBoardSearchVO;
import com.future.my.free.vo.FreeBoardVO;

@Service
public class FreeBoardService {

		@Autowired
		IFreeBoardDAO dao;
		
		public ArrayList<FreeBoardVO> getBoardList(FreeBoardSearchVO searchVO){
			//1.전체 건수 조회
			int totalCount = dao.getTotalRowCount(searchVO);
			//2.세팅
			searchVO.setTotalRowCount(totalCount);
			searchVO.pageSetting();
			//3. firstRow ~ lastRow 까지 조회결과 리턴
			return dao.getBoardList(searchVO);
		}
		
		public FreeBoardVO getBoard(int boNo, HttpSession session) throws Exception {
			FreeBoardVO vo = dao.getBoard(boNo);
			if(vo == null) {
				throw new Exception();
			}
			// 업데이트 해당 게시글의 조회수 bo_hit + 1
			@SuppressWarnings("unchecked")
			Set<Integer>  viewed = (Set<Integer>) session.getAttribute("viewed");
			if(viewed == null) viewed = new HashSet<>();
			if(viewed.add(boNo)) {
				dao.increaseHit(boNo);
				session.setAttribute("viewed", viewed);
			}
			return vo;
		}
		
		public void insertFreeBoard(FreeBoardVO vo) throws Exception {
			int result = dao.insertFreeBoard(vo);
			if(result ==0) {
				throw new Exception();
			}
		}
		
		public int freeBoardUpdate(FreeBoardVO vo) {
			return dao.freeBoardUpdate(vo);
		}

}

