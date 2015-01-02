\h3{统计：回复}

\h4{简介}

此资源只读，只提供OPTION和GET方法，不能直接改变其内容，只能通过对post的rank操作间接改变其内容。

一个普通的好评和差评只改变\@rank_up\@\@rank_down\@。也可以通过花费论坛积分改变权重\@rank_up_weight\@\@rank_down_weight\@。

\h4{数据结构}
\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class PostStat
        String post_id
        Number rank_up
        Number rank_down
        Number rank_up_weight
        Number rank_down_weight
        Number rank_score

\code+{end}

\fig{begin}

    \img{pages/graph/erd/poststats.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}

\fig{end}
\list*{
    \* \@rank_up\@ \@rank_down\@: 记录好评/差评的总人数，默认为1。
    \* \@rank_up_weight\@ \@rank_down_weight\@：记录好评/差评的总权重，默认为1。
    \* \@rank_score\@：由\@rank_up\@\@rank_down\@\@rank_up_weight\@\@rank_down_weight\@计算得出的一个用于确定排位顺序的分数，比如：\@ rank_score = (rank_up * log(rank_up_weight)) / (rank_down * log(rank_down_weight)) \@
}

\h4{入口和过滤器}

特定回复统计的资源的固定入口为\@/resources/stats/posts/{post_id}\@，不支持回复统计列表，不支持过滤器。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定回复统计使用\@/resources/stats/posts/{post_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "stats": {
        "poststat": {
            "post_id": "1361"
            ...
            },
        "id": "/resources/stats/posts/1361",
        "source": "/resources/stats/posts/1361"
    }
}

\code+{end}


