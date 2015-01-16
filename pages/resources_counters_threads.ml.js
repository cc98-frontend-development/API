\h3{讨论计数器}

\h4{简介}

此资源只读，只提供OPTION和GET方法，不能直接改变其内容。

\h5{JSON API}
\code+[coffee]{begin}
class ThreadCounter
    String id
    String parent
    String last_post
    String last_post_time
    String age                # computed
    Number post_number
    Number viewer_number
    Number post_to_viewer_ratio # computed
    Number popularity_score   # computed

\code+{end}

\list*{
	\* \@parent\@：上级资源（版块）
    \* \@last_post\@：最新回复
    \* \@last_post_time\@：最新回复时间 i.e. \@/resources/posts/{last_post}:time\@
    \* \@age\@：讨论创建至今时间（分钟数），i.e.\@/resources/stats/posts/{id}:age\@
    \* \@post_count\@：总回复数，最小为1
    \* \@viewer_count\@：总点击数，最小为1
    \* \@post_to_viewer_ratio\@：i.e.\@/resources/stats/posts/{id}:post_to_viewer_ratio\@
    \* \@popularity_score\@：i.e.\@/resources/stats/posts/{id}:popularity_score\@
}

\fig{begin}
    \img{pages/graph/erd/threadcounters.png}
\fig{end}

\h5{数据库Schema}

\code+[sql]{begin}

CREATE TABLE ThreadCounters(
    ThreadId            int NOT NULL UNIQUE,
    LastPost            int NOT NULL,
    PostNumber          int NOT NULL DEFAULT 1,
    ViewerNumber        int NOT NULL DEFAULT 1,

    CONSTRAINT PK_ThreadId PRIMARY KEY CLUSTERED (ThreadId DESC),
    CONSTRAINT FK_ThreadId FOREIGN KEY (ThreadId)
        REFERENCES Threads (ThreadId)
        -- ThreadCounters and Threads are in an one-to-one relationship.
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_Parent FOREIGN KEY (Parent)
        REFERENCES Boards (BoardId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_LastPost FOREIGN KEY (LastPost)
        REFERENCES Posts (PostId)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
\code+{end}

\h4{入口和过滤器}

特定讨论计数器的资源的固定入口为\@/resources/counters/threads/{$id}\@，讨论计数器列表的固定入口为，\@/resources/counters/threads/{$id}\@

讨论计数器列表资源支持的过滤器与回复列表支持的完全相同：
\list#{
    \* \@?parent={$parent}\@，某一板块下的讨论计数器列表；
    \* \@?type={$type}\@，某一类型的讨论的计数器列表；
    \* \@?top_type={$top_type}\@，某一置顶的讨论的计数器列表；
    \* \@?good_type={$good_type}\@，某一精华类型讨论的计数器列表；
    \* \@?author={$user_id}\@，某一作者发布的讨论的计数器列表；
    \* \@?sort_by={$sort_method}\@，排序方式，默认为\@'invtime'\@（按时间倒序），可选的其他值为\@'mru'\@（最近回复优先顺序）
    \* \@?count={$count}&offset={$offset}\@，讨论计数器列表的第\@$count*$offset+1\@到\@$count*$offset+$count\@项，共计\@$count\@项。默认\@$count=20, offset=0\@。\@$count\@上限为100，即一个请求最多返回100条post的集合。
}
过滤器可以组合应用，解析顺序如上述。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:hours, must-revalidate}

GET方法用于获取资源。

获取特定讨论列表使用\@/resources/counters/threads/{$id}\@。

\code+[json]{begin}
{
    "threadcounters": {
    	"id": "1361",
    	...
    },
    "self": "threads/{id}",
    "source": "threads/{id}",
    "base": "/resources/counters/"
}

\code+{end}

获取资源列表时使用\@/resources/counters/threads/\@，通过过滤器获得需要的资源列表。默认的过滤器为\@?sort_by=invtime&count=20&offset=0\@。

\alert[info]{
默认max-age:minutes，无需验证，可以获得全局的回复列表\newline
有parent过滤器时，max-age:hours, must-revalidate，获得某一讨论的回复列表}
\code+[json]{begin}

{
    "threadcounters": [
        {
            "id": "1361",
            ...
        },
        {
            "id": "1365",
            ...
        },
        ...
    ],
    "item": "threads/{id}",
    "self": "threads/?parent=14&sort_by=invtime&count=20&offset=0",
    "source": "threads/",
    "base": "/resources/counters/"
}

\code+{end}
