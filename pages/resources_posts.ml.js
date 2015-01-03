\h3{回复}

\h4{简介}

回复资源的实体对应于用户的评论贴或回复贴，回复资源是讨论资源的子资源。一个讨论必须有一个回复，即讨论发起者的第一个回复（顶楼）。

回复存在一个回复的对象\@reply_to\@。在讨论中的其他回复默认回复对象为第一个回复，也可指定为其他回复，而第一个回复的回复对象为自身。

\h4{数据结构}

\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class Post 
        String post_id              # /resources/posts/{post_id}
        String parent               # /resources/threads/{parent}
        String reply_to             # /resources/posts/{reply_to}
        String oplist               # /resources/oplists/{oplist}
        String default_post_oplist  # computed, i.e. /resources/threads/{parent}:default_post_oplist, /resources/oplists/{default_post_oplist}
        Number rank_score           # computed, i.e. /resources/stats/posts/{post_id}:rank_score
        Boolean enabled   
        Boolean hidden    
        Boolean anonymous           # computed, i.e. /resources/threads/{parent}:anonymous
        String content
        String time                 # ISO 8601 format
        String author               # /resources/users/{author}
        String author_name          # computed
        Object ext                  # reserved for future use

\code+{end}

\fig{begin}

    \img{pages/graph/erd/posts.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}

\fig{end}

\list*{
    \* \@parent\@，指向上级（讨论）
    \* \@default_post_oplist\@，储存于\@/resources/threads/{parent}:default_post_oplist\@
    \* \@rank_score\@，用于排序的评分，储存于\@/resources/stats/posts/{post_id}:rank_score\@
    \* \@enabled\@通常为true，当为false时表示这个回复被关闭，用于占楼但不显示
    \* \@hidden\@通常为false，当为true时表示这个回复可以被隐藏
    \* \@anonymous\@，是否匿名，由上级资源（讨论）指定，默认为false，为true时，author为空，author_name为hashed
    \* \@author_name\@，储存于\@/resources/users/{author}:name\@
}

\h4{入口和过滤器}

特定回复的资源的固定入口为\@/resources/posts/{post_id}\@，回复列表资源的固定入口为\@/resources/posts\@。

回复列表资源支持的过滤器：
\list#{
    \* \@?parent={parent}\@，某一讨论下的回复列表；
    \* \@?reply_to={reply_to}\@，回复某一回复的回复列表；
    \* \@?author={author}\@，某一用户发表的回复列表；
    \* \@?sort_by={sort_method}\@，回复列表排序，可取的值为\@'time'\@（时间顺序），\@'rank_score'\@（评分顺序），默认为\@'time'\@；
    \* \@?count={count}&offset={offset}\@，回复列表的第\@count*offset+1\@到\@count*offset+count\@项，共计\@count\@项。默认\@count=20, offset=0\@。\@count\@上限为100，即一个请求最多返回100条post的集合。
}

过滤器可以组合应用，解析顺序如上述。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。


比如：

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET
Link: </resources/posts?count=20&offset=0>; rel="self"; method="GET"
\code+{end}

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定回复时使用\@/resources/posts/{post_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "posts": {
        "post": {
            "post_id": "1361"
            ...
            },
        "id": "/resources/posts/1361",
        "source": "/resources/posts/1361"
    }
}

\code+{end}

为了避免频繁刷新带来的资源浪费，回复列表的cache策略稍有改动：
\alert[info]{
默认max-age:minutes，无需验证，可以获得全局的回复列表\newline
有parent过滤器时，max-age:days, must-revalidate，获得某一讨论的回复列表}

获取资源列表时使用\@/resources/posts\@，通过过滤器获得需要的资源列表。默认的过滤器为\@?sort_by=time&count=20&offset=0\@。

返回的JSON格式为：
\code+[json]{begin}

