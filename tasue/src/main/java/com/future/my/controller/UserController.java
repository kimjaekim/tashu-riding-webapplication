package com.future.my.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.future.my.vo.UserVO;
import com.future.my.vo.RideVO;
import com.future.my.service.UserService;
import com.future.my.service.RideService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RideService rideService;
    
    // CORS preflight 요청 처리
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    // 사용자 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody UserVO user) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("사용자 회원가입 요청: {}", user.getUserId());
            
            // 중복 체크
            if (user.getName() != null && userService.isNameDuplicate(user.getName())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이름입니다.");
                logger.warn("이름 중복: {}", user.getName());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            if (user.getEmail() != null && userService.isEmailDuplicate(user.getEmail())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일입니다.");
                logger.warn("이메일 중복: {}", user.getEmail());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            if (user.getPhone() != null && !user.getPhone().trim().isEmpty() && userService.isPhoneDuplicate(user.getPhone())) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 전화번호입니다.");
                logger.warn("전화번호 중복: {}", user.getPhone());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            int result = userService.insertUser(user);
            
            if (result > 0) {
                response.put("success", true);
                response.put("message", "회원가입이 성공적으로 완료되었습니다.");
                response.put("userId", user.getUserId());
                logger.info("사용자 회원가입 성공: {}", user.getUserId());
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "회원가입에 실패했습니다.");
                logger.error("사용자 회원가입 실패");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("사용자 회원가입 오류: ", e);
            response.put("success", false);
            response.put("message", "서버 내부 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 중복 체크 API
    @PostMapping("/check-duplicate")
    public ResponseEntity<Map<String, Object>> checkDuplicate(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String field = request.get("field");
            String value = request.get("value");
            
            if (field == null || value == null) {
                response.put("success", false);
                response.put("message", "필드와 값이 필요합니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            boolean isDuplicate = false;
            if ("name".equals(field)) {
                isDuplicate = userService.isNameDuplicate(value);
            } else if ("email".equals(field)) {
                isDuplicate = userService.isEmailDuplicate(value);
            } else if ("phone".equals(field)) {
                isDuplicate = userService.isPhoneDuplicate(value);
            } else {
                response.put("success", false);
                response.put("message", "지원하지 않는 필드입니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            response.put("success", true);
            response.put("isDuplicate", isDuplicate);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("중복 체크 오류: ", e);
            response.put("success", false);
            response.put("message", "중복 체크 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            
            logger.info("사용자 로그인 시도: {}", email);
            
            UserVO user = userService.loginUserByEmail(email, password);
            if (user != null) {
                response.put("success", true);
                response.put("message", "로그인 성공");
                response.put("user", user);
                logger.info("사용자 로그인 성공: {}", email);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
                logger.warn("사용자 로그인 실패: {}", email);
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("사용자 로그인 오류: ", e);
            response.put("success", false);
            response.put("message", "서버 내부 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 모든 사용자 조회
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<UserVO> users = userService.selectAllUsers();
            response.put("success", true);
            response.put("users", users);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("모든 사용자 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 특정 사용자 조회 (이름 포함)
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("사용자 정보 조회 요청: {}", userId);
            
            UserVO user = userService.selectUserById(userId);
            if (user != null) {
                response.put("success", true);
                response.put("user", user);
                logger.info("사용자 정보 조회 성공: userId={}, name={}", userId, user.getName());
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                logger.warn("사용자 정보 조회 실패: userId={}", userId);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("사용자 정보 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 이름만 조회
    @GetMapping("/{userId}/name")
    public ResponseEntity<Map<String, Object>> getUserName(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserVO user = userService.selectUserById(userId);
            if (user != null) {
                logger.info("🔍 사용자 정보 조회 성공 - userId: {}, name: {}, profileImage: {}", 
                    user.getUserId(), user.getName(), user.getProfileImage());
                logger.info("🔍 프로필 이미지 상세 - null 여부: {}, 빈 문자열 여부: {}, 길이: {}", 
                    user.getProfileImage() == null, 
                    user.getProfileImage() != null && user.getProfileImage().isEmpty(),
                    user.getProfileImage() != null ? user.getProfileImage().length() : 0);
                response.put("success", true);
                response.put("user", user);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("사용자 이름 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 이름 조회 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 통계 조회
    @GetMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserVO user = userService.selectUserById(userId);
            if (user != null) {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalDistance", user.getTotalDistance());
                stats.put("totalPoints", user.getTotalPoints());
                stats.put("totalRides", user.getTotalRides());
                stats.put("totalCO2Saved", user.getCo2Saved());
                
                response.put("success", true);
                response.put("stats", stats);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("사용자 통계 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 순위 조회 (별도 엔드포인트)
    @GetMapping("/{userId}/ranking")
    public ResponseEntity<Map<String, Object>> getUserRanking(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("🔍 사용자 순위 조회 요청: {}", userId);
            
            // 라이딩 기록이 있는지 먼저 확인
            List<RideVO> userRides = rideService.selectRidesByUserId(userId);
            logger.info("🔍 사용자 라이딩 기록 수: {}", userRides != null ? userRides.size() : 0);
            
            if (userRides == null || userRides.isEmpty()) {
                logger.info("🔍 라이딩 기록 없음 - 순위 없음");
                response.put("success", true);
                response.put("hasRanking", false);
                response.put("message", "라이딩 기록이 없습니다.");
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            
            // 순위 조회
            RideVO userRanking = rideService.selectUserRanking(userId);
            if (userRanking != null) {
                logger.info("🔍 순위 조회 성공 - 순위: {}, 포인트: {}", userRanking.getCurrentRank(), userRanking.getPoints());
                response.put("success", true);
                response.put("hasRanking", true);
                response.put("ranking", userRanking);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                logger.info("🔍 순위 조회 결과 없음");
                response.put("success", true);
                response.put("hasRanking", false);
                response.put("message", "순위 정보를 찾을 수 없습니다.");
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        } catch (Exception e) {
            logger.error("사용자 순위 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "순위 조회 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 회원탈퇴
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("🚀 ===== 회원탈퇴 API 호출 시작 =====");
            logger.info("🔍 회원탈퇴 요청: {}", userId);
            
            // 사용자 존재 여부 확인
            logger.info("🔍 사용자 존재 여부 확인 시작");
            UserVO existingUser = userService.selectUserById(userId);
            if (existingUser == null) {
                logger.warn("❌ 사용자를 찾을 수 없음: {}", userId);
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            logger.info("✅ 사용자 존재 확인 완료: {}", existingUser.getName());
            
            // 사용자 삭제
            logger.info("🔍 사용자 삭제 서비스 호출 시작");
            int result = userService.deleteUser(userId);
            logger.info("🔍 사용자 삭제 서비스 결과: {}", result);
            
            if (result > 0) {
                logger.info("🎉 회원탈퇴 성공: {} (삭제된 레코드: {}개)", userId, result);
                response.put("success", true);
                response.put("message", "회원탈퇴가 성공적으로 완료되었습니다.");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                logger.error("❌ 회원탈퇴 실패: {} (삭제된 레코드: {}개)", userId, result);
                response.put("success", false);
                response.put("message", "회원탈퇴에 실패했습니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("회원탈퇴 오류: ", e);
            response.put("success", false);
            response.put("message", "회원탈퇴 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 정보 수정
    @PutMapping("/update-user")
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody Map<String, Object> userData) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("🔍 ===== 사용자 정보 수정 요청 시작 =====");
            logger.info("받은 요청 데이터: {}", userData);
            
            String userId = (String) userData.get("userId");
            String name = (String) userData.get("name");
            String profileImage = (String) userData.get("profileImage");
            
            logger.info("파싱된 데이터 - userId: '{}', name: '{}', profileImage: '{}'", userId, name, profileImage);
            
            if (userId == null || userId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            if (name == null || name.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "이름이 필요합니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            
            // 기존 사용자 정보 조회
            UserVO existingUser = userService.selectUserById(userId);
            if (existingUser == null) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            
            // 이름과 프로필 이미지 업데이트
            existingUser.setName(name.trim());
            logger.info("🔧 프로필 이미지 처리 - profileImage: '{}', null 여부: {}, 빈 문자열 여부: {}", 
                profileImage, profileImage == null, profileImage != null && profileImage.trim().isEmpty());
            
            if (profileImage != null && !profileImage.trim().isEmpty()) {
                existingUser.setProfileImage(profileImage.trim());
                logger.info("🔧 프로필 이미지 설정됨: {}", profileImage.trim().substring(0, Math.min(50, profileImage.trim().length())) + "...");
            } else {
                logger.info("🔧 프로필 이미지가 null이거나 빈 문자열이므로 기존 값 유지");
            }
            
            logger.info("🔧 사용자 정보 업데이트 시도 - userId: {}, name: {}, profileImage: {}", 
                userId, name, existingUser.getProfileImage());
            logger.info("🔧 기존 사용자 정보: {}", existingUser);
            
            int result = userService.updateUser(existingUser);
            logger.info("🔧 업데이트 결과: {}", result);
            
            if (result > 0) {
                response.put("success", true);
                response.put("message", "사용자 정보가 성공적으로 수정되었습니다.");
                response.put("user", existingUser);
                logger.info("✅ 사용자 정보 수정 성공: userId={}, name={}", userId, name);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "사용자 정보 수정에 실패했습니다.");
                logger.error("❌ 사용자 정보 수정 실패: userId={}, result={}", userId, result);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("사용자 정보 수정 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // 사용자 통계 업데이트
    @PutMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Object>> updateUserStats(@PathVariable String userId, @RequestBody Map<String, Object> statsData) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("사용자 통계 업데이트: userId={}, stats={}", userId, statsData);
            
            int result = userService.updateUserStats(userId, statsData);
            if (result > 0) {
                response.put("success", true);
                response.put("message", "사용자 통계가 성공적으로 업데이트되었습니다.");
                logger.info("사용자 통계 업데이트 성공: {}", userId);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("success", false);
                response.put("message", "사용자 통계 업데이트에 실패했습니다.");
                logger.warn("사용자 통계 업데이트 실패: {}", userId);
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("사용자 통계 업데이트 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자 통계 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}