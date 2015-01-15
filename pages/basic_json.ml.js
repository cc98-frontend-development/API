\h3{JSON}
API的内容部分由JSON表示，约定的格式如下：

\h4{URL模板}

URL模板由\@{name}\@表示需要替换的内容，其中的变量名则为JSON中可以访问的内部变量名，内部变量的值在传输时不做替换；
如果是外部的变量名（仅仅用于API说明，不作为传输使用），则用\@$\@开头，用以表示区分。
\code+[json]{begin}
{
    "posts": {
        "id": "152",
        ...},
    "self": "posts/{id}",
    "base": "/resources/"
}

\code+{end}

\@{A|B}\@表示，默认情况下为\@B\@，除非指定了\@A\@，通常\@A\@是外部变量，传输时，替换成对应的值。

其中顶层的\@id\@传输时表示同上，使用时解析成：\@post/152\@。

\h4{顶层元素}

顶层元素除了保留的关键字指定的属性外，其余属性为资源属性，不同类型的资源属性名不同，比如回复资源的属性名为\@posts\@，回复统计资源的属性名为\@poststats\@。具体的属性名，查看相应的资源文档。

\h5{保留的关键字}

\list*{
	\* \@base\@（可选） 此次回复的所有的URL，如果是相对路径表示，则\@base\@表示了该相对路径的起始路径（如果不使用\@base\@，则该URL\emphasis{必须}是一绝对路径）。\@base\@\emphasis{必须}是一绝对路径，且以\@"/"\@结尾，默认情况下，其值为\@"/"\@。
	\* \@item\@（必需） 仅仅当该资源为子资源资源列表时为保留字，表示访问子资源的URL，通常为模板。
	\* \@self\@（必需） 该请求自身的URL表示，通常为模板。
	\* \@source\@（必需） 该请求的源资源所在的URL表示，当\@source\@与\@source\@相同时，表示直接访源资源；否则，则访问的是一个引用资源或者对源资源进行了部分访问（比如通过滤器）。
	\* \@links\@（可选） 该资源相关资源链接的信息，查看下述\strong{相关资源链接}部分。
	\* \@error\@（必需） 仅仅在错误时为保留字，错误信息，查看下述\strong{错误信息}部分。
}

\h5{相关资源链接}
表示该资源的相关资源，和他们的访问方式。

当此资源为一资源列表时，\@links\@也表示了其中的资源的相关资源关系。

\@links\@为一Object，其中每一个相关资源链接都为一Object，Object名为资源名，Object包括以下属性：
\list*{
	\* \@href\@（必需） 该相关资源的URL表示，通常为模板。
	\* \@method\@（可选） 该相关资源的访问方法，默认为\@"GET"\@。
	\* \@description\@（可选） 关于该资源的描述。
}

\h5{资源}

资源的JSON表示有两种形式，如果表示单一资源，则是一Object，名为资源名；如果是资源列表，则是一Array，名为资源名，其中的元素为单一资源的Object。

\h6{资源保留字}
资源内除了保留字规定的属性有固定的意义外，其他均为普通属性，不同的资源有不同的普通属性。

\list*{
	\* \@id\@（必需） 该资源的标识符，字符串格式。
}

单一资源：
\code+[json]{begin}
{
    "posts": {
        "id": "152",
        ...},
    "self": "posts/{id}",
    "source": "posts/{id}",
    "base": "/resources/"
}

\code+{end}

资源列表：
\code+[json]{begin}
{
    "posts": [
        {
            "id": "152",
            ...},
        {
            "id": "153",
            ...},
        ...],
    "item": "posts/{id}",
    "self": "posts/?parent={$parent}&count={$count}&offset={$offset}",
    "source": "posts/",
    "base": "/resources/",
    "links": {
        "first_page": {
            "href": "posts/?parent={$parent}&count={$count}&offset=0",
            "method": "GET"
        },
        "prev_page": {
            "href": "posts/?parent={$parent}&count={$count}&offset={$offset-1}",
            "method": "GET"
        },
        "next_page": {
            "href": "posts/?parent={$parent}&count={$count}&offset={$offset+1}",
            "method": "GET"
        },
        "last_page": {
            "href": "posts/?parent={$parent}&count={$count}&offset=83",
            "method": "GET"
        }
    }
}

\code+{end}

上例表示，返回的资源是一系列的posts资源（回复）的列表，该资源本体（\@source\@）为\@/resources/posts/\@。

实际访问（\@self\@）的是经过过滤器\@parent\@筛选后的，父资源（讨论）的id为\@$parent\@的一系列资源。

访问其中第一个资源（\@item\@），使用URL：\@"/resources/posts/152"\@（根据\@base\@和\@id\@计算出）。

\@links\@则记录了相关资源（第一页，上一页，下一页，最后页）的访问方式，也记录了发表新回复，编辑回复，删除回复的方式。

其中\@$parent\@表示指定的任意父资源id，\@$count\@表示指定的任意单次返回最大资源数，\@$offset\@表示指定的返回页面的偏移量。

\h4{错误信息}

错误信息，使用\@error\@关键字。
通用的格式为：

\code+[json]{begin}
{ "error":[
    {
        "error_type": "error type 1",
        "message": "message for type 1",
        "info": {information to be passed}},
    {
        "error_type": "error type 2",
        "message": "message for type 2",
        "info": {information to be passed}}]
}

\code+{end}

\@error\@类型有如下保留字:
\list*{
	\* \@error_type\@（必需）固定的错误类型，用于分辨错误。
	\* \@message\@（必需） 推荐显示给用户的信息。
	\* \@info\@（可选） 是帮助客户端进一步处理错误的其他信息，\@info\@是一个Object，内部数据结构在不同请求中有不同的约定。
}

