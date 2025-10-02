<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<jsp:include page="/WEB-INF/inc/top.jsp" />
<title>회원가입</title>
<style type="text/css">
	.error{color:red; font-size:0.9em;}
</style>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp" />
	
	<!-- 회원가입 -->
    <section class="page-section" style="margin-top:150px" id="contact">
        <div class="container">
            <!-- Contact Section Heading-->
            <h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">회원가입</h2>
            <!-- Icon Divider-->
            <div class="divider-custom">
                <div class="divider-custom-line"></div>
                <div class="divider-custom-icon"><i class="fas fa-star"></i></div>
                <div class="divider-custom-line"></div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
					<!-- form:form tag 서버 validation 체크 -->
                    <form:form modelAttribute="member" id="contactForm" action="${pageContext.request.contextPath}/registDo" method="post">
                        <div class="form-floating mb-3">
                            <form:input class="form-control" path="memId" name="memId" type="text" placeholder="아이디를 입력하세요..." data-sb-validations="required" />
                            <form:errors path="memId" cssClass="error" />
                            <label for="name">아이디</label>
                        </div>
                        <div class="form-floating mb-3">
                            <form:input class="form-control" path="memPw" name="memPw"  type="password" placeholder="비밀번호를 입력하세요.." data-sb-validations="required" />
                            <form:errors path="memPw" cssClass="error" />
                            <label for="email">패스워드</label>
                        </div>
                        <div class="form-floating mb-3">
                            <form:input class="form-control" path="memNm"  name="memNm" type="text" placeholder="이름" data-sb-validations="required" />
                            <form:errors path="memNm" cssClass="error" />
                            <label for="phone">이름</label>
                        </div>
                        <button class="btn btn-primary btn-xl" id="submitButton" type="submit">회원가입</button>
                    </form:form>
                </div>
            </div>
        </div>
    </section>
	
	<jsp:include page="/WEB-INF/inc/footer.jsp" />
</body>
</html>