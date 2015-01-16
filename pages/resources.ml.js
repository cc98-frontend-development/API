\h3{资源}

所有论坛资源的入口：
URL: \@https://api.cc98.org/resources\@

\h4{资源访问方法：OPTIONS} 
使用\@OPTIONS\@获取资源对于当前用户的访问方法，返回于回复的报头中\@Allow\@字段。

\h5{请求}

\@OPTIONS /resources HTTP/1.1\@

\h5{回复}

\alert[info]{max-age:months, must-revalidate}

\@Allow\@：当前允许的方法，包括\@OPTIONS\@和\@GET\@。

\h4{读取资源列表：GET} 

读取论坛资源入口列表。

\h5{请求}

\@GET /resources HTTP/1.1\@

\h5{回复}

\alert[info]{max-age:months, must-revalidate}

报文：
\code+[json]{begin}
{ 
    "resources": [
        { "id": "boards",      "title": "板块" },
        { "id": "threads",     "title": "讨论" },
        { "id": "posts",       "title": "回复" },
        { "id": "oplists",     "title": "操作权限列表" },
        { "id": "users",       "title": "用户" },
        { "id": "files",       "title": "文件" },
        { "id": "counters",    "title": "计数器" },
        { "id": "stats",       "title": "统计" }
    ],
    "links": {
        "options": {
            "href" : "resources/{id}",
            "method": "OPTIONS",
            "description": "获取各个资源的访问方法"
        },
    },
    "self": "resources/",
    "source": "resources/",
    "base": "/"
}

\code+{end}

\h5{资源类型：源和引用}

\@source\@表示该资源的固定来源，而\@self\@表示该资源的此次访问标识符。

源资源表示该资源指向的实体是相对固定的，表现为其\@self\@和\@source\@相同，比如代表用户的资源就是源资源。

引用资源表示资源指向的实体是相对不固定的，表现为其\@self\@和\@source\@不相同，比如代表最新贴子的资源就是引用资源。

