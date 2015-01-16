\h3{统计：讨论}

该资源为只读资源，只提供OPTION和GET方法。

\h4{简介}

\h4{数据结构}

\h5{JSON API}

\code+[coffee]{begin}
class ThreadStat
    String id
    String age                  # i.e. Now() - /resources/threads/{id}:time +1 in minutes
    Number post_to_viewer_ratio # i.e. posts_count/viewers_count
    Number popularity_score     # i.e. (posts_count + log(viewers_count))* post_to_view_ratio/log(age)

\code+{end}

\fig{begin}
    \img{pages/graph/erd/threadcounters.png}
\fig{end}

\list*{
    \* \@age\@：讨论创建至今时间（分钟数），i.e. \@Now() - /resources/threads/{id}:time +1\@ in minutes，最小为1
    \* \@post_to_viewer_ratio\@：i.e. \@posts_count/viewers_count\@
    \* \@popularity_score\@：i.e. \@(posts_count + log(viewers_count))* post_to_view_ratio/log(age)\@，更多的回复和更对的点击率可以得到更高的分数，而更长的时间得到的分数更低。
}

\h5{数据库Schema}

\code+[sql]{begin}

CREATE TABLE ThreadStats(
    ThreadId            int NOT NULL UNIQUE,
    Age                 int NOT NULL, -- time diff in minutes
    PostToViewerRatio   float NOT NULL,
    PopularityScore     float NOT NULL,

    INDEX IDX_Age (Age ASC),
    INDEX IDX_PopularityScore (PostToViewerRatio DESC),

    CONSTRAINT PK_ThreadId PRIMARY KEY CLUSTERED (ThreadId DESC),
    CONSTRAINT FK_ThreadId FOREIGN KEY (ThreadId)
        -- ThreadStats and ThreadCounters are in an one-to-one relationship.
        -- ThreadCounters and Threads are in an one-to-one relationship.
        REFERENCES ThreadCounters (ThreadId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
);
\code+{end}

\h4{入口和过滤器}

特定讨论统计的资源的固定入口为\@/resources/stats/threads/{$id}\@，不支持讨论统计列表，不支持过滤器。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:minutes, 无需验证，后台按照负载定期重新计算缓存内的资源}

GET方法用于获取资源。

获取特定讨论统计使用\@/resources/stats/threads/{$id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "threadstats": {
    	"id": "1361",
    	...
    },
    "self": "threads/{id}",
    "source": "threads/{id}",
    "base": "/resources/stats/"
}

\code+{end}

