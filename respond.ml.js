\h3{回复}

回复的报头应该至少包括：

\list*{
    \* 一个有意义的HTTP状态码，比如\@200 OK\@，\@304 Not Modified\@。
    \* 内容MIME类型\@Content-Type\@。
    \* 内容长度\@Content-Length\@，可以帮助浏览器减少连接开销。
    \* 缓存策略\@Cache-control\@。
    \* validator，与缓存的验证有关的信息\@Last-Modified\@、\@ETag\@。
    \* \@Date\@。
}

\h4{HTTP 状态码}

HTTP 状态码在\link+[RFC2612的第10节]{http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10}定义。

以下列出了本API使用的HTTP 状态码。

\h5{回复状态码：针对任意请求}

\@200 OK\@请求成功，使用GET、表示资源成功获取，返回资源内容；返回报头\emphasis{应该}包括下一个页面的\@Location\@，PUT和DELETE只有在授权时才能发起。

\@201 Created\@：表示资源成功被创建，回复的报头里\emphasis{应该}包括\@Location\@指出新资源的URI。

\@304 Not Modified\@：表示访问的资源没有改动，\emphasis{必须}没有内容，但可以更新报头数据。\emphasis{必须}提供\@Date\@报头，这样可以让没有时钟的客户端依然可以正确处理缓存。

\@307 Temporary Redirect\@：表示访问的资源暂时被定位到其他地方，比如服务器进行维护时可以重定向到备用服务器，继续提供服务，因为是暂时的，下次访问的时候依然\emphasis{应该}使用原来的URI。这个回复可以被缓存，通常缓存的时间要比正常服务的时候要短。

\@400 Bad Request\@：服务器器接受请求，但是请求的内容有错误，不符合API的定义。

\@401 Unauthorized\@：请求需要认证才能访问，回复中\emphasis{必须}包括\@WWW-Authenticate\@报头，本API使用\link+[OAuth2]{http://oauth.net/2/}的Bearer Token，具体内容请访问：\link[授权]{#/auth.ml.js}。

\@404 Not Found\@：请求的资源不存在。

\@405 Method Not Allowed\@：请求的资源不支持用请求的方法访问，回复\emphasis{必须}包括\@Allow\@报头，指出这个资源支持哪些访问方法。

\@406 Not Acceptable\@：服务器不能提供请求所需要的内容类型，由于本API已经规定了请求的内容类型，这个状态码的产生可能是由于客户端请求了错误的内容类型，或者服务器端没有正确的产生内容类型。

\@500 Internal Server Error\@：服务器由于意外的原因发生错误。

\@501 Not implemented\@：服务器不支持请求的方法。

\@503 Service Unavailable\@：服务器暂时不能提供服务，可能服务器在维护中，\emphasis{应该}给出进一步的错误信息。

\h5{回复状态码：仅针对授权请求}

\h6{任意方法}

\@200 OK\@请求成功，使用GET、表示资源成功获取，返回资源内容；使用DELETE表示资源成功被删除。

\@403 Forbidden\@：服务器接受并理解请求，但由于授权的限制无法访问资源。回复的内容\emphasis{应该}包括具体的原因，比如：”你所在的用户组未被授权“。

\@410 Gone\@：资源由于历史原因（丢失、API改版等）无法访问，回复的内容\emphasis{应该}包括无法访问的具体原因。

\h6{POST方法}

\@201 Created\@：表示资源成功被创建，回复的报头里\emphasis{应该}包括\@Location\@指出新资源的URI。

\@411 Length Required\@：需要客户端提供\@Content-Lenght\@报头。

\@413 Request Entity Too Large\@：请求的内容过大，比如说用户企图上传大于限制的文件。

\h6{PUT方法}

\@204 No Content\@：表示资源被成功修改，没有内容返回。

\@411 Length Required\@：需要客户端提供\@Content-Lenght\@报头。

\@413 Request Entity Too Large\@：请求的内容过大，比如说用户企图上传大于限制的文件。

\h6{DELETE方法}

\@204 No Content\@：表示资源被成功删除，没有内容返回。

\h4{错误信息}

很多的情况下，光通过HTTP 状态码表示的信息是不够充分的，需要进一步地在内容处返回更加详细的信息。

通用的格式为：

\code+[json]{begin}
{ "error":[{
    "type": "error type 1",
    "message": "message for type 1",
    "info": {information to be passed}},{
    "type": "error type 2",
    "message": "message for type 2",
    "info": {information to be passed}}
    ]
}

\code+{end}

其中\@type\@，为固定的错误类型，用于分辨错误；\@message\@是推荐显示给用户的信息；而\@info\@是帮助客户端进一步处理错误的其他信息，\@info\@是一个Object，内部数据结构在不同请求中有不同的约定。

