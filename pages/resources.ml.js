\h3{资源}

所有论坛资源的入口：
URL: \@https://api.cc98.org/resources\@

\h4{资源访问方法：OPTIONS} 
使用\@OPTIONS\@获取资源对于当前用户的访问方法，返回于回复的报头中\@Allow\@字段。

\h5{请求}

\@OPTIONS /resources HTTP/1.1\@

\h5{回复}

缓存策略：长过期，需验证。

\@Allow\@：当前允许的方法，包括\@OPTIONS\@和\@GET\@。

\@Link: </resources>; rel="self"; method="GET"\@

无报文。

\h4{读取资源列表：GET} 

读取论坛资源入口列表。

\h5{请求}

\@GET /resources HTTP/1.1\@

\h5{回复}

缓存策略：长过期，需验证。

\@Link: </resources>; rel="self"; method="GET"\@

报文：
\code+[json]{begin}
{ "resources": {
    "collection":[
        { "rel": "link", "href": "/resources/boards", "title": "板块" },
        { "rel": "link", "href": "/resources/threads", "title": "讨论" },
        { "rel": "link", "href": "/resources/posts", "title": "回复" },
        { "rel": "link", "href": "/resources/oplists", "title": "操作权限列表" },
        { "rel": "link", "href": "/resources/users", "title": "用户" },
        { "rel": "link", "href": "/resources/files", "title": "文件" },
        { "rel": "link", "href": "/resources/stats", "title": "统计" }],
    "id": "/resources",
    "source": "/resources"
    }
}

\code+{end}

\h5{资源类型：源和引用}

\@source\@表示该资源的固定来源，而\@id\@表示该资源的标识符。

源资源表示该资源指向的实体是相对固定的，表现为其\@id\@和\@source\@相同，比如代表用户的资源就是源资源。

引用资源表示资源指向的实体是相对不固定的，表现为其\@id\@和\@source\@不相同，比如代表最新贴子的资源就是引用资源。

上面的json代码表示的resources资源是源资源（\@id\@与\@source\@相同），它表现为在\@collection\@中，包括了一系列子资源的链接（\@"rel":"link"\@），链接的具体指向（e.g.\@"href":"/resources/boards"\@），子资源的人类可读的表示（e.g.\@"title":"板块"\@）。

