\h3{统计：版块}

\h4{简介}

此资源只读，只提供OPTION和GET方法，不能直接改变其内容。

由于cc98版块有层级关系，母版的统计资料\emphasis{应该}与子版一致，后端在更新统计资料时，\emphasis{应该}逐级更新统计信息。


\h4{数据结构}
\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class PostStat
        String board_id
        String last_thread_id
        String last_post_id
        Number thread_count_total
        Number thread_count_today
        Number post_count_total
        Number post_count_today

\code+{end}

\fig{begin}

    \img{pages/graph/erd/boardstats.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}

\fig{end}
\list*{
	\* \@last_thread_id\@: 记录最新发表讨论id。
	\* \@last_post_id\@: 记录最新发表回复id。
	\* \@thread_count_total\@: 记录版块下的总讨论数。
	\* \@thread_count_today\@: 记录版块下今日讨论数。
	\* \@post_count_total\@: 记录版块下的总回复数。
	\* \@post_count_today\@: 记录版块下今日回复数。
}

\h4{入口和过滤器}

特定版块统计的资源的固定入口为\@/resources/stats/boards/{board_id}\@。

获取全站的统计信息，则可以使用\@/resources/stats/boards/0\@。

支持的过滤器为
\list#{
	\* \@?parent={parent}\@，某一个版块下的所有版块统计；
}

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:minutes, 无需验证，后台按照负载定期重新计算缓存内的资源}

GET方法用于获取资源。

获取特定版块统计使用\@/resources/stats/boards/{board_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "stats": {
        "boardstat": {
            "board_id": "231"
            ...
            },
        "id": "/resources/stats/boards/231",
        "source": "/resources/stats/boards/231"
    }
}

\code+{end}


获取版块统计列表使用\@/resources/stats/boards/?parent={parent}\@。

比如活动主版块的统计列表：\@/resources/stats/boards/?parent=0\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "stats": {
        "collection": [
            {
                "boardstat": {
                    "board_id": "231"
                    ...
                    },
                "id": "/resources/stats/boards/231",
                "source": "/resources/stats/boards/231"
            },
            {
                "boardstat": {...},
                "id": "/resources/stats/boards/xxx",
                "source": "/resources/stats/boards/xxx"
            },
            ...],
        "id": "/resources/stats/boards/?parent=0",
        "source": "/resources/stats/boards/?parent=0"
    }
}
\code+{end}
