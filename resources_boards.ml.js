\h3{版块}

\h4{简介}
板块资源是指向板块实体的资源。cc98存在多级的板块，即有母版和子版。在API中，用\@parent\@属性标记板块的母板块，而顶级板块即所有\@parent=0\@，\@0\@是根板块的\@id\@。而根板块的\@parent\@为\@null\@。

\h4{获取板块列表：GET}

用GET访问\@/resources/borads\@可获取所有板块的集合。通常使用filter\@parent\@来获得特定板块下的第一级子板块。如GET \@/resources/boards?parent=0\@获取顶级板块（根板块的下一级板块）。在这里，使用filter\@parent\@相当于是一个引用资源，获得的是源资源的链接。

\h5{获取所有板块}

所有板块的源资源都定位在\@/resources/boards/{id}\@，他们的集合则是\@/resources/boards\@，仅仅包括源资源的链接和基本描述。

\h6{请求}
请求可不授权，授权后请求的处理可不相同（比如处理仅部分用户可以访问板块）
\code+[http]{begin}
GET /resources/boards HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8

\code+{end}

\h6{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}

\code+[json]{begin}
{ "boards": {
    "collection":[
        { "rel":"link", "href":"0", "parent":null, "title": "", "description":"根板块" },
        { "rel":"link", "href":"2", "parent":"0", "title": "教师答疑", "description":"教师答疑、学生提问、师生交流、学习心得体会，导论、网络课件下载" },
        { "rel":"link", "href":"624", "parent": "2", "title": "计算机类通识课程答疑版", "description":"主要面向大一学生，课程包含：大学计算机基础、C/C++语言、JAVA、VB语言等通识课程" },
        ...],
    "parent": "/resources",
    "id": "/resources/boards",
    "source": "/resources/boards"
    "links": [{
        "method": "GET",
        "rel": "self",
        "href": "{id}"
    }]
    }
}

\code+{end}

\h5{使用filter\@parent\@获取某板块的子版}

使用filter的回复的格式和没有使用的相同，仅包含链接和基本信息。

\h6{请求}
请求可不授权，授权后请求的处理可不相同（比如处理仅部分用户可以访问板块）
\code+[http]{begin}
GET /resources/boards?parent=2 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8

\code+{end}

\h6{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}

\code+[json]{begin}
{ "boards": {
    "collection":[
        { "rel": "link", "href": "279", "parent": "2", "title": "教师答疑区事务版", "description":"受理开版请求及区下老师要求" },
        { "rel": "link", "href": "624", "parent": "2", "title": "计算机类通识课程答疑版", "description":"主要面向大一学生，课程包含：大学计算机基础、C/C++语言、JAVA、VB语言等通识课程" }
        ...],
    "parent": "/resources",
    "id": "/resources/boards?parent=2",
    "source": "/resources/boards"
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
GET /resources/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8

\code+{end}

\h6{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}

\code+[json]{begin}
{ "boards": {
    "board":{
        "id": "624",
        "parent": "2",
        "title": "计算机类通识课程答疑版",
        "description":"主要面向大一学生，课程包含：大学计算机基础、C/C++语言、JAVA、VB语言等通识课程",
        "manager":[{
            "rel":"link", "href": "/resources/users/1641231", "title":"chenjh919"},{
            "rel":"link", "href": "/resources/users/1342331", "title":"jijm"},{
            "rel":"link", "href": "/resources/users/1442852", "title":"luhq"},...],
        ...},
    "parent": "/resources/boards/2",
    "id": "/resources/boards/624",
    "source": "/resources/boards/624"
    "links": [{
        "method": "GET",
        "rel": "self",
        "href": "{id}"},{
        "method": "GET",
        "rel": "stats",
        "href": "/resources/stats/boards/{id}"}
    ]
    }
}

\code+{end}

其中\@board\@的内容如下：
\list*{
    \* \@id\@: 板块的源资源定位号
    \* \@parent\@: 板块的母板块的\@id\@，如果是顶级板块则为\@0\@（根板块），如果是根板块则为\@null\@
    \* \@title\@: 板块名
    \* \@description\@: 板块简介
    \* \@manager\@: 一数组，该版面负责人，每项为指向用户资源的链接
    \* \@anonymous\@: 是否为匿名板块，\@true\@ or \@false\@
    \* \@poster_only_setting\@: 该版“仅楼主可见”功能设置，可能的值为：\list*{
            \* \@off\@: 该功能被禁用
            \* \@stop\@: 该功能被停用，不能设置新的仅楼主可见，但过去的设置依然有效
            \* \@admin_only\@: 该功能仅有管理权限的用户可使用
            \* \@on\@: 该功能完全开放，任何人都可使用
        }
    \* \@viewer_filter_setting\@: 该版“特定用户可见”功能设置，可能的值为：\list*{
            \* \@off\@: 该功能被禁用
            \* \@stop\@: 该功能被停用，不能设置新的特定用户可见，但过去的设置依然有效
            \* \@admin_only\@: 该功能仅有管理权限的用户可使用
            \* \@on\@: 该功能完全开放，任何人都可使用
        }


}
