\h3{回复计数器}

\h4{数据结构}

\h5{JSON API}
\code+[coffee]{begin}

class PostCounter
    String id
    String parent
    Number up_number
    Number down_number
    Number up_weight
    Number down_weight
    Number score           #computed, i.e. /resources/stats/post/{id}:score

\code+{end}

\fig{begin}
    \img{pages/graph/erd/postcounters.png}
\fig{end}

\list*{
	\* \@id\@，该计数器对应的回复id
    \* \@parent\@，指向上级（讨论）
	\* \@up_number\@，点赞同的人数
	\* \@down_number\@，点反对的人数
	\* \@up_weight\@，计算时赞同的权重
	\* \@down_weight\@，计算时反对的权重
	\* \@score\@，i.e. \@/resources/stats/post/{id}:score\@，用于排序。
}

\h5{数据库Schema}
\code+[sql]{begin}

CREATE TABLE PostCounters(
    PostId     int NOT NULL UNIQUE,
    Parent     int NOT NULL,
    UpNumber   int NOT NULL,
    DownNumber int NOT NULL,
    UpWeight   int NOT NULL,
    DownWeight int NOT NULL,

    CONSTRAINT PK_PostId PRIMARY KEY CLUSTERED (PostId ASC),
    -- PostCounters and Posts are in a one-to-one relationship.
    CONSTRAINT FK_PostId FOREIGN KEY (PostId)
        REFERENCES Posts (PostId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_Parent FOREIGN KEY (Parent)
        REFERENCES Threads (ThreadId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
);

\code+{end}

\h4{入口和过滤器}
特定回复计数器资源的固定入口为\@/resources/counters/posts/{$id}\@，回复计数器列表资源的固定入口为\@/resources/counters/posts/\@。

回复计数器列表资源支持的过滤器与回复列表支持的完全相同：
\list#{
    \* \@?parent={$parent}\@，某一讨论下的回复计数器列表；
    \* \@?reply_to={$reply_to}\@，回复某一回复的回复计数器列表；
    \* \@?author={$author}\@，某一用户发表的回复的回复计数器列表；
    \* \@?count={$count}&offset={$offset}\@，回复计数器列表的第\@$count*$offset+1\@到\@$count*$offset+$count\@项，共计\@$count\@项。默认\@$count=20, $offset=0\@。\@$count\@上限为100，即一个请求最多返回100条post的集合。
}

过滤器可以组合应用，解析顺序如上述。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

OPTIONS不返回具体的资源，但返回一系列资源可以使用的外部资源和调用方法。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}

GET方法用于获取资源。

获取特定回复计数器时使用\@/resources/counters/posts/{$id}\@。
\alert[info]{max-age:days, must-revalidate}
\code+[json]{begin}
{
    "postcounters": 
    {
        "id": "1361"
        ...
    },
    "self": "posts/{id}",
    "source": "posts/{id}",
    "base": "/resources/counters/"
}
\code+{end}

获取资源列表时使用\@/resources/counters/posts/\@，通过过滤器获得需要的资源列表。默认的过滤器为\@?count=20&offset=0\@。
\alert[info]{
默认max-age:minutes，无需验证，可以获得全局的回复列表\newline
有parent过滤器时，max-age:days, must-revalidate，获得某一讨论的回复列表}
\code+[json]{begin}
{
    "postcounters": [
        {
            "id": "1361"
            ...
        },
        {
            "id": "1363"
            ...
        },
        ...
    ],
    "item": "posts/{id}",
    "self": "posts/?parent=161&count=20&offset=0",
    "source": "posts/",
    "base": "/resources/counters/"
}
\code+{end}
