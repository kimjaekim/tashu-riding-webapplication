<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>채팅</title>
    	<jsp:include page="/WEB-INF/inc/top.jsp" ></jsp:include>
        <style>
			.chat-containerK {
				/* overflow: hidden; */
				width : 100%;
				/* max-width : 200px; */
			}
			.chatcontent {
				height: 700px;
				width : 100%;
				/* width:300px; */
				overflow-y: scroll;
			}
			.chat-fix {
				position: fixed;
				bottom: 0;
				width: 100%;
			}
			#alertK{
				display : none;
			}
			#msgi{	
				resize: none;
			}
			.myChat{
				background-color : #E0B1D0;
			}
			li{
				list-style-type:none;
			}
			.chatBox{
				display : inline-block;
			}
			.chatBox dateK{
				vertical-align: text-bottom;
			} 
			.me{
				text-align : right;
				/* text-align:center; */
			}
			.chat-box{
				max-width : 200px;
				display: inline-block;
				border-radius: 15px;
			}
			.notification{
				text-align : center;
			}
		</style>
    </head>
    <body id="page-top">
        <!-- 모든 페이지 상단에 들어가는 부분 -->
    	<jsp:include page="/WEB-INF/inc/nav.jsp" ></jsp:include>
        <!-- Contact Section-->
        <section class="page-section" id="contact">
            <div class="container" style="margin-top: 100px;">
                <div id="chat-containerK">
					<div class="chatWrap">
						<div class="main_tit">
							<h1>방 정보: [${roomNo}] </h1>
						</div>
						<div class="content chatcontent border border-secondary" data-room-no="" >
							<div id="list-guestbook" class="">
							  <c:forEach items="${chatList}" var="chat"> 
									<!-- 내 채팅일 경우 -->
									<c:if test="${sessionScope.login.memId eq chat.memId}">
										<div class="me pr-2">
											<strong>${chat.memId}(${chat.memNm})</strong>
											<img src="${chat.profileImg}" class="rounded-circle img-thumbnail shadow-sm" width="50">
											<div class="me">
												<p class='myChat chat-box text-left p-3'>${chat.chatMsg}</p>
		   											<strong style="display : inline;" class="align-self-end">${chat.sendDate}</strong>
											</div>
										</div>
									</c:if>
									<!-- 다른사람의 채팅일 경우 -->
									<c:if test="${sessionScope.login.memId ne chat.memId}">
										<div class="pr-2">
											<strong>${chat.memId}(${chat.memNm})</strong>
											<img src="${chat.profileImg}" class="rounded-circle img-thumbnail shadow-sm" width="50">
											<div>
												<p class='chat-box bg-light p-3'>${chat.chatMsg}</p>
												<strong style="display : inline;" class="align-self-center">${chat.sendDate}</strong>
											</div>
										</div>
									</c:if>
								</c:forEach>
							</div>
						</div>
						<div>
							<div class="d-flex justify-content-center" style="height: 60px">
							    <button type="button" id="photo" class="btn btn-secondary btn-sm" style="width:5%"> + </button>
								<input type="text" id="msgi" name="msg" class="form-control" style="width: 45%; height: 100%">
								<button type="button" id="btnLlama" class="send btn btn-info" style="width: 15%; height: 100%">라마</button>
								<button type="button" id="btnSend" class="send btn btn-primary" style="width: 20%; height: 100%">보내기</button>
								<button type="button" id="btnOut" class="btn btn-secondary " style="width: 15%; height: 100%">나가기</button>
							</div>
							<!-- 숨겨진 파일 -->
							<input type="file" id="uploadImg" style="display:none;" accept="image/*">
							
						</div>
					</div>
				</div>
            </div>
        </section>

        <!-- 모든 페이지 하단에 들어가는 부분 -->
        <!-- Footer-->
		<jsp:include page="/WEB-INF/inc/footer.jsp" ></jsp:include>
		<!-- sockjs.min.js -->
		<script src="<c:url value="/js/sockjs.min.js" />"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"></script>	
		<script>
		
		  /* jshint esversion : 6 */
		  $(document).ready(function(){		
			  var client;
			  var userId = '${sessionScope.login.memId}';
			  var userNm = '${sessionScope.login.memNm}';
			  var userImg ='${empty sessionScope.login.profileImg ? "/assets/img/non.png" : sessionScope.login.profileImg}';
			  var roomNo = '${roomNo}';
			  //소캣 접속
			  var sock = new SockJS("<c:url value='/endpoint' />");
			  client = Stomp.over(sock);
			  console.log(client);
			  scroll_down();
			  //최조 연결시 메세지 전송
			  client.connect({"userId":userId,"roomNo":roomNo},function(){
				   //상대방이 보낸 메세지를 받음
				   client.subscribe("/subscribe/chat/"+roomNo, function(chat){
					  	var body = JSON.parse(chat.body);
					  	console.log("===========");
					  	console.log(body);
					  	if(body.type=='notification'){
					  		var str ='<div class="notification">' +body.message+'</div>';
					  		$("#list-guestbook").append(str);
					  	}else{
					  		$("#list-guestbook").append(renderMsg(body));
					  	}
					  	scroll_down();
				   });
			  });
			  // 메세지 전송
			  function send(){
				  var msg = $("#msgi").val();
				  if(msg == ''){
					  return false;
				  }
				  client.send("/app/hello/"+roomNo, {}, JSON.stringify({
					    chatMsg : msg
					   ,memId : userId
					   ,roomNo : roomNo
					   ,memNm : userNm
					   ,profileImg: userImg
				  }));
				  $("#msgi").val('');
			  }
			  // 출력 
			  function renderMsg(vo){
				  var str = "";
				  if(vo.memId == userId){
					  str = `<div class="me pr-2">
								<strong>\${vo.memId}(\${vo.memNm})</strong>
								<img src='\${vo.profileImg}' class='rounded-circle img-thumbnail shadow-sm' width='50'>
								<div class="me">
									<p class='myChat chat-box text-left p-3'>\${vo.chatMsg}</p>
											<strong style="display : inline;" class="align-self-end">\${vo.sendDate}</strong>
								</div>
							</div>`;
				  //다른 사람 
				  }else{
					  str = `<div class="pr-2">
								<strong>\${vo.memId}(\${vo.memNm})</strong>
								<img src='\${vo.profileImg}' class='rounded-circle img-thumbnail shadow-sm' width='50'>
								<div>
									<p class='chat-box bg-light p-3'>\${vo.chatMsg}</p>
									<strong style="display : inline;" class="align-self-center">\${vo.sendDate}</strong>
								</div>
							</div>`
				  }
				  return str;
			  }
			  
			  $("#btnSend").click(function(){
				 send(); 
			  });
			  $("#msgi").keydown(function(e){
				 	if(e.keyCode == 13){
				 		send();
				 	} 
			  });
			  //나가기 
			  function disconnect(){
				  client.send("/subscribe/chat/"+ roomNo, {}
				            , JSON.stringify({"type":"notification"
				            	              ,"message":userId +"님이 나가셨습니다..."}));
				  client.disconnect();
			  }
			  //브라우저에서 나가기 직전
			  window.onbeforeunload = function(){
				  disconnect();
			  }
			  //나가기버튼
			  $("#btnOut").click(function(){
				    disconnect();
				    location.href="<c:url value='/chatListView' />";
			  });
			  $("#btnLlama").click(function(){
				 	var question = $("#msgi").val();
				 	 $("#msgi").val('');
				 	if(question == '') return;
				 	var loadingId = "loading-" + new Date().getTime();
				 	$.ajax({
				 		 url : "<c:url value='/askOllama' />"
				 		,type: "POST"
				 		,data: {prompt:question}
				 		,dataType:'json'
				 		,beforeSend:function(){
				 			$("#list-guestbook").append(`<div id='\${loadingId}' class='notification'>로딩중...</div>`);
				 		}
				 		,success:function(res){
				 			$("#"+loadingId).html(`<div class='notification'>\${res.answer}</div>`);
				 			scroll_down();
				 		}
				 		,error:function(e){
				 			alert("AI 요청 실패..:", e.responseText);
				 		}
				 	});
				 	
			  });
			  //스크롤 다운 
			  function scroll_down(){
				  $(".chatcontent").scrollTop($(".chatcontent")[0].scrollHeight);
			  }
			  
			  $("#photo").click(function(){
				 	$("#uploadImg").click(); 
			  });
			  
			  $("#uploadImg").change(function(){
				  	 var file = this.files[0];
				  	 if(!file) return;
				  	 var formData = new FormData();
				  	 formData.append('file', file);
				  	 $.ajax({
				  		  url :"<c:url value='/uploadChatImage' />"
				  		 ,type:'POST'
				  		 ,data: formData
				  		 ,processData:false
				  		 ,contentType:false
				  		 ,success:function(res){
				  			 client.send("/app/hello/" + roomNo, {}, JSON.stringify({
				  				  memId : userId
				  				 ,memNm : userNm
				  				 ,roomNo:roomNo
				  				 ,profileImg:userImg
				  				 ,chatMsg : "<img width='150' src='"+res.imagePath+"' >"
				  			 }));
				  		 }
				  		  ,error:function(e){
				  			  alert("이미지 전송 실패!");
				  			  console.log(e);
				  		  }
				  	 });
				  	 
			  });
			  
		  });	
		</script>
    </body>
</html>


