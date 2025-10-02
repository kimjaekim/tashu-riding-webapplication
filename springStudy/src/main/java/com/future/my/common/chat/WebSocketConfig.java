package com.future.my.common.chat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.handler.invocation.HandlerMethodReturnValueHandler;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.messaging.SessionConnectEvent;

@Configuration // spring 설정 클래스 
@EnableWebSocketMessageBroker // websocket 활성화 STOMP 프로토콜 사용
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		// 처음 접속시 연결할 수 있는 포인트 정의
		registry.addEndpoint("/endpoint").withSockJS();
	}
	@Override
	public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
	}
	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
	}
	@Override
	public void configureClientOutboundChannel(ChannelRegistration registration) {
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
	}

	@Override
	public void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> returnValueHandlers) {
	}
	@Override
	public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
		return true;
	}
	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		// subscribe 메세지 라우팅 메세지가 어떻게 라우팅 될지 경로를 매핑
		registry.enableSimpleBroker("/subscribe");
		// spring 내장 메시지 브로커가 자동으로 클라이언트에게 메시지 전송
		registry.setApplicationDestinationPrefixes("/app");
	}

	@Autowired
	SimpMessagingTemplate messageTemp;
	
	@EventListener
	public void handleWebSocketConnectListener(SessionConnectEvent event) {
		StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
		//첫 접속
		String userId = sha.getFirstNativeHeader("userId");
		String roomNo = sha.getFirstNativeHeader("roomNo");
		Map<String, Object> message = new HashMap<>();
		message.put("type", "notification");
		message.put("message",userId + "님이 입장하셨습니다.");
		messageTemp.convertAndSend("/subscribe/chat/"+ roomNo, message);
	}
	
}
