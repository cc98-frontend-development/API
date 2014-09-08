\h3{权限：版块}
\h4{简介}
版块所允许的一系列用户操作（operation）保存在对应的oplist资源里面。由于改动oplist的操作权限也是通过oplist记录的，所以oplist是有层级的。上层的oplist记录了改动下层oplist的权限。顶层oplist对于的是全站的权限，只有通过后台改写，API层面只能读取，不能改动。

版块对于的oplist，通过\@/resources/oplists/boards/{board_id}\@访问，回复中的\@source\@属性将反应这个oplist所在的资源位置\@/resources/oplists/{id}\@。

\h4{资源访问方法：OPTIONS}

\h5{版块oplist列表}

这个列表包括了所有版块的oplist，通常仅仅用于作为筛选版块oplist的入口，单纯的oplist列表似乎意义不大。

\h6{请求}

\code+[http]{begin}
OPTIONS /resources/oplists/boards HTTP/1.1
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
Link: </resources/oplists/boards>; rel="self"; method="GET"
\code+{end}

\h5{特定版块oplist}

\code+[http]{begin}
OPTIONS /resources/oplists/boards/624 HTTP/1.1
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
Allow: OPTIONS, GET, PUT, DELETE
Link: </resources/oplists/boards/624>; rel="self"; method="GET", </resources/oplists/523>; rel="parent"; method="GET"
\code+{end}

其中，\@rel="parent"\@链接指出的是针对这个oplist的oplist，oplist的id号为0了是全站oplist的oplist。

回复中允许的方法包括：\@GET\@获取oplist，\@PUT\@修改oplist，\@DELETE\@恢复为默认的版块oplist。

回复中允许的方法是根据用户实际可以进行的动作进行的，如用户不能修改这个oplist，则回复\@Allow: OPTIONS, GET\@。

\h4{获取版块oplist：GET}

\h5{获取版块下子版块的默认oplist}

每个版块的父版块中指定了其子版块的默认oplist，可以通过\@/resources/boards/{id}?default=boards\@访问。

\h6{请求}
\code+[http]{begin}
GET /resources/oplists/boards/624?default=boards HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards/624?default=boards>; rel="self"; method="GET", </resources/oplists/23>; rel="parent"; method="GET"
\code+{end}
\code+[json]{begin}
{ "oplists": {
    "oplist": {
      "id": "4",
      "parent": "23",
      "string": "enter: @users\n!enter: guest\n..."
    },
    "id": "/resources/oplists/boards/624?default=boards",
    "source": "/resources/oplists/4"
  }
}
\code+{end}

其中的\@string\@数据是用oplist语法表示的oplist。

\h5{使用filter\@parent\@获取特定版块下子版块的oplist列表} 

\h6{请求}

\code+[http]{begin}
GET /resources/oplists/boards?parent=624&type=boards HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards?parent=624&type=boards>; rel="self"; method="GET"
\code+{end}
\code+[json]{begin}
{ "oplists": {
    "collection":[
      { "rel": "link", "href=126", "parent": "624", "type": "boards" },
      { "rel": "link", "href=127", "parent": "624", "type": "boards" },
      { "rel": "link", "href=128", "parent": "624", "type": "boards" },
      ...
    ],
    "id": "/resources/oplists/boards?parent=624&type=boards",
    "source": "/resources/oplists/boards"
  }
}
\code+{end}

返回一系列指向关于版块oplist的链接，可以通过如\@/resources/oplists/boards/126\@的方式访问具体的oplist。 

\h5{获取特定版块oplist} 

\h6{请求}

\code+[http]{begin}
GET /resources/oplists/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards/624>; rel="self"; method="GET", </resources/oplists/568>; rel="parent"; method="GET", </resources/boards/624>; rel="target"; method="GET"
\code+{end}
\code+[json]{begin}
{ "oplists": {
    "oplist":{
      "id": "162",
      "parent": "568",
      "string": "enter: @users\n!enter: guest\n..."
    },
    "id": "/resources/oplists/boards/624",
    "source": "/resources/oplists/162"
  }
}
\code+{end}

上例所示：关于版块624的oplist id为162，它的oplist(parent)为568。

\h4{修改oplist：PUT}

\h6{请求}
\code+[http]{begin}
PUT /resources/oplists/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: no-cache, no-store
\code+{end}
\code+[json]{begin}
{ "oplists": {
    "oplist":{
      "id": "162",
      "parent": "568",
      "string": "enter: @users\n!enter: guest\n..."
    },
    "id": "/resources/oplists/boards/624",
    "source": "/resources/oplists/162"
  }
}
\code+{end}

