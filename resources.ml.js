\h3{资源}

资源是基本API的组成部分

URL: \@https://www.cc98.org/resources\@

\h4{GET} 读取资源列表

请求:
请求无需认证
\code{begin}
GET /resources HTTP/1.1
Host: www.cc98.org
Content-Type: application/json

\code{end}

成功回复:
\code{begin}
HTTP/1.1 200 OK
Content-Type: application/json
{ "resources": [
    { "link": "resources/boards", "title": "板块" },
    { "link": "resources/topics", "title": "讨论" },
    { "link": "resources/posts", "title": "回复" },
    { "link": "resources/users", "title": "用户" }
}

\code{end}

错误回复：

