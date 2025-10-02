<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!-- Navigation-->
<nav class="navbar navbar-expand-lg bg-secondary text-uppercase fixed-top" id="mainNav">
    <div class="container">
        <a class="navbar-brand" href="${pageContext.request.contextPath}/">스프링 프레임워크 MVC프로젝트</a>
        <button class="navbar-toggler text-uppercase font-weight-bold bg-primary text-white rounded" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            Menu
            <i class="fas fa-bars"></i>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded" href="${pageContext.request.contextPath}/free/freeList">자유게시판</a></li>
			<!-- 로그인 전  -->
			<c:if test="${sessionScope.login.memId == null}" >
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
                	 href="${pageContext.request.contextPath}/loginView">로그인</a>
                </li>
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
                	 href="${pageContext.request.contextPath}/registView">회원가입</a>
                </li>
            </c:if>
			<!-- 로그인 전 -->
            <c:if test="${sessionScope.login.memId != null}" >    
            <!-- 로그인 후  -->
            	<c:if test="${sessionScope.login.memId eq 'admin' }">
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
                	 href="${pageContext.request.contextPath}/admin">메일전송</a>
                </li>
                </c:if>
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
                	 href="${pageContext.request.contextPath}/chatListView">채팅방</a>
                </li>
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
                	 href="${pageContext.request.contextPath}/boardView">회원 게시판</a>
                </li>
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
             	 href="${pageContext.request.contextPath}/mypageView">${sessionScope.login.memId}님(마이페이지)</a>
                </li>
                	<!-- 없을때 -->
                	<c:if test="${sessionScope.login.profileImg == null }">
	                	<img alt="" src="${pageContext.request.contextPath}/assets/img/non.png" id="topImage" 
	                	  class="rounded-circle img-thumbnail shadow-sm" width="50" style="cursor:pointer;">
                	</c:if>
                	<c:if test="${sessionScope.login.profileImg != null }">
                	    <img alt="" src="${pageContext.request.contextPath}${sessionScope.login.profileImg}" id="topImage" 
	                	  class="rounded-circle img-thumbnail shadow-sm" width="50" style="cursor:pointer;">
                	</c:if>
                <li class="nav-item mx-0 mx-lg-1">
                	<a class="nav-link py-3 px-0 px-lg-3 rounded"
             	 href="${pageContext.request.contextPath}/logoutDo">로그아웃</a>
                </li>
            </c:if>
            <!-- 로그인 후  -->
            </ul>
        </div>
    </div>
</nav>
