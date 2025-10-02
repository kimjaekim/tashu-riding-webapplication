package com.future.my.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello! Spring 서버가 정상 작동합니다!";
    }
    
    @GetMapping("/api/hello")
    public String apiHello() {
        return "API 테스트 성공!";
    }
    
    @GetMapping("/test")
    public String simpleTest() {
        return "Spring 서버가 정상 작동합니다!";
    }
    
    @GetMapping("/api/test")
    public ResponseEntity<?> apiTest() {
        logger.info("Test API called");
        return ResponseEntity.ok().body("{\"success\": true, \"message\": \"Spring 서버가 정상 작동합니다!\"}");
    }

    @GetMapping("/api/users/test")
    public ResponseEntity<?> testUsers() {
        logger.info("Test Users API called");
        return ResponseEntity.ok().body("{\"success\": true, \"message\": \"사용자 API가 정상 작동합니다!\"}");
    }
}