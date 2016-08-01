<!DOCTYPE html>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<html lang="en">

<body>
	<script>
		function process(a) {
			alert('Done Processing: ' + a);
		}
	</script>
	<h1><c:out value="${message.summary}"/></h1>
	<p>
		${message.text}
	</p>
	<p>
		<a href="#" onclick="process('<c:out value="${message.text}"/>')">Process Text</a>
	</p>
	<p>
		<a href="./xss?id=120">Safe</a> |
		<a href="./xss?id=121">HTML</a> |
		<a href="./xss?id=122">Contextual</a>
	</p>
</body>

</html>