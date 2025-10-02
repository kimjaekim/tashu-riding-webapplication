<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
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
	<section class="page-section" style="margin-top: 150px" id="contact">
		<div class="container">
			<!-- Contact Section Heading-->
			<h2
				class="page-section-heading text-center text-uppercase text-secondary mb-0">로그인</h2>
			<!-- Icon Divider-->
			<div class="divider-custom">
				<div class="divider-custom-line"></div>
				<div class="divider-custom-icon">
					<i class="fas fa-star"></i>
				</div>
				<div class="divider-custom-line"></div>
			</div>
			<div class="row justify-content-center">
				<div class="col-lg-8 col-xl-7">
					<label>질문: </label> <input type="text" id="prompt"
						style="width: 300px;" />
					<button id="sendBtn">보내기</button>

					<div id="result"></div>

					<script>
						$("#sendBtn").click(function() {
						    $.ajax({
						        url: "${pageContext.request.contextPath}/askOllama",
						        type: "POST",
						        data: { prompt: $("#prompt").val() },
						        success: function(res) {
						            $("#result").html(
						                "<h3>질문</h3><p>" + res.prompt + "</p>" +
						                "<h3>응답</h3><p>" + res.answer + "</p>"
						            );
						        },
						        error: function(xhr, status, err) {
						            alert("에러 발생: " + err);
						        }
						    });
						});
					  </script>
				</div>
			</div>
		</div>
	</section>


	<jsp:include page="/WEB-INF/inc/footer.jsp" />
</body>
</html>