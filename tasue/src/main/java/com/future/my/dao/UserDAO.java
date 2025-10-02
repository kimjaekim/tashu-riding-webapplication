package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.future.my.vo.UserVO;

@Mapper
public interface UserDAO {
    // 사용자 CRUD
    int insertUser(UserVO user);
    UserVO selectUserById(String userId);
    UserVO selectUserByEmail(String email); // 이메일로 사용자 조회 추가
    List<UserVO> selectAllUsers();
    int updateUser(UserVO user);
    int deleteUser(String userId);
    int deleteUserWithRelatedData(String userId); // 연관 데이터와 함께 삭제
    int deleteUserComments(String userId); // 사용자 댓글 삭제
    int deleteUserBoards(String userId); // 사용자 게시글 삭제
    int deleteUserBoardViews(String userId); // 사용자 조회 기록 삭제
    int deleteUserBoardLikes(String userId); // 사용자 게시글 좋아요 삭제
    int deleteUserFavorites(String userId); // 사용자 즐겨찾기 삭제
    int deleteUserRankings(String userId); // 사용자 랭킹 삭제
    int deleteUserAccount(String userId); // 사용자 계정 삭제
    int setUserReferencesToNull(String userId); // 외래키 참조를 NULL로 설정
    
    // 사용자 통계 업데이트
    int updateUserStats(UserVO user);
    
    // 중복 체크 메서드들
    int checkNameDuplicate(String name);
    int checkEmailDuplicate(String email);
    int checkPhoneDuplicate(String phone);
}