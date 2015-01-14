\h3{请求和回复}
\h4{简介}
cc98的API由一系列HTTP请求和回复组成，请求和回复按照以下方面进行约定。

\h5{请求}
\h6{媒体类型}

API请求的\@Content-Type\@\emphasis{必须}为\@Content-Type: application/json; charset=utf-8; api_version=1.0\@。

\code+[http]{begin}
OPTIONS /resources/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

如果请求使用不支持的媒体类型，则应该返回\@415 Unsupported Media Type\@。

API回复的\@Content-Type\@\emphasis{必须}为\@Content-Type: application/json; charset=utf-8; api_version=1.0\@

其中，\@api_version\@暂定为1.0。随着API版本的改变，支持的版本号也会发生改变。

\h6{限速}

任何请求都\emphasis{必须}通过服务器段限速的要求，如果不符合限速要求的，返回\@429 Too Many Request\@，具体参考\link+[限速]{#/ratelimit.ml.js}#TODO。

\h6{授权}

很多资源需要用户授权才可以访问，如果试图在没有授权下访问，返回\@401 Unauthorized\@，如果已经授权，但由于权限设置无法访问，则返回\@403 Forbidden\@。具体内容请访问：\link+[授权]{#/auth.ml.js}。

\h5{回复}

回复的报头应该至少包括：

\list*{
    \* 一个有意义的HTTP状态码，比如\@200 OK\@，\@304 Not Modified\@。
    \* 内容MIME类型\@Content-Type\@。
    \* 内容长度\@Content-Length\@，可以帮助浏览器减少连接开销。
    \* 缓存策略\@Cache-control\@。
    \* validator，与缓存的验证有关的信息\@Last-Modified\@、\@ETag\@。
    \* \@Date\@，永远帮助客户端正确处理缓存。
    \* 限速状态：\@X-Ratelimit-Limit\@和\@X-Ratelimit-Remaining\@。
}
\h6{HTTP 状态码}

HTTP 状态码在\link+[RFC2612的第10节]{http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10}定义。

以下列出了本API使用的HTTP 状态码。

\h5{回复状态码：针对任意请求}

\table{begin}
\r{
	\h 支持的请求方法
	\h Status Code
	\h 说明
}

\r{
	\d \@OPTIONS\@
	\d \@200 OK\@
	\d 请求成功，返回的报头中包括\@Allow\@字段，表示当前资源支持的方法。
}

\r{
	\dr2 \@GET\@
	\d \@200 OK\@
	\d 请求成功，返回API的JSON内容。
}
\r{

	\d \@304 Not Modified\@
	\d 访问的资源没有改动，但可以更新报头数据。\emphasis{必须}提供\@Date\@报头，这样可以让没有时钟的客户端依然可以正确处理缓存。
}

\r{
	\d \@POST\@
	\d \@201 Created\@
	\d 资源成功被创建，回复的报头里\emphasis{应该}包括\@Location\@指出新资源的URI。
}

\r{
	\d \@PUT\@
	\d \@204 No Content\@
	\d 资源被成功删除，没有内容返回。
}

\r{
	\dr2 \@POST\@ \@PUT\@
	\d \@411 Length Required\@
	\d 需要客户端提供\@Content-Length\@报头。
}
\r{

	\d \@413 Request Entity Too Large\@
	\d 请求的内容过大，比如说用户企图上传大于限制的文件。
}

\r{
	\d \@DELETE\@
	\d \@204 No Content\@
	\d 资源被成功删除，没有内容返回。
}

\r{
	\dr11 \@OPTIONS\@ \newline \@GET\@ \newline \@POST\@ \newline \@PUT\@ \newline \@DELETE\@
	\d \@307 Temporary Redirect\@
	\d 访问的资源暂时被定位到其他地方，比如服务器进行维护时可以重定向到备用服务器，继续提供服务，因为是暂时的，下次访问的时候依然\emphasis{应该}使用原来的URI。这个回复可以被缓存，通常缓存的时间要比正常服务的时候要短。
}
\r{

	\d \@400 Bad Request\@
	\d 服务器器接受请求，但是请求的内容有错误，不符合API的定义。
}
\r{

	\d \@401 Unauthorized\@
	\d 请求需要认证才能执行，回复中\emphasis{必须}包括\@WWW-Authenticate\@报头，本API使用\link+[OAuth2]{http://oauth.net/2/}的Bearer Token，具体内容请访问：\link+[授权]{#/auth.ml.js}。
}
\r{

	\d \@404 Not Found\@
	\d 请求的资源不存在。
}
\r{
	
	\d \@405 Method Not Allowed\@
	\d 请求的资源不支持用请求的方法访问，回复\emphasis{必须}包括\@Allow\@报头，指出这个资源支持哪些访问方法。
}
\r{

	\d \@406 Not Acceptable\@
	\d 服务器不能提供请求所需要的内容类型，由于本API已经规定了请求的内容类型，这个状态码的产生可能是由于客户端请求了错误的内容类型，或者服务器端没有正确的产生内容类型。
}
\r{
	
	\d \@410 Gone\@
	\d 资源由于历史原因（丢失、API改版等）无法访问，回复的内容\emphasis{应该}包括无法访问的具体原因。
}
\r{

	\d \@415 Unsupported Media Type\@
	\d 服务器不支持使用请求的媒体类型，或者请求的内容实体不符合请求的媒体类型。
}
\r{

	\d \@429 Too Many Request\@
	\d 请求过于频繁，超过超过服务器的限速要求。具体参考：\link+[限速]{#/ratelimit.ml.js}。
}
\r{

	\d \@500 Internal Server Error\@
	\d 服务器由于意外的原因发生错误。
}
\r{

	\d \@503 Service Unavailable\@
	\d 服务器暂时不能提供服务，可能服务器在维护中，\emphasis{应该}给出进一步的错误信息。
}

\r{
	\d 其他方法
	\d \@501 Not implemented\@
	\d 服务器不支持请求的方法。
}

\table{end}

\h6{错误信息}
当回复的状态码为4XX、5XX时，可以在内容里进一步给出错误的原因和处理提示。

通用的格式为：

\code+[json]{begin}
{ "error":[
    {
        "error_type": "error type 1",
        "message": "message for type 1",
        "info": {information to be passed}},
    {
        "error_type": "error type 2",
        "message": "message for type 2",
        "info": {information to be passed}}]
}

\code+{end}

其中\@error_type\@，为固定的错误类型，用于分辨错误；\@message\@是推荐显示给用户的信息；而\@info\@是帮助客户端进一步处理错误的其他信息，\@info\@是一个Object，内部数据结构在不同请求中有不同的约定。

