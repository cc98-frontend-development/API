\h3{统计：回复}

\h4{数据结构}

\h5{JSON API}

\code+[coffee]{begin}
class PostStat
    String id
    Number score

\code+{end}

\fig{begin}
    \img{pages/graph/erd/postcounters.png}
\fig{end}

\list*{
    \* \@score\@：由\@up_number\@\@down_number\@\@up_weight\@\@down_weight\@计算得出的一个用于确定排位顺序的分数，比如：\@ score = (up_number * log(up_weight)) / (down_weight * log(down_weight)) \@
}

\h5{数据库Schema}
\code+[sql]{begin}

CREATE TABLE PostStats(
    PostId  int NOT NULL UNIQUE,
    Score   float NOT NULL,

    INDEX IDX_Score (Score DESC),

    CONSTRAINT PK_PostId PRIMARY KEY CLUSTERED (PostId ASC),
    CONSTRAINT FK_PostId FOREIGN KEY (PostId)
        -- PostStats and PostCounters are in an one-to-one relationship.
        -- PostCounters and Posts are in an one-to-one relationship.
        REFERENCES PostCounters (PostId)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

\code+{end}

\h4{入口和过滤器}

特定回复统计的资源的固定入口为\@/resources/stats/posts/{$id}\@，不支持回复统计列表，不支持过滤器。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定回复统计使用\@/resources/stats/posts/{$id}\@。

\code+[json]{begin}
{
    "poststats": {
        "id": "1361"
        ...
    },
    "self": "posts/{id}",
    "source": "posts/{id}",
    "base": "/resources/stats/"
}

\code+{end}


