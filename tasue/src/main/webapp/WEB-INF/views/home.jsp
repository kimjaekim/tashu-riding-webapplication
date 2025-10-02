<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>타슈 시스템</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #16a34a;
            text-align: center;
        }
        .info {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .api-test {
            background: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .api-link {
            display: inline-block;
            background: #16a34a;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 5px;
        }
        .api-link:hover {
            background: #15803d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚲 타슈 시스템</h1>
        
        <div class="info">
            <h2>서버 상태</h2>
            <p><strong>서버 시간:</strong> ${serverTime}</p>
            <p><strong>상태:</strong> 정상 작동 중</p>
        </div>
        
        <div class="api-test">
            <h2>API 테스트</h2>
            <p>다음 링크들을 클릭하여 API가 정상 작동하는지 확인하세요:</p>
            <a href="/my/api/test" class="api-link">기본 테스트 API</a>
            <a href="/my/api/users/test" class="api-link">사용자 테스트 API</a>
        </div>
        
        <div class="info">
            <h2>프론트엔드 연동</h2>
            <p>React 프론트엔드가 <code>http://localhost:3001</code>에서 실행 중이어야 합니다.</p>
            <p>API Base URL: <code>http://localhost:8080/my/api</code></p>
        </div>
    </div>
</body>
</html>