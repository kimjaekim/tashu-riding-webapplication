package com.future.my.free.web;

import java.util.ArrayList;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.future.my.common.service.CodeService;
import com.future.my.common.vo.CodeVO;
import com.future.my.free.service.FreeBoardService;
import com.future.my.free.vo.FreeBoardSearchVO;
import com.future.my.free.vo.FreeBoardVO;

@Controller
@RequestMapping("/free")
public class FreeBoardController {

	@Autowired
	CodeService codeService;
	
	@Autowired
	FreeBoardService freeService;
	
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	//해당 컨트롤러에서 연결되는 모든 화면에서는 comList 사용가능
	@ModelAttribute("comList")
	public ArrayList<CodeVO> getCodeList(){
		return codeService.getCodeList("BC00");
	}
	@RequestMapping("/test")
	public String test() {
		return "free/test";
	}
	
	@RequestMapping("/freeList")
	public String freeList(Model model
			              //요청과 응답시 (검색조건)데이터를 유지하기 위해 
			            , @ModelAttribute("searchVO") FreeBoardSearchVO searchVO) {
		
		ArrayList<FreeBoardVO> freeList = freeService.getBoardList(searchVO);
		model.addAttribute("freeList", freeList);
		
		return "free/freeList";
	}
	
	@RequestMapping("/freeView")
	public String freeView(int boNo, Model model, HttpSession session) throws Exception {
		
		FreeBoardVO board = freeService.getBoard(boNo, session);
		model.addAttribute("free", board);
		
		return "free/freeView";
	}
	@RequestMapping("/freeForm")
	public String freeView() {

		return "free/freeForm";
	}
	
	@PostMapping("/freeBoardWriteDo")
	public String freeBoardWriteDo(FreeBoardVO vo) throws Exception {
		vo.setBoPass(passwordEncoder.encode(vo.getBoPass()));
		freeService.insertFreeBoard(vo);
		return "redirect:/free/freeList";
	}
	
	@PostMapping("/freePassCheck")
	@ResponseBody
	public String freePassCheck(FreeBoardVO checkVO,HttpSession session) throws Exception {
		FreeBoardVO board = freeService.getBoard(checkVO.getBoNo(), session);
		boolean match = passwordEncoder.matches(checkVO.getBoPass(), board.getBoPass());
		if(match) {
			return "success";
		}
		return "fail";
	}
	
	@PostMapping("/freeBoardUpdateDo")
	@ResponseBody
	public String freeBoardUpdateDo(FreeBoardVO vo) throws Exception {
		System.out.println(vo);
		int cnt = freeService.freeBoardUpdate(vo);
		if(cnt == 1) {
			return "success";
		}
		return "fail";
	}
	
}
