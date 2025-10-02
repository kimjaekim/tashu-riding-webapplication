package com.future.my.member.web;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.future.my.common.vo.MessageVO;
import com.future.my.member.service.MemberService;
import com.future.my.member.valid.Regist;
import com.future.my.member.vo.MemberVO;

@Controller
public class MemberController {
	
	@Value("#{util['file.upload.path']}")
	private String CURR_IMAGE_PATH;

	@Value("#{util['file.download.path']}")
	private String WEB_PATH;
	
	@Autowired
	MemberService memService;
	
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;
	
	@RequestMapping("/loginView")
	public String loginView() {
		
		return "member/loginView";
		
	}
	@RequestMapping("/loginDo")
	public String loginDo(MemberVO vo,HttpSession session, boolean remember
			             ,HttpServletResponse res) {
		
		try {
			MemberVO user = memService.loginMember(vo);
			boolean match = passwordEncoder.matches(vo.getMemPw(), user.getMemPw());
			if(user== null || !match) {
				return "redirect:/loginView";
			}
			session.setAttribute("login", user);
			// 쿠키 
			if(remember) {
				Cookie cookie = new Cookie("rememberId", user.getMemId());
				res.addCookie(cookie);
			}else {
				Cookie cookie = new Cookie("rememberId", "");
				cookie.setMaxAge(0);  // 유효시간 0
				res.addCookie(cookie);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "errorView";
		}
		return "redirect:/";
	}
	@RequestMapping("/logoutDo")
	public String logoutDo(HttpSession session) {
		session.invalidate();
		return "redirect:/";
	}
	
	@RequestMapping("/registView")
	public String registView(@ModelAttribute("member") MemberVO member) {
		
		return "member/registView";
	}
	
	@RequestMapping("/registDo")
	public String registDo( @Validated(Regist.class) @ModelAttribute("member") MemberVO member
			               ,BindingResult result
			               ,Model model) {
		MessageVO message =null;
		if(result.hasErrors()) {
			return "member/registView";
		}
		member.setMemPw(passwordEncoder.encode(member.getMemPw()));
		try {
			memService.registMember(member);
			message = new MessageVO(true, "회원가입","회원가입 성공!", "/loginView", "로그인");
		} catch (DuplicateKeyException e) {
			message = new MessageVO(false, "회원가입", "중복 아이디 입니다.!", "/registView", "회원가입");
		} catch (DataAccessException e) {
			message = new MessageVO(false, "회원가입", "잘못된 입력입니다.!", "/registView", "회원가입");
		} catch (Exception e) {
			message = new MessageVO(false, "회원가입", "시스템에 문의하세요!", "/registView", "회원가입");
		}
		model.addAttribute("message", message);
		return "home";
	}
	
	@RequestMapping("/mypageView")
	public String mypageView(HttpSession session) {
		if(session.getAttribute("login") == null) {
			return "redirect:/loginView";
		}
		return "member/mypageView";
	}
	@ResponseBody
	@PostMapping("/files/upload")
	public Map<String, String> uploadFile(@RequestParam("uploadImage") MultipartFile file
			                             ,HttpSession session) throws Exception{
		MemberVO vo = (MemberVO) session.getAttribute("login");
		Map<String, String> map = new HashMap<>();
		String imgPath = memService.profileUpload(vo, CURR_IMAGE_PATH
				                                , WEB_PATH, file);
		map.put("imagePath", imgPath);
		map.put("message","success");
		
		return map;
		
	}
}
