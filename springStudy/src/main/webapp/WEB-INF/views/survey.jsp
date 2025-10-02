<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<jsp:include page="/WEB-INF/inc/top.jsp" />
<title>설문</title>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp" />
    <section class="page-section" style="margin-top:150px" id="contact">
        <div class="container">
				<c:forEach items="${qList}" var="question">
					 <div class="form-group">
					 		<label>${question.qId}.${question.qContent}</label>
					 		<select>
					 			<c:forEach items="${question.options}" var="option" >
					 				<option value="${option.oId}">${option.oContent}</option>
					 			</c:forEach>
					 		</select>
					 </div>
				</c:forEach>
        </div>
    </section>
	<jsp:include page="/WEB-INF/inc/footer.jsp" />
</body>
</html>