\h6{返回}
前端仅仅可以修改\@string\@属性，其他部分应该保持和GET返回的一样，后端需要检查：

\list#{
    \*是否有Content-Length头，如没有，返回\@411 Length Required\@
    \*是否仅仅修改了\@string\@属性，如果修改其他部分，则回复\@400 Bad Request\@
    \*提交的\@string\@是否正确，如果\@string\@解析错误（格式错误或者内容错误）则回复\@400 Bad Request\@
    \*修改成功，回复\@204 No Content\@
}
如：

\code+[http]{begin}
HTTP/1.1 204 No Content
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards/624>; rel="self"; method="GET", </resources/oplists/568>; rel="parent"; method="GET", </resources/boards/624>; rel="target"; method="GET"
\code+{end}

或错误回复：

\code+[http]{begin}
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards/624>; rel="self"; method="GET", </resources/oplists/568>; rel="parent"; method="GET", </resources/boards/624>; rel="target"; method="GET"
\code+{end}
\code+[json]{begin}
{ "error":[{
    "type": "Invalid Content",
    "message": "修改了oplist外的metadata",
    "info": {information to be passed}}
    ]
}
\code+{end}

其中\@type\@可以为

\list*{
    \*\@Invalid Content\@，前端试图修改非\@string\@属性或提交的内容不能识别
    \*\@Invalid Oplist\@，前端提交了格式错误或内容错误的\@string\@属性(oplist)
}

\h4{修改oplist为默认oplist：DELETE}

每个版块的父版块中指定了其子版块的默认oplist，可以通过\@/resources/boards/{id}?default=boards\@访问。

使用DELETE对子版块的oplist进行了修改，需要还原成未修改的默认状态。
\h5{修改特定子版块的oplist为父版块所指定的默认oplist}

\h6{请求}
\code+[http]{begin}
DELETE /resources/oplists/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8; api_version=1.0
\code+{end}

\h6{回复}
请求成功
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Link: </resources/oplists/boards/624>; rel="self"; method="GET", </resources/oplists/568>; rel="parent"; method="GET", </resources/oplists/4>; rel="default"; method="GET"
\code+{end}

成功将版块624的oplist 162改写为父版块指定的默认oplist 4。

\h4{版块支持的op}

\table{begin}
\r{ \h op
    \h operand
    \h 说明
    \h 允许时记录
    \h 拒绝时记录}
\r{ \d \@display\@
    \d \@{board_id}\@
    \d 请求版块列表时，后端是否把该版块列入列表，被禁止display的用户，这个版块相当于是隐藏的，在任何列表中都看不见，只有手动输入board_id才能访问（注意：不显示的情况下依然可以进入版块）。
    \d 不记录
    \d 不记录}
\r{ \d \@enter\@
    \d \@{board_id}\@
    \d 后端是否允许访问版块内容的请求，可用于阻止某些版块对特定用户开放。
    \d 不记录
    \d 记录}
\r{ \d \@post\@
    \d \@({board_id}, {thread_title})\@
    \d 后端是否允许在版块中发布新讨论的请求，可用于阻止某些版块中特定用户发布新讨论。
    \d 不记录
    \d 记录}
\r{ \d \@edit\@
    \d \@({board_id}, ...)\@
    \d 后端是否允许改变版块的内容的请求，包括版块的名字、描述，版块的父版块（即移动版块）、子版块的oplist、子讨论的oplist、版块代理用户变量（比如说修改版主、贵宾等）等。有了这个op的权限等同于有了版块超级管理员的权限。
    \d 记录
    \d 记录}
\r{ \d \@edit_child\@
    \d \@({board_id}, {thread_id}, ...)\@ \@({board_id}, {board_id}, ...)\@
    \d 后端是否允许改变子版块（子讨论）的内容的请求，包括子版块的名字、描述，子版块的父版块（即移动子版块）、子版块的oplist、子讨论的oplist、子版块代理用户变量（比如说修改版主、贵宾等）等。有了这个op的权限等同于有了版块普通管理员的权限，不能改变版块本身内容，但可以改变子版块、子讨论的内容。
    \d 记录
    \d 记录}
\r{ \d \@anon_display\@
    \d \@{board_id}\@
    \d 后端是否允许查看匿名版块中的匿名信息的请求。
    \d 记录
    \d 记录}
\table{end}
