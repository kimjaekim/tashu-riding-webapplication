<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<jsp:include page="/WEB-INF/inc/top.jsp" />
<title>로그인</title>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp" />
	
	<!-- 로그인 -->
    <section class="page-section" style="margin-top:150px" id="contact">
        <div class="container">
            <!-- Contact Section Heading-->
            <h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">로그인</h2>
            <!-- Icon Divider-->
            <div class="divider-custom">
                <div class="divider-custom-line"></div>
                <div class="divider-custom-icon"><i class="fas fa-star"></i></div>
                <div class="divider-custom-line"></div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <form id="contactForm" action="<c:url value='/loginDo' />" method="post">
                        <div class="form-floating mb-3">
                            <input class="form-control" name="memId" value="${cookie.rememberId.value }" 
                            type="text" placeholder="아이디를 입력하세요..." data-sb-validations="required" />
                            <label for="name">아이디</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input class="form-control" name="memPw"  type="password" placeholder="비밀번호를 입력하세요.." data-sb-validations="required" />
                            <label for="email">패스워드</label>
                        </div>
                        <div class="form-floating mb-3">
                        	<input type="checkbox" ${cookie.rememberId.value == null ? "" : "checked"}
                        	 class="form-check-input" name="remember"> 아이디 기억하기
                        </div>
                        <button class="btn btn-primary btn-xl" id="submitButton" type="submit">로그인</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
	
	
	<jsp:include page="/WEB-INF/inc/footer.jsp" />
</body>
</html>