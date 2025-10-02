<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport"
	content="width=device-width, initial-scale=1, shrink-to-fit=no" />
<jsp:include page="/WEB-INF/inc/top.jsp"></jsp:include>
<script type="text/javascript" src="${pageContext.request.contextPath}/resources/smarteditor2-2.8.2.3/js/HuskyEZCreator.js" charset="utf-8"></script>
</head>
<body>
	<jsp:include page="/WEB-INF/inc/nav.jsp"></jsp:include>
	<section class="page-section" id="contact">
		<div class="container" style="margin-top: 100px;">
			<table class="table table-striped table-bordered">
				<tr>
					<th>제목</th>
					<td><input class="form-control input-sm" disabled="disabled"
						type="text" name="boTitle" value="${free.boTitle }"></td>
				</tr>
				<tr>
					<th>작성자</th>
					<td><input class="form-control input-sm" disabled="disabled"
						type="text" name="boWriter" value="${free.boWriter }"></td>
				</tr>
				<tr>
					<th>분류</th>
					<td><input class="form-control input-sm" disabled="disabled"
						type="text" name="boCategoryNm" value="${free.boCategoryNm }"></td>
				</tr>
				<tr>
					<th>내용</th>
					<td id="contentArea">${free.boContent}</td>
				</tr>
				<tr>
					<td colspan="2">
						<button type="button" class="btn btn-primary btn-lg w-100"
							data-bs-toggle="modal" data-bs-target="#exampleModal">
							수정</button>
					</td>
				</tr>
			</table>
		</div>
	</section>


	<!-- 비밀번호 확인 모달 -->
	<div class="modal fade" id="exampleModal" tabindex="-1"
		aria-labelledby="exampleModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="exampleModalLabel">비밀번호 확인</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<input type="hidden" id="boNo" name="boNo" value="${free.boNo}">
					<div class="mb-3">
						<label>비밀번호</label> <input type="password" class="form-control"
							id="boPass" name="boPass" placeholder="비밀번호 입력" required />
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary"
						data-bs-dismiss="modal">취소</button>
					<button type="button" id="btnCheck" class="btn btn-primary">확인</button>
				</div>
			</div>
		</div>
	</div>
	<script>
		var oEditors = [];
		$(document).ready(function() {
			$("#btnCheck").click(function() {
				var boNo = $("#boNo").val();
				var boPass = $("#boPass").val();
				if (boPass.trim() == "") {
					alert("비밀번호를 입력하세요!");
					return;
				}
				$.ajax({
					url : "<c:url value='/free/freePassCheck' />",
					type : 'POST',
					data : {
						boNo : boNo,
						boPass : boPass
					},
					dataType : 'text',
					success : function(res) {
						console.log(res);
						if (res == 'success') {
							
							$("#exampleModal").modal('hide');
							//수정가능상태
							$("input[name='boTitle']").prop("disabled", false);
							$("input[name='boWriter']").prop("disabled", false);
							$("#contentArea").empty();
							// td -> textarea로 교체
							$("#contentArea").html(
									'<textarea name="boContent" id="bo_content" ></textarea>');
                            //버튼 수정 -> 저장
                            $("button[data-bs-target='#exampleModal']").replaceWith(
                            	'<button type="button" class="btn btn-success w-100" onclick="saveBoard()">저장</button>');
                            
                            
                    		nhn.husky.EZCreator.createInIFrame({
                    			oAppRef: oEditors,
                    			elPlaceHolder: "bo_content", // textarea id 
                    			sSkinURI: "<c:url value='/resources/smarteditor2-2.8.2.3/SmartEditor2Skin.html' />",	
                    			htParams : {
                    				bUseToolbar : true,				// 툴바 사용 여부 (true:사용/ false:사용하지 않음)
                    				bUseVerticalResizer : true,		// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
                    				bUseModeChanger : true,			// 모드 탭(Editor | HTML | TEXT) 사용 여부 (true:사용/ false:사용하지 않음)
                    				bSkipXssFilter : true,		    // client-side xss filter 무시 여부 (true:사용하지 않음 / 그외:사용)
                    				//aAdditionalFontList : aAdditionalFontSet,		// 추가 글꼴 목록
                    				fOnBeforeUnload : function(){
                    					//alert("완료!");
                    				}
                    			}, //boolean
                    			fOnAppLoad : function(){
                    				//예제 코드
                    				oEditors.getById["bo_content"].exec("PASTE_HTML", ['${free.boContent}']);
                    			},
                    			fCreator: "createSEditor2"
                    		});
							
						} else {
							alert("비밀번호가 일치하지 않습니다....");
						}
					},
					error : function(e) {
						alert("서버 통신 중 오류가 발생함.... 다음에 다시...");
					}
				})
			});
		});
		function saveBoard(){
			oEditors.getById["bo_content"].exec("UPDATE_CONTENTS_FIELD", []);
			var data = {
					 boNo : $("#boNo").val()
					,boTitle: $("input[name=boTitle]").val()
					,boWriter : $("input[name=boWriter]").val()
					,boContent : $("#bo_content").val()
			}
			$.ajax({
					 url : "<c:url value='/free/freeBoardUpdateDo' />"
					,type: "POST"
					,data:data
					,success:function(res){
						if(res == "success"){
							alert("수정 완료!");
							location.reload();
						}else{
							alert("수정 실패!");
						}
					}
			});
		}
		
	</script>
	<jsp:include page="/WEB-INF/inc/footer.jsp"></jsp:include>
</body>
</html>






