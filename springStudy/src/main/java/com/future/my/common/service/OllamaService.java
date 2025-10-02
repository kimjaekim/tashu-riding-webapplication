package com.future.my.common.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OllamaService {
	
	private static final String OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
	
	public String askOllama(String prompt) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		
		// 메시지 구조
		List<Map<String, String>> messages = new ArrayList<>(); 
		messages.add(Map.of("role","system","content","너는 '대화의 달인'이야. 언제나 따뜻하고 재치있게 공감하며, 질문에 실용적인 조언을 덧붙여줘"));
		messages.add(Map.of("role","user","content",prompt));
		
		Map<String, Object> request = new HashMap<>();
		request.put("model","llama3.2");
		request.put("messages", messages);
		request.put("stream", false);
		
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
		ResponseEntity<Map> response = restTemplate.exchange(OLLAMA_URL, HttpMethod.POST, entity, Map.class);
		
		Map<String, Object> body = response.getBody();
		if(body == null) return "응답없음";
		Map<String, String> message = (Map<String, String>) body.get("message");
		return message.get("content");
	}

}
