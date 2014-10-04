\h3{资源}

所有论坛资源的入口：
URL: \@https://api.cc98.org/resources\@

\h4{资源访问方法：OPTIONS} 
\h5{请求}
\code+[http]{begin}
OPTIONS /resources HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0

\code+{end}

\h5{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET
Link: </resources>; rel="self"; method="GET"

\code+{end}

\h4{读取资源列表：GET} 

\h5{请求}
请求无需授权，授权后和无授权下的请求处理相同。
\code+[http]{begin}
GET /resources HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0

\code+{end}

\h5{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources>; rel="self"; method="GET"

\code+{end}

\code+[json]{begin}
{ "resources": {
    "collection":[
        { "rel": "link", "href": "/resources/boards", "title": "板块" },
        { "rel": "link", "href": "/resources/topics", "title": "讨论" },
        { "rel": "link", "href": "/resources/posts", "title": "回复" },
        { "rel": "link", "href": "/resources/users", "title": "用户" },
        { "rel": "link", "href": "/resources/files", "title": "文件" },
        { "rel": "link", "href": "/resources/stats", "title": "统计" }],
    "id": "/resources",
    "source": "/resources"
    }
}

\code+{end}

\h4{源和引用}

源资源表示该资源指向的实体是相对固定的，表现为其\@id\@和\@source\@相同，比如代表用户的资源就是源资源。

引用资源表示资源指向的实体是相对不固定的，表现为其\@id\@和\@source\@不相同，比如代表最新贴子的资源就是引用资源。

上面的json代码表示的resources资源是源资源（\@id\@与\@source\@相同），它表现为在\@collection\@中，包括了一系列子资源的链接（\@"rel":"link"\@），链接的具体指向（e.g.\@"href":"/resources/boards"\@），子资源的人类可读的表示（e.g.\@"title":"板块"\@）。
