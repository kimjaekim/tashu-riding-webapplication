<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="" />
        <meta name="author" content="" />
        <title>게시글</title>
        <jsp:include page="/WEB-INF/inc/top.jsp" />
    </head>
    <body id="page-top">
        <!-- 모든 페이지 상단에 들어가는 부분 -->
    	<jsp:include page="/WEB-INF/inc/nav.jsp" />
        <!-- Contact Section-->
        <section class="page-section" id="contact">
            <div class="container" style="margin-top: 100px;">
                <!-- Contact Section Form-->
                <div class="row justify-content-center" style="margin-bottom: 50px;">
                    <div class="col-lg-8 col-xl-7">
                        <!-- title input-->
                        <div class="mb-3">
                            <label for="title">제목</label>
                            <h6 id="title">${board.boardTitle}</h6>
                        </div>
                        <div class="mb-3">
                            <label for="name">작성자</label>
                            <h6 id="name">${board.memNm}</h6>
                        </div>
                        <div class="mb-3">
                            <label for="">작성일</label>
                            <h6 id="">${board.updateDt}</h6>
                        </div>
                        <!-- content input-->
                        <div class="mb-3">
                        	<textarea readOnly class="form-control bg-white" 
                        	style="height: 20rem">${board.boardContent}</textarea>
                        </div>
                        <div class="mb-3">
                        	<form id="boardForm">
                        		<c:if test="${sessionScope.login.memId == board.memId}">
                        			<input type="hidden" name="boardNo" value="${board.boardNo }">
                        			<input class="btn btn-warning btn-lx" type="submit" name="action" value="수정">
                        			<input class="btn btn-danger btn-lx" type="submit" name="action" value="삭제">
                        		</c:if>
                        	</form>
                        </div>
                    </div>
                </div>  
				<!-- 댓글등록 -->
               	<div class="row justify-content-center">
               		<div class="row col-lg-8 col-xl-7">
               			<div class="col-lg-9">
               				<input class="form-control" type="text" id="replyInput" name="replyContent">
               				<input type="hidden" id="memId" value="${sessionScope.login.memId }">
               				<input type="hidden" id="boardNo" value="${board.boardNo }">
               			</div>
               			<div class="col-lg-3">
               			    <button type="button" class="btn btn-info me-2"
               			     onclick="fn_write()" >등록 </button>
               			</div>
               		</div>
               	</div>
               	<!-- 댓글등록 -->
                 <div class="row justify-content-center pt-1">
                 	<div class="col-lg-8 col-xl-7 d-flex">
                 		<table class="table">
							<tbody id="replyBody">
								<c:forEach items="${replyList}" var="reply">
									<tr id="${reply.replyNo }">
										<td>${reply.replyContent}</td>
										<td>${reply.memNm}</td>
										<td>${reply.replyDate}</td>
										<c:if test="${sessionScope.login.memId == reply.memId}">
											<td>
												<a onclick="fn_del('${reply.replyNo}')" >X</a>
											</td>
										</c:if>
										<c:if test="${sessionScope.login.memId != reply.memId}">
											<td></td>
										</c:if>
									</tr>
								</c:forEach>
							</tbody>
                 		</table>
                 	</div>
                 </div>
            </div>
        </section>
        <script>
        	document.getElementById("boardForm").addEventListener("submit", function(e){
        			var clickBtn = e.submitter;
        			if(clickBtn.value == '삭제'){
        				if(!confirm('정말 삭제하시겠습니까!?')){
        					e.preventDefault();
        					return;
        				}
        				this.action = "<c:url value='/boardDeleteDo' />";
        			}else{
        				this.action = "<c:url value='/boardEditView' />";
        			}
        	});
        	//댓글 등록 
       		function fn_write(){
        		
       			var memId   = $("#memId").val();
       			var boardNo = $("#boardNo").val();
       			var content = $("#replyInput").val();
       			if(memId ==''){
       				alert("댓글은 로그인 후 가능!");
       				return;
       			}
       			if(content == ''){
       				alert("내용을 작성하세요...");
       				return;
       			}
       			var sendData = JSON.stringify({"memId":memId
       				                         , "boardNo":boardNo
       				                         , "replyContent":content });
       			console.log(sendData);
       			$.ajax({
       				 url : '<c:url value="/writeReplyDo" />'
       				,type : 'POST'
       				,contentType:'application/json'
       				,dataType :'json'
       				,data: sendData
       				,success:function(res){
       					console.log(res);
       					$("#replyInput").val('');
       					var str = '';
       					str +='<tr id="'+res.boardNo+'">';
       					str +='<td>'+ res.replyContent+'</td>';
       					str +='<td>'+ res.memNm +'</td>';
       					str +='<td>'+ res.replyDate+'</td>';
       					str +='</tr>';
       					$("#replyBody").prepend(str);
       				}
       				,error:function(e){
       					console.log(e);
       				}
       			});
       		}
       		
       		function fn_del(replyNo){
       			if(confirm("정말 삭제!?")){
       				$.ajax({
       					 url :'<c:url value="/delReplyDo" />'
       					,type :'POST'
       					,dataType : 'text'
       					,data : {'replyNo':replyNo}
       					,success:function(res){
       						console.log(res);
       						$("#"+replyNo).remove();
       					}
       					,error:function(e){
       						console.log(e);
       					}
       				});
       			}
       		}
        
        </script>
        
        <!-- 모든 페이지 하단에 들어가는 부분 -->
        <!-- Footer-->
		<jsp:include page="/WEB-INF/inc/footer.jsp" />
    </body>
</html>


