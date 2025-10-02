package com.future.my;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

/**
 * Handles requests for the application home page.
 */
@RestController
public class HomeController {
	
	private static final Logger logger = LoggerFactory.getLogger(HomeController.class);
	
	/**
	 * 간단한 테스트 API
	 */
	@GetMapping("/test")
	public String simpleTest() {
		logger.info("Simple test API called");
		return "Spring 서버가 정상 작동합니다!";
	}
	
	/**
	 * JSON 테스트 API
	 */
	@GetMapping("/api/test")
	public ResponseEntity<?> test() {
		logger.info("Test API called");
		return ResponseEntity.ok().body("{\"success\": true, \"message\": \"Spring 서버가 정상 작동합니다!\"}");
	}
	
	/**
	 * 사용자 테스트 API
	 */
	@GetMapping("/api/users/test")
	public ResponseEntity<?> testUsers() {
		logger.info("Test Users API called");
		return ResponseEntity.ok().body("{\"success\": true, \"message\": \"사용자 API가 정상 작동합니다!\"}");
	}
	
}