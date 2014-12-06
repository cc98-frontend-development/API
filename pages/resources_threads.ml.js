\h3{讨论}

\h4{简介}

讨论资源是指向讨论实体的资源。用户可以在每个版块下发布新讨论，也可以针对他人发布的讨论进行回复，参考\link+[回复]{#/resources_posts.ml.js}。

讨论由一系列回复组成，可以看成一串（threads）回复，发布第一个回复的时候可以决定讨论的类型。暂定实现的讨论有以下三种类型：

话题（Topic）、问答（QA）和投票（Poll）。话题是基本类型，后两种可以看成是对话题的扩展。

讨论资源里记录了该讨论的第一个的回复，在该讨论里的回复在没有指定其他回复时默认回复这个第一回复。

\h4{数据结构}

\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class Thread
        String thread_id                # /resources/threads/{thread_id}
        String parent                   # /resources/boards/{parent}
        String oplist                   # /resources/oplists/{oplist}
        String default_oplist           # computed, i.e. /resources/boards/{parent}:default_thread_oplist, /resources/oplists/{default_thread_oplist}
        String default_post_oplist      # /resources/oplists/{default_post_oplist}
        String first_post               # /resources/threads/{first_post}
        String title
        String author                   # computed, i.e. /resources/posts/{first_post}:author, /resources/user/{author}
        String author_name              # computed, i.e. /resources/users/{author}:name
        String type                     # 'topic' 'qa' 'poll'
        String top_type                 # 'off' 'temp' 'board' 'parent' 'top'
        String good_type                # 'off' 'reserved' 'elite'
        Boolean anonymous
        Boolean no_post
        String time                     # ISO 8601 format
        Highlight highlight

    class Highlight
        String color
        Boolean bold
        Boolean italic
\code+{end}

\fig{begin}
	\img{pages/graph/erd/threads.png}

	\list*{
    	\* \@default_oplist\@，讨论的默认oplist，储存于\@/resources/boards/{parent}:default_thread_oplist\@
    	\* \@default_post_oplist\@，讨论中回复的默认oplist
    	\* \@type\@回复类型，'topic'（话题） 'qa'（问答） 'poll'（投票）
    	\* \@top_type\@置顶类型，'off'（无置顶） 'temp'（临时置顶） 'board'（板块置顶） 'parent'（上级板块置顶） 'top'（全站置顶）
    	\* \@good_type\@精华类型，'off'（未加精华） 'reserved'（保留回复） 'elite'（精华回复）
    	\* \@anonymous\@，此讨论是否为匿名讨论，默认为\@false\@
    	\* \@no_post\@，此讨论是否关闭回复，默认为\@false\@
		\* \@first_post\@，此讨论的第一个回复
		\* \@author\@ \@author_name\@，取自第一个回复的作者信息
    	\* \@time\@，此讨论发布时间
    	\* \@highlight\@，此讨论高亮状态：\list*{
        	\* \@color\@颜色，#XXXXXX格式
        	\* \@bold\@加粗
        	\* \@italic\@斜体
    	}
	}

\fig{end}

\h4{入口和过滤器}

特定讨论资源的固定入口为\@/resources/threads/{thread_id}\@，讨论列表资源入口为\@/resources/threads\@，配合过滤器可以筛选出需要的讨论列表。

讨论列表资源支持的过滤器：
\list#{
    \* \@?parent={parent}\@，某一板块下的讨论列表；
    \* \@?type={type}\@，某一类型的讨论列表；
    \* \@?top_type={top_type}\@，某一置顶的讨论列表；
    \* \@?good_type={good_type}\@，某一精华类型的讨论列表；
    \* \@?author={user_id}\@，某一作者发布的讨论列表；
    \* \@?count={count}&offset={offset}\@，讨论列表的第\@count*offset+1\@到\@count*offset+count\@项，共计\@count\@项。默认\@count=20, offset=0\@。\@count\@上限为100，即一个请求最多返回100条post的集合。
}

\h4{资源访问方法：OPTIONS}

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

讨论的\@id\@字段为发起讨论的第一个回复的\@id\@，用\@/resources/threads/{id}\@访问是讨论，而用\@/resources/posts/{id}\@访问则是回复。

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

