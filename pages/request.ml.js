\h3{请求}

\h4{简介}

\h5{媒体类型}

API请求的\@Content-Type\@\emphasis{必须}为\@Content-Type: application/json; charset=utf-8; api_version=1.0\@，如果请求使用不支持的媒体类型，则应该返回\@415 Unsupported Media Type\@
\code+[http]{begin}
OPTIONS /resources/boards/624 HTTP/1.1
Host: api.cc98.org
Content-Type: application/json; charset=utf-8
\code+{end}

\h6{回复}

\code+[http]{begin}
HTTP/1.1 415 Unsupported Media Type
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: no-cache, no-store 
\code+{end}

\code+[json]{begin}
{ "error":[{
    "type": "media type not supported",
    "message": "不支持使用{content-type}访问资源{id}"}]
}
\code+{end}

其中，\@type\@可以为\@media type not supported\@，表示媒体类型错误，也可以为\@entity media type not supported\@表示媒体类型正确，但内容实体不符合该媒体类型。

\h5{限速}

任何请求都\emphasis{必须}通过服务器段限速的要求，如果不符合限速要求的，返回\@429 Too Many Request\@，具体参考\link+[限速]{#/ratelimit.ml.js}。

\h5{授权}

很多资源需要用户授权才可以访问，如果试图在没有授权下访问，返回\@401 Unauthorized\@，如果已经授权，但由于权限设置无法访问，则返回\@403 Forbidden\@。具体内容请访问：\link+[授权]{#/auth.ml.js}。

\h4{\@OPTIONS\@}

每个合法资源的URI都支持的方法，用于获得该URI支持的HTTP方法，该请求仅仅需要报头，如果有内容部分，则内容部分被忽略。返回的回复仅有报头，其中的\@Allow\@列出的该URI支持的所有访问方法。如：

\code+[http]{begin}
OPTIONS /resources/boards/624 HTTP/1.1
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
Allow: OPTIONS, GET, POST, POST, DELETE, PATCH
Link: </resources/boards/624>; rel="self"; method="GET", </resources/stats/boards/624>; rel="stats"; method="GET"
\code+{end}

这里列出的是该URI支持的方法，并不是指用户可以使用的获得数据的方法，能否获得数据，区决于用户是否是授权用户和用户是否有相应权限。

如果使用\@Allow\@列出的访问方法以外的方法访问，则应该回复

\code+[http]{begin}
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json; charset=utf-8; api_version=1.0
Cache-control: no-cache, no-store 
Allow: OPTIONS, GET ...

\code+{end}

\code+[json]{begin}
{ "error":[{
    "type": "method not allowed",
    "message": "不支持使用{method}访问资源{id}"}]
}
\code+{end}

\h4{\@GET\@}

每个合法资源的的API都支持该方法，表示获取该URI指向的资源的（json）表现，如果该URI指向的资源不存在对应的实体，则返回\@404 Not Found\@。\@GET\@根据\link+[rfc2616-sec9]{http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html}的定义，属于安全方法，即无副作用，不会改动服务器上的内容。

\@GET\@方法可以使用直接编码于URI的参数作为filter，对资源的表现进行进一步的筛选。使用filter时，返回的内容实体的格式和不使用filter一样。

\h5{常用的filter}
\list#{

    \* \@?parent={id}\@：用于在有层级的资源中，筛选出某一资源的子资源。

    \* \@?type={type}\@：用于在多种类型的资源中，筛选出某一类型资源。

    \* \@?count={block_size}&offset={block_num}\@：用于筛选出在特定位置（\@{block_num}\@×\@{block_size}\@）特定数量（\@block_size\@）的内容，比如分页显示时，显示第2页，每页显示50条，则\@?count=50&offset=1\@表示筛选出第51条到100（\@index:[50×1, 50×1+50)\@）。
}

如果资源允许任意单个filter，以上filter可以联合使用，不论URI中编码的顺序如何，都按照上述顺序解析，即filter\@parent\@的结果再进行filter\@type\@筛选，最后进行filter\@count&offset\@筛选。