{
    "posts": {
        "collection": [
            {
                "post": {
                    "post_id": "1361"
                    ...
                    },
                "id": "/resources/posts/1361",
                "source": "/resources/posts/1361"
            },
            {
                "post": {...},
                "id": "/resources/posts/xxx",
                "source": "/resources/posts/xxx"
            },
            ...],
        "id": "/resources/posts?parent=161&sort_by=time&count=20&offset=0",
        "source": "/resources/posts"
    }
}

\code+{end}

\alert{
小心处理匿名情况：后端需要检查用户是否有parent（讨论）oplist中定义的view_anonymous权限，如果有，返回author和author_name；如果没有，则author为空，author_name由原始的用户名hash而来。
}


\h4{新建资源：POST}

\alert[info]{no-cache, no-store}

新建回复通过向\@/resources/posts\@使用POST方法，发送如下格式的JSON：

\code+[json]{begin}
{
    "post": {
        ...
    }
}

\code+{end}

其中可以提供以下属性：

\table{begin}
\r{
    \h 属性名
    \h 类型
    \h 必需
    \h 描述
}
\r{
    \d \@parent\@
    \d \@String\@
    \d yes
    \d \@/resources/threads/{parent}\@，所在讨论id，根据\@{parent}\@检查上级（讨论）的\@post\@权限
}
\r{
    \d \@reply_to\@
    \d \@String\@
    \d optional
    \d \@/resources/posts/{reply_to}\@，回复所针对回复id，若省略，则默认为所在讨论第一条id
}
\r{
    \d \@content\@
    \d \@String\@
    \d yes
    \d 回复内容，必须为纯文本或\link+[ML]{/ebony/ml.html}
}
\r{
    \d \@hidden\@
    \d \@Boolean\@
    \d optional
    \d 是否隐藏，默认为\@false\@，若为\@true\@需要用户有此讨论的\@post_hidden\@权限。
}
\r{
    \d \@enabled\@
    \d \@Boolean\@
    \d optional
    \d 是否关闭，默认为\@true\@，若为\@false\@需要用户有此讨论的\@post_disabled\@权限。
}
\table{end}

成功回复\@200 Created\@，且报头中的\@Location\@为新建的post链接。

失败则根据失败原因分别回复。

\h4{删除资源：DELETE}

\alert[info]{no-cache, no-store}

删除回复需要向\@/resources/posts/{post_id}\@使用DELETE方法，成功回复\@204 No Content\@。

失败则根据失败原因分别返回。

\h4{修改资源：PUT}

\alert[info]{no-cache, no-store}

根据修改的回复内容不同分为如下操作。

向\@/resources/posts/{post_id}\@使用PUT方法，格式为：

\code+[json]{begin}
{
    "post": {
        ...
    }
}

\code+{end}

可改变的内容为:

\table{begin}
\r{
    \h 属性名
    \h 类型
    \h operation
    \h 描述
}
\r{
    \d \@reply_to\@
    \d \@String\@
    \d \@post({post_id})\@
    \d \@/resources/posts/{reply_to}\@，回复所针对回复id，检查上级（讨论）的post权限
}
\r{
    \d \@content\@
    \d \@String\@
    \d \@edit({post_id})\@
    \d 回复内容，必须为纯文本或\link+[ML]{/ebony/ml.html}，检查edit权限
}
\r{
    \d \@hidden\@
    \d \@Boolean\@
    \d \@hide({post_id})\@ or \@unhide({post_id})\@
    \d 是否隐藏，检查hide/unhide权限。
}
\r{
    \d \@enabled\@
    \d \@Boolean\@
    \d \@enable({post_id})\@ or \@disable({post_id})\@
    \d 是否关闭，检查enable/disable权限。
}
\r{
    \d \@rank\@
    \d \@String\@
    \d \@rank({post_id}, {rank_key})\@
    \d 改变rank_score评分，\@{rank_key}\@为改变方式，例如\@"pro"\@和\@"con"\@，需要检查rank权限。
}
\table{end}

同一个请求中可以有多个操作，后端需要保证多个操作按一个事务提交（即只有所以操作都成功是数据才改变，任一失败将导致所以其他操作失效）。

成功返回\@204 No Content\@。

失败则根据失败原因分别返回。
