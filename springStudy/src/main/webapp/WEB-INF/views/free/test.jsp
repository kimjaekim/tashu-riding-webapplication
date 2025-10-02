<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<jsp:include page="/WEB-INF/inc/top.jsp" />
<title>test</title>
</head>
<body>
<%-- 	<jsp:include page="/WEB-INF/inc/nav.jsp" /> --%>
    <script type="text/javascript">
    	$(document).ready(function(){
    			$("#mainSelect").change(function(){
    				var code = $(this).val();
    				$.ajax({
    						 url :'<c:url value="/api/getSubCodes" />'
    						,type :'GET'
    						,data : {"commParent":code}
    						,dataType:'json'
    						,success: function(res){
    							$("#subSelect").empty().append('<option>--선택하세요--</option>');
    							$.each(res, function(idx, item){
    								$("#subSelect").append('<option>'+item.commNm+'</option>')
    							});
    						}
    				});
    			});
    	});
    
    </script>
    <div class="col-sm-2">
    	<select id="mainSelect" class="form-control input-sm">
    		<option value="">--전체--</option>
    		<c:forEach items="${comList}" var="code">
    			<option value="${code.commCd }">${code.commNm}</option>	
    		</c:forEach>
    	</select>
    	<select id="subSelect"  class="form-control input-sm">
    		<option></option>
    	</select>
    </div>
    
<%-- 	<jsp:include page="/WEB-INF/inc/footer.jsp" /> --%>
</body>
</html>