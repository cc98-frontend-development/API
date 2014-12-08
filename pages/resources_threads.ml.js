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
        String default_thread_oplist    # computed, i.e. /resources/boards/{parent}:default_thread_oplist, /resources/oplists/{default_thread_oplist}
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
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}

\fig{end}

\list*{
    \* \@parent\@，指向上级（板块）
    \* \@default_thread_oplist\@，讨论的默认oplist，储存于\@/resources/boards/{parent}:default_thread_oplist\@
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
        \* \@color\@颜色，#XXXXXX格式，X为\@/[0-9a-fA-F]/\@
        \* \@bold\@加粗
        \* \@italic\@斜体
    }
}


\h4{入口和过滤器}

特定讨论资源的固定入口为\@/resources/threads/{thread_id}\@，讨论列表资源入口为\@/resources/threads\@，配合过滤器可以筛选出需要的讨论列表。

讨论列表资源支持的过滤器：
\list#{
    \* \@?parent={parent}\@，某一板块下的讨论列表；
    \* \@?type={type}\@，某一类型的讨论列表；
    \* \@?top_type={top_type}\@，某一置顶的讨论列表；
    \* \@?good_type={good_type}\@，某一精华类型的讨论列表；
    \* \@?author={user_id}\@，某一作者发布的讨论列表；
    \* \@?sort_by={sort_method}\@，排序方式，默认为\@'invtime'\@（按时间倒序），可选的其他值为\@'mru'\@（最近回复优先顺序），\@'edgerank'\@（\link+[EdgeRank]{http://edgerank.net}顺序）
    \* \@?count={count}&offset={offset}\@，讨论列表的第\@count*offset+1\@到\@count*offset+count\@项，共计\@count\@项。默认\@count=20, offset=0\@。\@count\@上限为100，即一个请求最多返回100条post的集合。
}
过滤器可以组合应用，解析顺序如上述。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。


特定的讨论：
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET, PUT, DELETE
Link: </resources/threads/3816>; rel="self"; method="GET"
\code+{end}

讨论列表：
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: 0
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET
Link: </resources/threads?sort_by=invtime&count=20&offset=0>; rel="self"; method="GET"
\code+{end}

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定讨论时使用\@/resources/threads/{thread_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "threads": {
        "thread": {
            "thread_id": "1361"
            ...
            },
        "id": "/resources/threads/1361",
        "source": "/resources/threads/1361"
    }
}

\code+{end}

为了避免频繁刷新带来的资源浪费，回复列表的cache策略稍有改动：
\alert[info]{
默认max-age:minutes，无需验证，可以获得全局的回复列表\newline
有parent筛选器时，max-age:days, must-revalidate，获得某一讨论的回复列表}

获取资源列表时使用\@/resources/threads\@，通过过滤器获得需要的资源列表。默认的过滤器为\@?sort_by=invtime&count=20&offset=0\@。

返回的JSON格式为：

\code+[json]{begin}

{
    "threads": {
        "collection": [
            {
                "thread": {
                    "thread_id": "1361"
                    ...
                    },
                "id": "/resources/threads/1361",
                "source": "/resources/threads/1361"
            },
            {
                "thread": {...},
                "id": "/resources/threads/xxx",
                "source": "/resources/threads/xxx"
            },
            ...],
        "id": "/resources/threads?parent=161&sort_by=invtime&count=20&offset=0",
        "source": "/resources/threads"
    }
}

\code+{end}

\alert{
小心处理匿名情况：后端需要检查用户是否有oplist中定义的view_anonymous权限，如果有，返回author和author_name；如果没有，则author为空，author_name由原始的用户名hash而来。
}

返回报文中，报头\@Link\@应该包括下一页的链接\@rel="next"\@（如果不是最后页），上一页链接\@rel="prev"\@（如果不是第一页），第一页链接\@rel="first"\@，最后一页的链接\@rel="last"\@


\h4{新建资源：POST}

新建讨论通过向\@/resources/posts\@使用POST方法，发送如下格式的JSON：
\code+[json]{begin}
{
    "thread": {
        "first_post": { ... },
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
    \d \@/resources/boards/{parent}\@，所在板块id，根据\@{parent}\@检查上级（板块）的\@post\@权限
}
\r{
    \d \@title\@
    \d \@String\@
    \d yes
    \d 讨论标题，必须为纯文本
}
\r{
    \d \@type\@
    \d \@String\@
    \d yes
    \d 讨论类型，\@'topic'\@ \@'qa'\@ \@'poll'\@中任一
}
\r{
    \d \@first_post\@
    \d \@Post\@
    \d yes
    \d 第一回复，格式参考\link+[回复]{#/resources_posts.ml.js}，但无须指定其\@parent\@
}
\r{
    \d \@top_type\@
    \d \@String\@
    \d optional
    \d 置顶类型，\@'off'\@（默认） \@'temp'\@ \@'board'\@ \@'parent'\@ \@'top'\@中任一，检查用户有此板块的\@post_top\@权限
}
\r{
    \d \@good_type\@
    \d \@String\@
    \d optional
    \d 精华类型，\@'off'\@（默认） \@'reserved'\@ \@'elite'\@中任一，检查用户有此板块的\@post_good\@权限
}
\r{
    \d \@anonymous\@
    \d \@Boolean\@
    \d optional
    \d 是否匿名，\@false\@（默认）, \@true\@检查用户有此板块的\@post_anonymous\@权限
}
\r{
    \d \@no_post\@
    \d \@Boolean\@
    \d optional
    \d 是否关闭回复，\@false\@（默认）, \@true\@检查用户有此板块的\@post_no_post\@权限
}
\r{
    \d \@highlight\@
    \d \@Object\@
    \d optional
    \d 是否高亮，直接提供json（e.g.\@{"color":"#030303"， "bold":false, "italic":false}\@），检查用户有此板块的\@post_highlight\@权限
}

\table{end}

成功回复\@200 Created\@，且报头中的\@Location\@为新建的thread链接。

失败则根据失败原因分别回复。

\h4{删除资源：DELETE}

\alert[info]{no-cache, no-store}

删除讨论需要向\@/resources/threads/{thread_id}\@使用DELETE方法，成功回复\@204 No Content\@。

讨论下的所有回复也因此删除。

失败则根据失败原因分别返回。

\h4{修改资源：PUT}

\alert[info]{no-cache, no-store}

根据修改的资源内容不同分为如下操作。

向\@/resources/threads/{thread_id}\@使用PUT方法，格式为：

\code+[json]{begin}
{
    "thread": {
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
    \d \@title\@
    \d \@String\@
    \d \@title({thread_id})\@
    \d 标题，必须为纯文本，检查title权限
}
\r{
    \d \@top_type\@
    \d \@String\@
    \d \@top({thread_id}, {top_type})\@
    \d 置顶，检查相应的top权限
}
\r{
    \d \@good_type\@
    \d \@String\@
    \d \@good({thread_id}, {good_type})\@
    \d 精华，检查相应的good权限
}
\r{
    \d \@anonymous\@
    \d \@Boolean\@
    \d \@anonymous({thread_id})\@ or \@onymous({thread_id})\@
    \d 匿名，检查相应的anonymous/onymous权限
}
\r{
    \d \@no_post\@
    \d \@Boolean\@
    \d \@close({thread_id})\@ or \@open({thread_id})\@
    \d 关闭/打开回复，检查相应的open/close权限
}
\r{
    \d \@highlight\@
    \d \@Object\@
    \d \@highlight({thread_id})\@
    \d 高亮标题，检查相应的highlight权限
}
\table{end}
