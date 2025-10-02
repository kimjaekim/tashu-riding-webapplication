package com.future.my.chat.web;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.future.my.chat.service.ChatService;
import com.future.my.chat.vo.ChatVO;
import com.future.my.chat.vo.RoomVO;
import com.future.my.common.service.OllamaService;
import com.future.my.common.vo.LlamaVO;

@Controller
public class ChatController {

	@Autowired
	ChatService chatService;
	
	@Autowired
	OllamaService ollamaService;
	
	@RequestMapping("/chatListView")
	public String chatListView(Model model) {
		ArrayList<RoomVO> roomList = chatService.getRoomList();
		model.addAttribute("roomList", roomList);
		return "chat/chatListView";
	}
	@RequestMapping("/roomCreateDo")
	public String roomCreateDo(RoomVO vo, RedirectAttributes redirect) {
		chatService.createRoom(vo);
		System.out.println(vo); // 생성 후 방으로 
		redirect.addAttribute("roomNo", vo.getRoomNo());
		return "redirect:/chatView";
	}
	@RequestMapping("/chatView")
	public String chatView(int roomNo, Model model) {
		ArrayList<ChatVO> chatList = chatService.getChatList(roomNo);
		model.addAttribute("roomNo", roomNo);
		model.addAttribute("chatList", chatList);
		return "chat/chatView";
	}
	// 채팅 메세지 저장 및 전달 
	@MessageMapping("/hello/{roomNo}")
	@SendTo("/subscribe/chat/{roomNo}")
	public ChatVO broadcasting(ChatVO vo) {
		System.out.println(vo);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm");
		vo.setSendDate(sdf.format(new Date()));
		chatService.insertChat(vo);
		return vo;
	}
	
	@PostMapping("/askOllama")
	public ResponseEntity<?> askOllama(String prompt){
		String answer = ollamaService.askOllama(prompt);
		return ResponseEntity.ok().body(new LlamaVO(prompt, answer));
	}
	
}
