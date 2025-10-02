package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.UserVO;
import com.future.my.dao.UserDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserDAO userDAO;
    
    // Oracle 날짜 형식 변환 함수
    private String formatDateForOracle(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }
    
    // 이름 중복 체크
    public boolean isNameDuplicate(String name) {
        try {
            return userDAO.checkNameDuplicate(name) > 0;
        } catch (Exception e) {
            logger.error("이름 중복 체크 오류: ", e);
            return false;
        }
    }
    
    // 이메일 중복 체크
    public boolean isEmailDuplicate(String email) {
        try {
            return userDAO.checkEmailDuplicate(email) > 0;
        } catch (Exception e) {
            logger.error("이메일 중복 체크 오류: ", e);
            return false;
        }
    }
    
    // 전화번호 중복 체크
    public boolean isPhoneDuplicate(String phone) {
        try {
            return userDAO.checkPhoneDuplicate(phone) > 0;
        } catch (Exception e) {
            logger.error("전화번호 중복 체크 오류: ", e);
            return false;
        }
    }
    
    // 사용자 회원가입
    public int insertUser(UserVO user) {
        try {
            // USER_ID 자동 생성 (이미 있으면 사용)
            String userId = user.getUserId();
            if (userId == null || userId.trim().isEmpty()) {
                userId = "user_" + System.currentTimeMillis();
            }
            
            // 필수 필드 검증 및 기본값 설정
            String name = user.getName();
            if (name == null || name.trim().isEmpty()) {
                // Java에서는 substring() 사용
                if (userId.length() > 4) {
                    name = "사용자" + userId.substring(userId.length() - 4);
                } else {
                    name = "사용자" + userId;
                }
            }
            
            String email = user.getEmail();
            if (email == null || email.trim().isEmpty()) {
                email = userId + "@example.com";
            }
            
            String phone = user.getPhone();
            if (phone == null || phone.trim().isEmpty()) {
                phone = "010-0000-0000";
            }
            
            // 정리된 값으로 설정
            user.setUserId(userId);
            user.setName(name.trim());
            user.setEmail(email.trim());
            user.setPhone(phone.trim());
            user.setRole("USER"); // 기본 역할
            
            // 통계 필드 기본값 설정
            user.setTotalDistance(0.0);
            user.setTotalRides(0);
            user.setTotalPoints(0);
            user.setCo2Saved(0.0);
            
            // 날짜 설정
            String currentDate = formatDateForOracle(new Date());
            user.setCreateDate(currentDate);
            user.setUpdateDate(currentDate);
            
            // 프로필 이미지 기본값 설정
            if (user.getProfileImage() == null) {
                user.setProfileImage(""); // 기본값은 빈 문자열
            }
            
            // 모든 필드 값 로깅
            logger.info("=== 사용자 회원가입 데이터 ===");
            logger.info("USER_ID: '{}'", user.getUserId());
            logger.info("NAME: '{}'", user.getName());
            logger.info("EMAIL: '{}'", user.getEmail());
            logger.info("PHONE: '{}'", user.getPhone());
            logger.info("ROLE: '{}'", user.getRole());
            logger.info("TOTAL_DISTANCE: {}", user.getTotalDistance());
            logger.info("TOTAL_RIDES: {}", user.getTotalRides());
            logger.info("TOTAL_POINTS: {}", user.getTotalPoints());
            logger.info("CO2_SAVED: {}", user.getCo2Saved());
            logger.info("CREATE_DATE: '{}'", user.getCreateDate());
            logger.info("UPDATE_DATE: '{}'", user.getUpdateDate());
            logger.info("PROFILE_IMAGE: '{}'", user.getProfileImage());
            logger.info("================================");
            
            int result = userDAO.insertUser(user);
            logger.info("사용자 회원가입 결과: {}", result);
            
            return result;
        } catch (Exception e) {
            logger.error("사용자 회원가입 오류: ", e);
            throw e;
        }
    }
    
    // 사용자 로그인 (userId로)
    public UserVO loginUser(String userId, String password) {
        try {
            logger.info("사용자 로그인 시도 (userId): {}", userId);
            
            UserVO user = userDAO.selectUserById(userId);
            
            if (user != null && user.getPassword().equals(password)) {
                logger.info("사용자 로그인 성공 (userId): {}", userId);
                return user;
            } else {
                logger.warn("사용자 로그인 실패 (userId): {}", userId);
                return null;
            }
        } catch (Exception e) {
            logger.error("사용자 로그인 오류 (userId): ", e);
            return null;
        }
    }
    
    // 사용자 로그인 (email로)
    public UserVO loginUserByEmail(String email, String password) {
        try {
            logger.info("사용자 로그인 시도 (email): {}", email);
            
            UserVO user = userDAO.selectUserByEmail(email);
            
            if (user != null && user.getPassword().equals(password)) {
                logger.info("사용자 로그인 성공 (email): {}", email);
                return user;
            } else {
                logger.warn("사용자 로그인 실패 (email): {}", email);
                return null;
            }
        } catch (Exception e) {
            logger.error("사용자 로그인 오류 (email): ", e);
            return null;
        }
    }
    
    // 모든 사용자 조회
    public List<UserVO> selectAllUsers() {
        return userDAO.selectAllUsers();
    }
    
    // 특정 사용자 조회
    public UserVO selectUserById(String userId) {
        try {
            logger.info("사용자 정보 조회: {}", userId);
            return userDAO.selectUserById(userId);
        } catch (Exception e) {
            logger.error("사용자 정보 조회 오류: ", e);
            return null;
        }
    }
    
    // 이메일로 사용자 조회
    public UserVO selectUserByEmail(String email) {
        try {
            logger.info("이메일로 사용자 정보 조회: {}", email);
            return userDAO.selectUserByEmail(email);
        } catch (Exception e) {
            logger.error("이메일로 사용자 정보 조회 오류: ", e);
            return null;
        }
    }
    
    // 사용자 정보 수정
    public int updateUser(UserVO user) {
        try {
            logger.info("🔧 ===== UserService 사용자 정보 수정 시작 =====");
            logger.info("🔧 수정할 사용자 정보: userId={}, name={}", user.getUserId(), user.getName());
            
            user.setUpdateDate(formatDateForOracle(new Date()));
            logger.info("🔧 UPDATE_DATE 설정: {}", user.getUpdateDate());
            
            int result = userDAO.updateUser(user);
            logger.info("🔧 DAO 업데이트 결과: {}", result);
            
            return result;
        } catch (Exception e) {
            logger.error("❌ UserService 사용자 정보 수정 오류: ", e);
            e.printStackTrace();
            throw e;
        }
    }
    
    // 사용자 통계 업데이트
    public int updateUserStats(String userId, Map<String, Object> statsData) {
        try {
            logger.info("사용자 통계 업데이트: userId={}, stats={}", userId, statsData);
            
            // 통계 데이터를 UserVO에 설정
            UserVO user = new UserVO();
            user.setUserId(userId);
            
            if (statsData.containsKey("totalDistance")) {
                user.setTotalDistance((Double) statsData.get("totalDistance"));
            }
            if (statsData.containsKey("totalRides")) {
                user.setTotalRides((Integer) statsData.get("totalRides"));
            }
            if (statsData.containsKey("totalPoints")) {
                user.setTotalPoints((Integer) statsData.get("totalPoints"));
            }
            if (statsData.containsKey("totalCO2Saved")) {
                user.setCo2Saved((Double) statsData.get("totalCO2Saved"));
            }
            
            user.setUpdateDate(formatDateForOracle(new Date()));
            
            return userDAO.updateUserStats(user);
        } catch (Exception e) {
            logger.error("사용자 통계 업데이트 오류: ", e);
            throw e;
        }
    }
    
    // 사용자 삭제 (회원탈퇴) - 연관 데이터와 함께 삭제
    public int deleteUser(String userId) {
        try {
            logger.info("🔍 사용자 삭제 요청 (연관 데이터 포함): {}", userId);
            
            int totalDeleted = 0;
            
            // 1. 라이딩 기록 삭제
            try {
                logger.info("🔍 1단계: 라이딩 기록 삭제 시작");
                int rideDeleted = userDAO.deleteUserWithRelatedData(userId);
                logger.info("✅ 라이딩 기록 삭제: {}개", rideDeleted);
                totalDeleted += rideDeleted;
            } catch (Exception e) {
                logger.error("❌ 라이딩 기록 삭제 중 오류: ", e);
                logger.warn("라이딩 기록 삭제 중 오류 (무시): {}", e.getMessage());
            }
            
            // 2. 게시글 댓글 삭제 (테이블이 존재하는 경우에만)
            try {
                logger.info("🔍 2단계: 게시글 댓글 삭제 시작");
                int commentsDeleted = userDAO.deleteUserComments(userId);
                logger.info("✅ 댓글 삭제: {}개", commentsDeleted);
                totalDeleted += commentsDeleted;
            } catch (Exception e) {
                logger.warn("⚠️ 댓글 삭제 중 오류 (테이블이 존재하지 않을 수 있음): {}", e.getMessage());
            }
            
            // 3. 게시글 삭제 (테이블이 존재하는 경우에만)
            try {
                logger.info("🔍 3단계: 게시글 삭제 시작");
                int boardsDeleted = userDAO.deleteUserBoards(userId);
                logger.info("✅ 게시글 삭제: {}개", boardsDeleted);
                totalDeleted += boardsDeleted;
            } catch (Exception e) {
                logger.warn("⚠️ 게시글 삭제 중 오류 (테이블이 존재하지 않을 수 있음): {}", e.getMessage());
            }
            
            // 4. 게시글 조회 기록 삭제 (테이블이 존재하는 경우에만)
            try {
                logger.info("🔍 4단계: 게시글 조회 기록 삭제 시작");
                int viewsDeleted = userDAO.deleteUserBoardViews(userId);
                logger.info("✅ 조회 기록 삭제: {}개", viewsDeleted);
                totalDeleted += viewsDeleted;
            } catch (Exception e) {
                logger.warn("⚠️ 조회 기록 삭제 중 오류 (테이블이 존재하지 않을 수 있음): {}", e.getMessage());
            }
            
            // 4-1. 게시글 좋아요 삭제 (가장 먼저 삭제!)
            try {
                logger.info("🔍 4-1단계: 게시글 좋아요 삭제 시작 (SYS_C008172 제약조건 해결)");
                int likesDeleted = userDAO.deleteUserBoardLikes(userId);
                logger.info("✅ 게시글 좋아요 삭제: {}개", likesDeleted);
                totalDeleted += likesDeleted;
            } catch (Exception e) {
                logger.error("❌ 게시글 좋아요 삭제 중 오류: {}", e.getMessage());
                // 이 오류는 무시하지 않고 로그만 남김
            }
            
            // 4-2. 즐겨찾기 삭제
            try {
                logger.info("🔍 4-2단계: 즐겨찾기 삭제 시작");
                int favoritesDeleted = userDAO.deleteUserFavorites(userId);
                logger.info("✅ 즐겨찾기 삭제: {}개", favoritesDeleted);
                totalDeleted += favoritesDeleted;
            } catch (Exception e) {
                logger.warn("⚠️ 즐겨찾기 삭제 중 오류 (테이블이 존재하지 않을 수 있음): {}", e.getMessage());
            }
            
            // 4-3. 랭킹 삭제
            try {
                logger.info("🔍 4-3단계: 랭킹 삭제 시작");
                int rankingsDeleted = userDAO.deleteUserRankings(userId);
                logger.info("✅ 랭킹 삭제: {}개", rankingsDeleted);
                totalDeleted += rankingsDeleted;
            } catch (Exception e) {
                logger.warn("⚠️ 랭킹 삭제 중 오류 (테이블이 존재하지 않을 수 있음): {}", e.getMessage());
            }
            
            // 5. 사용자 계정 삭제 (강제 삭제)
            try {
                logger.info("🔍 5단계: 사용자 계정 강제 삭제 시작");
                
                // 먼저 모든 외래키 참조를 NULL로 설정 (가능한 경우)
                try {
                    logger.info("🔍 외래키 참조 NULL 설정 시도");
                    // TASHU_RIDE 테이블의 USER_ID를 NULL로 설정 (가능한 경우)
                    userDAO.setUserReferencesToNull(userId);
                    logger.info("✅ 외래키 참조 NULL 설정 완료");
                } catch (Exception e) {
                    logger.warn("⚠️ 외래키 참조 NULL 설정 중 오류 (무시): {}", e.getMessage());
                }
                
                // 사용자 계정 삭제
                int userDeleted = userDAO.deleteUserAccount(userId);
                logger.info("✅ 사용자 계정 삭제: {}개", userDeleted);
                totalDeleted += userDeleted;
                
                if (userDeleted > 0) {
                    logger.info("🎉 사용자 및 연관 데이터 삭제 완료: {} (총 {}개 삭제)", userId, totalDeleted);
                } else {
                    logger.warn("⚠️ 삭제할 사용자 데이터가 없음: {}", userId);
                }
                
                return userDeleted; // 사용자 계정 삭제 결과만 반환
            } catch (Exception e) {
                logger.error("❌ 사용자 계정 삭제 중 오류: ", e);
                throw e;
            }
        } catch (Exception e) {
            logger.error("❌ 사용자 삭제 전체 오류: ", e);
            throw e;
        }
    }
}