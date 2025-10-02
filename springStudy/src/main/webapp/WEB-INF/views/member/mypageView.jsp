<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>    
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>mypage</title>
<jsp:include page="/WEB-INF/inc/top.jsp" ></jsp:include>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp" ></jsp:include>
	 <!-- Contact Section-->
        <section class="page-section" id="contact" style="margin-top:150px">
            <div class="container">
                <!-- Contact Section Heading-->
                <h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">mypage</h2>
                <!-- Icon Divider-->
                <div class="divider-custom">
                    <div class="divider-custom-line"></div>
                    <div class="divider-custom-icon">
					<!-- 없을때 -->
					<c:if test="${sessionScope.login.profileImg == null }">
	                    <img src="<c:url value="/assets/img/non.png" />" 
	                    	  id="myImage" class="rounded-circle img-thumbnail shadow-sm"
	                    	  width="150px" style="cursor:pointer;" >
                    </c:if>
                    <!-- 있을때 -->
                    <c:if test="${sessionScope.login.profileImg != null }">
                    	<img src="<c:url value="${sessionScope.login.profileImg}" />" 
	                    	  id="myImage" class="rounded-circle img-thumbnail shadow-sm"
	                    	  width="150px" style="cursor:pointer;" >
                    </c:if>
                    <form id="profileForm" enctype="multipart/form-data"> 
                    	<input type="file" id="uploadImage" name="uploadImage" style="display:none;">
                    </form>
                    </div>
                    <div class="divider-custom-line"></div>
                </div>
                <!-- Contact Section Form-->
                <div class="row justify-content-center">
                    <div class="col-lg-8 col-xl-7">
                        <form method="post" action="">
                            <div class="form-floating mb-3">
                                <input disabled value="${sessionScope.login.memId }" class="form-control" name="memId" id="memId" type="text" placeholder="아이디를 입력해주세요" data-sb-validations="required" />
                                <label for="memId">아이디</label>
                                <div class="invalid-feedback" data-sb-feedback="name:required">A ID is required.</div>
                            </div>
                            <div class="form-floating mb-3">
                                <input class="form-control" value="${sessionScope.login.memNm }" id="memNm" name="memNm" type="text" placeholder="이름을 입력해주세요" />
                                <label for="memNm">이름</label>
                            </div>
                            <button class="btn btn-primary btn-xl" id="submitButton" type="submit">수정하기</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
	<jsp:include page="/WEB-INF/inc/footer.jsp" ></jsp:include>	
	<script>
		$(document).ready(function(){
			$("#myImage").click(function(){
				$("#uploadImage").click();
			});
			// 이미지 변경시 
			$("#uploadImage").on("change", function(){
				 var file = $(this)[0].files[0];
				 if(file){
					 // FormData html폼 데이터를 전송에 쉽게 가져옴.
					 var formData = new FormData($("#profileForm")[0]);
					 $.ajax({
						 url : '<c:url value="/files/upload" />'
						,type: 'POST'
						,data:formData
						,processData:false // 전송 객체를 URL인코딩 하지 않도록
						,contentType:false // 파일을 이진 데이터 형태로 전송하기 위해
						,success : function(res){
							console.log(res);
							if(res.message=='success'){
								var path = '${pageContext.request.contextPath}';
								$("#myImage").attr('src',path + res.imagePath);
								$("#topImage").attr('src',path + res.imagePath);
							}
						}
						,error:function(e){
							console.log(e);							 
						}
					 });
				 }
			});
			
		});
	</script>
	
</body>
</html>