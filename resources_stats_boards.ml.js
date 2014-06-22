\h3{统计：版块}
\h4{简介}

由于cc98版块有层级关系，母版的统计资料\emphasis{应该}与子版一致，后端在更新统计资料时，\emphasis{应该}采用比如回溯的方法逐级更新统计信息。

\h4{获取统计：板块的列表：GET}

\h5{获取所有板块}

\h6{请求}
请求可不授权，授权后请求的处理可不相同（比如处理仅部分用户可以访问板块）
\code+[http]{begin}
GET /resources/stats/boards HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8

\code+{end}

\h6{回复}
注意：缓存为30秒，无需重新验证。
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: XXX
Cache-control: max-age=30 
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}

\code+[json]{begin}
{ "boards": {
    "collection":[
        { "rel":"link", "href":"0", "parent":null, "title": "", "description":"根板块" },
        { "rel":"link", "href":"2", "parent":"0", "title": "教师答疑", "description":"教师答疑、学生提问、师生交流、学习心得体会，导论、网络课件下载" },
        { "rel":"link", "href":"624", "parent": "2", "title": "计算机类通识课程答疑版", "description":"主要面向大一学生，课程包含：大学计算机基础、C/C++语言、JAVA、VB语言等通识课程" },
        ...],
    "parent": "/resources/stats",
    "id": "/resources/stats/boards",
    "source": "/resources/stats/boards"
    "links": [{
        "method": "GET",
        "rel": "self",
        "href": "{id}" 
    }]
    }
}

\code+{end}

\h5{获取某一板块}

\h6{请求}
请求可不授权，授权后请求的处理可不相同（比如处理仅部分用户可以访问板块）
\code+[http]{begin}
GET /resources/stats/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8

\code+{end}

\h6{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: XXX
Cache-control: max-age=30
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}

\code+[json]{begin}
{ "boards": {
    "board":{
        "id": "624",
        "parent": "2",
        "title": "计算机类通识课程答疑版",
        "description":"主要面向大一学生，课程包含：大学计算机基础、C/C++语言、JAVA、VB语言等通识课程",
        ...},
    "parent": "/resources/stats/boards/2",
    "id": "/resources/stats/boards/624",
    "source": "/resources/stats/boards/624"
    "links": [{
        "method": "GET",
        "rel": "self",
        "href": "{id}"}]
    }
}

\code+{end}

其中\@board\@的内容如下：
\list*{
    \* \@id\@: 板块的源资源定位号
    \* \@parent\@: 板块的母板块的\@id\@，如果是顶级板块则为\@0\@（根板块），如果是根板块则为\@null\@
    \* \@title\@: 板块名
    \* \@description\@: 板块简介
    \* \@total_topic_count\@ 所有帖子计数
    \* \@total_post_count\@ 所有回复计数
    \* \@today_post_count\@ 今日回复计数
    \* \@last_post_id\@ 最后的回复id
}
\h4{统计：其他方法}

不允许用其他方法访问统计资源，如果使用其他方法访问，应回复：

\code+[http]{begin}
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json; charset=utf-8
Cache-control: no-cache, no-store 
Allow: GET

\code+{end}

\code+[json]{begin}
{ "error":[{
    "type": "method not allowed",
    "message": "不支持使用{method}访问资源{id}"}]
}

\code+{end}
