-- 강제 사용자 삭제 스크립트 (외래키 제약조건 무시)
-- 주의: 이 스크립트는 모든 관련 데이터를 강제로 삭제합니다.

-- 1. 사용자 ID 설정
DEFINE USER_ID = 'user_1759126454520'

-- 2. 모든 관련 데이터 삭제 (존재하는 테이블만)
BEGIN
    -- 라이딩 기록 삭제
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_RIDE WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('라이딩 기록 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('라이딩 기록 삭제 중 오류 (테이블이 없을 수 있음): ' || SQLERRM);
    END;
    
    -- 게시글 댓글 삭제
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_COMMENT WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('댓글 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('댓글 삭제 중 오류 (테이블이 없을 수 있음): ' || SQLERRM);
    END;
    
    -- 게시글 조회 기록 삭제
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_BOARD_VIEW WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('조회 기록 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('조회 기록 삭제 중 오류 (테이블이 없을 수 있음): ' || SQLERRM);
    END;
    
    -- 게시글 삭제
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_BOARD WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('게시글 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('게시글 삭제 중 오류 (테이블이 없을 수 있음): ' || SQLERRM);
    END;
    
    -- 즐겨찾기 삭제 (TASHU_FAVORITE 테이블이 있다면)
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_FAVORITE WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('즐겨찾기 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('즐겨찾기 삭제 중 오류 (테이블이 없을 수 있음): ' || SQLERRM);
    END;
    
    -- 사용자 계정 삭제
    BEGIN
        EXECUTE IMMEDIATE 'DELETE FROM TASHU_USER WHERE USER_ID = :1' USING '&USER_ID';
        DBMS_OUTPUT.PUT_LINE('사용자 계정 삭제 완료');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('사용자 계정 삭제 중 오류: ' || SQLERRM);
            RAISE;
    END;
    
    DBMS_OUTPUT.PUT_LINE('사용자 &USER_ID 삭제가 완료되었습니다.');
    
END;
/

-- 3. 삭제 결과 확인
SELECT '삭제 후 남은 데이터 확인' as RESULT FROM DUAL;

SELECT 'TASHU_USER' as TABLE_NAME, COUNT(*) as REMAINING_RECORDS 
FROM TASHU_USER WHERE USER_ID = '&USER_ID'
UNION ALL
SELECT 'TASHU_RIDE' as TABLE_NAME, COUNT(*) as REMAINING_RECORDS 
FROM TASHU_RIDE WHERE USER_ID = '&USER_ID'
UNION ALL
SELECT 'TASHU_BOARD' as TABLE_NAME, COUNT(*) as REMAINING_RECORDS 
FROM TASHU_BOARD WHERE USER_ID = '&USER_ID'
UNION ALL
SELECT 'TASHU_COMMENT' as TABLE_NAME, COUNT(*) as REMAINING_RECORDS 
FROM TASHU_COMMENT WHERE USER_ID = '&USER_ID'
UNION ALL
SELECT 'TASHU_BOARD_VIEW' as TABLE_NAME, COUNT(*) as REMAINING_RECORDS 
FROM TASHU_BOARD_VIEW WHERE USER_ID = '&USER_ID';
