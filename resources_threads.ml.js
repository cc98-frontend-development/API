\h3{讨论}

\h4{简介}

讨论资源是指向讨论实体的资源。用户可以在每个版块下发布新讨论，也可以针对他人发布的讨论进行回复，参考\link+[帖子]{#/post.ml.js}。

讨论由一系列帖子组成，可以看成一串（threads）帖子，发布第一个帖子的时候可以决定讨论的类型。暂定实现的讨论有以下三种类型：

话题（Topic）、问答（QA）和投票（Poll）。话题是基本类型，后两种可以看成是对话题的扩展。

访问讨论列表，采用URI\@/resourses/threads\@，通常使用filter\@parent\@获得特定版块下的讨论列表\@/resourses/threads?parent={id}\@，而单独的讨论则用URI\@/resourses/threads/{id}\@访问。

\h4{资源访问方法：OPTIONS}

\h5{全局讨论列表}

\h6{请求}
\code+[http]{begin}
OPTIONS /resources/threads HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET
Link: </resources/threads>; rel="self"; method="GET", </resources/threads?count=20&offset=0>; rel="first"; method="GET"
\code+{end}

全局版块列表返回的Allow仅仅支持\@OPTIONS\@和\@GET\@，必须指定其所在版块才能使用POST方法。

\h5{特定版块下的讨论列表}

\h6{请求}
\code+[http]{begin}
OPTIONS /resources/threads?parent=624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET, POST
Link: </resources/threads?parent=624>; rel="self"; method="GET", </resources/threads?parent=624&count=20&offset=0>; rel="first"; method="GET"
\code+{end}

注意，返回的链接，应当包含\@rel="first"\@，指向最近的讨论的分页资源，而客户端应该采用\@rel="first"\@的链接访问资源。

\h5{特定的讨论}

\h6{请求}
\code+[http]{begin}
OPTIONS /resources/threads/3816 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET, PUT, DELETE, PATCH
Link: </resources/threads/3816>; rel="self"; method="GET"
\code+{end}

\h4{获取讨论列表：GET}

\h5{全局讨论列表}

请求全局讨论列表，（按时间顺序就是 最新讨论），默认只返回第一页的内容：

\h6{请求}

\code+[http]{begin}
GET /resources/threads HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

等同于：
\code+[http]{begin}
GET /resources/threads?count=20&offset=0 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=300 
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/threads?count=20&offset=0>; rel="self"; method="GET", </resources/threads?count=20&offset=0>; rel="first"; method="GET", </resources/threads?count=20&offset=1>; rel="next"; method="GET", </resources/threads?count=20&offset=1253632>; rel="last"; method="GET"
\code+{end}

\code+[json]{begin}
{ "threads": {
    "collection":[
        { "rel": "link", "href": "4396764", "parent": "624", "title": "java实验考对3道得几分？" },
        { "rel": "link", "href": "4400718", "parent": "114", "title": "图书馆热成狗了没人管管么" },
        ...
    ],
    "id": "/resources/threads?count=20&offset=0",
    "source": "/resources/threads"
    }
}
\code+{end}

返回的是一个指向具体讨论的链接列表，其中报头\@Link\@应该包括下一页的链接\@rel="next"\@，第一页链接\@rel="first"\@，最后一页的链接\@rel="last"\@

注意：缓存为300秒，无需重新验证。

\h5{特定版块下的讨论列表}

使用filter\@parent\@获取特定版块下的讨论列表，默认只返回第一页内容。

\h6{请求}
\code+[http]{begin}
GET /resources/threads?parent=624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=3600, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET, POST
Link: </resources/threads?parent=624&count=20&offset=0>; rel="self"; method="GET", </resources/threads?parent=624&count=20&offset=0>; rel="first"; method="GET", </resources/threads?parent=624&count=20&offset=1>; rel="next"; method="GET", </resources/threads?parent=624&count=20&offset=236>; rel="last"; method="GET"
\code+{end}

\code+[json]{begin}
{ "threads": {
    "collection":[
        { "rel": "link", "href": "4396764", "parent": "624", "title": "java实验考对3道得几分？" },
        { "rel": "link", "href": "4327251", "parent": "624", "title": "java在线练习系统问题，求救" },
        ...
    ],
    "id": "/resources/threads?parent=624&count=20&offset=0",
    "source": "/resources/threads"
    }
}
\code+{end}

注意：缓存为3600秒，需重新验证。

\h5{获取特定的讨论}

讨论的\@id\@字段为发起讨论的第一个帖子的\@id\@，用\@/resources/threads/{id}\@访问是讨论，而用\@/resources/posts/{id}\@访问则是帖子。

\h6{请求}

\code+[http]{begin}
GET /resources/threads/4396764 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET, PUT, DELETE, PATCH
Link: </resources/threads/4396764>; rel="self"; method="GET", </resources/threads/4396764>; rel="next"; method="GET"
\code+{end}

\code+[json]{begin}
{ "threads": {
    "thread":{
        "id": "4396764",
        "parent": "624",
        "title": "java实验考对3道得几分？",
        "time": "2014-05-23T14:25:10"
        "user": { "rel":"link", "href": "/resources/users/496780", "title":"whatakid"},
        ...
    },
    "id": "/resources/threads/4396764",
    "source": "/resources/threads/4396764"
    }
}
\code+{end}

其中\@thread\@的内容如下：
\list*{
    \* \@id\@: 讨论的源资源定位号，同时也是首帖的源资源定位号
    \* \@parent\@: 讨论所在版块的\@id\@
    \* \@title\@: 讨论标题
    \* \@time\@: 新建讨论的时间：ISO 8601格式。
    \* \@user\@: 指向发帖用户的链接
    \* \@type\@: 讨论类型，可能值为：\list*{
        \* \@topic\@: 话题
        \* \@qa\@: 问答
        \* \@poll\@: 投票
        }
    \* \@top_type\@: 置顶类型，可能值为：\list*{
        \* \@off\@: 未置顶
        \* \@temp\@: 临时置顶
        \* \@board\@: 本版置顶
        \* \@parent\@: 上级版区置顶
        \* \@top\@: 总站置顶
    }
    \* \@good_type\@: 保留/精华类型，可能值为：\list*{
        \* \@off\@: 普通讨论
        \* \@reserve\@: 保留讨论
        \* \@elite\@: 精华讨论
    }
    \* \@lock\@: 是否锁定，\@true\@ or \@false\@
    \* \@anonymous\@: 是否为匿名讨论，\@true\@ or \@false\@
    \* \@poster_only\@: 仅楼主可见，\@true\@ or \@false\@
    \* \@highlight\@: 一个对象，包括：\list*{
        \* \@bold\@: 加粗，\@true\@ or \@false\@
        \* \@italic\@: 倾斜，\@true\@ or \@false\@
        \* \@color\@: 颜色，\@#000000\@至\@#FFFFFF\@，默认为\@auto\@
    }

}

