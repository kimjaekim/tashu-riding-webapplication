<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<jsp:include page="/WEB-INF/inc/top.jsp" />
<title>이메일 전송</title>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp" />
	
    <section class="page-section" style="margin-top:150px" id="contact">
        <div class="container">
            <!-- Contact Section Heading-->
            <h2 class="page-section-heading text-center text-uppercase text-secondary mb-0">메일전송</h2>
            <!-- Icon Divider-->
            <div class="divider-custom">
                <div class="divider-custom-line"></div>
                <div class="divider-custom-icon"><i class="fas fa-star"></i></div>
                <div class="divider-custom-line"></div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <form id="contactForm" action="<c:url value='/sendMailDo' />" method="post">
                        <div class="form-floating mb-3">
                            <input class="form-control" name="title"  
                            type="text" placeholder="제목을 작성해주세요" data-sb-validations="required" />
                            <label for="title">제목</label>
                        </div>
                        <div id="emailArr">
                        	<div class="form-floating mb-3 email-item d-flex align-items-center">
                        		<input class="form-control" name="email" type="email"
                        		      placeholder="이메일 주소를 입력해주세요">
                        		<label>이메일 주소</label>
                        		<button type="button" class="btn btn-danger btn-sm ms-2 removeBtn">-</button>
                        	</div>
                        </div>
                        <div class="d-flex justify-content-end">
                        	<button id="addBtn" type="button" class="btn btn-primary btn-sm">+</button>
                        </div>
                     	<div class="form-floating mb-3">
                     		<input class="form-control" name="content" type="text" placeholder="내용">
                     		<label>본문</label>
                     	</div>
                        <button class="btn btn-primary btn-xl" id="submitButton" type="submit">전송하기</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <script>
    	$(document).ready(function(){
    		$("#addBtn").click(function(){
    				var emailClone = $(".email-item").first().clone();
    				emailClone.find('input').val('');
    				$("#emailArr").append(emailClone);
    		});
    		$(document).on("click", ".removeBtn", function(){
    			  if($(".email-item").length > 1){
    				  $(this).closest(".email-item").remove();
    			  }else{
    				  alert("최소 1개의 이메일은 입력해야함.");
    			  }
    		});
    	});
    
    
    </script>
	
	
	<jsp:include page="/WEB-INF/inc/footer.jsp" />
</body>
</html>