\h3{统计：讨论}

该资源为只读资源，只提供OPTION和GET方法。

\h4{简介}

\h4{数据结构}
\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class ThreadStat
        String thread_id
        String last_post
        String last_post_time     # computed, i.e. /resources/posts/{last_post}:time
        String age                # computed, i.e. Now() - /resources/threads/{thread_id}:time +1 in minutes
        Number posts_count
        Number viewers_count
        Number post_to_view_ratio # computed
        Number popularity_score   # computed

\code+{end}

\fig{begin}
    \img{pages/graph/erd/threadstats.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}

\fig{end}


\list*{
    \* \@last_post\@：最新回复
    \* \@last_post_time\@：最新回复时间
    \* \@age\@：讨论创建时间（分钟数），最小为1
    \* \@posts_count\@：总回复数，最小为1
    \* \@viewers_count\@：总点击数，最小为1
    \* \@post_to_view_ratio\@：\@posts_count/viewers_count\@
    \* \@popularity_score\@：\@(posts_count + log(viewers_count))* post_to_view_ratio/log(age)\@，更多的回复和更对的点击率可以得到更高的分数，而更长的时间得到的分数更低。
}

\h4{入口和过滤器}

特定讨论统计的资源的固定入口为\@/resources/stats/threads/{thread_id}\@，不支持讨论统计列表，不支持过滤器。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:minutes, 无需验证，后台按照负载定期重新计算缓存内的资源}

GET方法用于获取资源。

获取特定讨论统计使用\@/resources/stats/threads/{thread_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "stats": {
        "threadstat": {
            "thread_id": "1361"
            ...
            },
        "id": "/resources/stats/threads/1361",
        "source": "/resources/stats/threads/1361"
    }
}

\code+{end}


