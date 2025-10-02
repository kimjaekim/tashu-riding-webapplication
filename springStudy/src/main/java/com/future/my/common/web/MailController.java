package com.future.my.common.web;

import java.util.ArrayList;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.future.my.common.service.MailService;
import com.future.my.common.vo.MailVO;
import com.future.my.member.vo.MemberVO;

@Controller
@EnableAsync  //@Async가 동작할 수 있도록 비동기 기능을 활성화 시키는 어노테이션
public class MailController {

		@Autowired
		private MailService mailService;
		
		@RequestMapping("/mailtest")
		public String test() {
			mailService.sendMail("leeapgil@gmail.com", "메일 테스트", "메일 테스트 본문");
			return "home";
		}
		
		@PostMapping("/sendMailDo")
		public String sendMailDo(MailVO vo) {
			
			ArrayList<String> arr = vo.getEmail();
			for(String email : arr) {
				mailService.sendMail(email, vo.getTitle(), vo.getContent());
			}
			return "home";
		}
		@RequestMapping("/admin")
		public String admin(HttpSession session) {
			MemberVO login = (MemberVO) session.getAttribute("login");
			if(login == null || !login.getMemId().equals("admin")) {
				return "home";
			}
			return "admin";
		}
		
		
}
