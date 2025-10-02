package com.future.my.board.web;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.future.my.board.service.boardService;
import com.future.my.board.vo.BoardVO;
import com.future.my.board.vo.ReplyVO;

@Controller
public class BoardController {
	
	@Autowired
	boardService service;
	
	@ExceptionHandler(Exception.class)
	public String errorView(Exception e) {
		e.printStackTrace();
		return "errorView";
	}
	
	@RequestMapping("/boardView")
	public String boardView(Model model) {
		// Model은 spring에서 컨트롤러와 뷰 사이의 데이터를 전달하기 위한 객체
		// Key:value 형태로 저장됨.[배열, 객체, 기본타입 모두 상관없음]
		ArrayList<BoardVO> boardList = service.getBoardList();
		model.addAttribute("boardList", boardList);
		return "board/boardView";
	}
	@RequestMapping("/boardWriteView")
	public String boardWriteView(HttpSession session) {
		if(session.getAttribute("login") == null) {
			return "redirect:/loginView";
		}
		return "board/boardWriteView";
	}
	@RequestMapping("/boardWriteDo")
	public String boardWriteDo(BoardVO vo) throws Exception {
		service.writeBoard(vo);
		return "redirect:/boardView";
	}
	
	@RequestMapping("/getBoard")
	public String getBoard(int boardNo, Model model) throws Exception {
		BoardVO vo = service.getBoard(boardNo);
		model.addAttribute("board", vo);
		ArrayList<ReplyVO> replyList = service.getReplyList(boardNo);
		model.addAttribute("replyList",replyList);
		return "board/boardDetailView";
	}
	
	@RequestMapping("/boardEditView")
	public String boardEditView(int boardNo, Model model) throws Exception {
		BoardVO vo = service.getBoard(boardNo);
		model.addAttribute("board", vo);
		return "board/boardEditView";
	}
	
	@RequestMapping("/boardEditDo")
	public String boardEditDo() {
		//수정 (boardTitle, boardContent)
		return "redirect:/boardView";
	}
	@RequestMapping("/boardDeleteDo")
	public String boardDeleteDo() {
		//삭제 (use_yn='N' , update_dt = SYSDATE)
		return "redirect:/boardView";
	}

	@ResponseBody // java class 객체를 json데이터 형태로 리턴
	@PostMapping("/writeReplyDo")
	public ReplyVO writeReplyDo(@RequestBody ReplyVO vo) throws Exception {
		ReplyVO result = null;
		Date date = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyMMddHHmmssSSS");
		String uniquiId = sdf.format(date);
		vo.setReplyNo(uniquiId);
		//댓글 저장
		service.writeReply(vo);
		//저장된 댓글 조회		
		result = service.getReply(uniquiId);
		return result;
	}
	
	@ResponseBody
	@PostMapping("/delReplyDo")
	public String delReplyDo(String replyNo) {
		System.out.println(replyNo);
		// replys 테이블의 replyNo 
		// del_yn을 'Y'로 업데이트 
		// update건수가 1이라면 정상 S리턴		
		// 아니라면 F 리턴 
		int cnt = service.delReply(replyNo);
		if(cnt == 0) {
			return "F";
		}
		return "S";
	}
	

}
