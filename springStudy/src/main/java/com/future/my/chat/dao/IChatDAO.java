package com.future.my.chat.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import com.future.my.chat.vo.ChatVO;
import com.future.my.chat.vo.RoomVO;

@Mapper
public interface IChatDAO {

	//채팅방 리스트 
	public ArrayList<RoomVO> getRoomList();
	//방생성
	public int createRoom(RoomVO vo);
	//대화 리스트 
	public ArrayList<ChatVO> getChatList(int roomNo);
	//대화 저장
	public int insertChat(ChatVO vo);
	
}
