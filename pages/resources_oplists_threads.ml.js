\h3{权限：讨论}

\h4{简介}

讨论操作权限表资源对应与一个讨论资源，记录了该资源的操作，操作的执行者和操作记录之间的关系。

\h4{入口和过滤器}
讨论的oplist可以通过\@/resources/oplists/threads/{thread_id}\@访问（引用资源），如果知道其id可以直接访问源资源\@/resources/oplists/{oplist_id}\@。

Post oplist支持的过滤器：
\list*{
    \* \@?client={client}\@：特定客户端的权限，默认客户端为\@"cc98web"\@
    \* \@?user={user}&user_type={user_type}\@：特定用户（用户组或代理组）对此thread的操作权限列表，其中\@user_type\@可取的值为\@"NORMAL"\@\@"GROUP"\@\@"PROXY"\@，不用此过滤器时显示完整的oplist
    \* \@?format={type}\@：输出不同的格式，\@type\@可以为\@"json"\@或\@"text"\@，默认为\@"json"\@
}

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定回复时使用\@/resources/oplists/threads/{thread_id}\@。

返回的JSON格式为：
\code+[json]{begin}
{
    "oplists": {
        "oplist": {
            "oplist_id": "284",
            "oplist": "25",
            "is_heritage": false,
            "default": "284",
            "ops":[
                {...},
                ...
            ]
        },
        "id": "/resources/oplists/threads/1361",
        "source": "/resources/oplists/284"
    }
}

\code+{end}

这个回复表示：通过\@"/resources/oplists/threads/1361"\@访问了1361号讨论的oplist，该oplist为284号，该oplist(284)的上级oplist(board)是25号，该oplist(284)同时也是同一board中的默认oplist(\@default == oplist_id\@)，并不从上级(boards)继承而来(\@!is_heritage\@)，而是这个board单独指定的。

\@ops\@根据筛选器\@?format\@不同分为两种表现形式。参见\link+[oplist]{/#/permission_oplist.ml.js}

\h4{针对thread的操作}
\table{begin}
\r{
    \h op
    \h operand
    \h description
}
\r{
    \d title
    \d \@{thread_id}\@
    \d 是否允许编辑讨论主题
}
\r{
    \d delete
    \d \@{thread_id}\@
    \d 是否允许删除讨论，对于讨论下的回复需要检查删除权限。即只有同时拥有讨论的删除权限和讨论下所有回复的删除权限，才能真正删除讨论。
}
\r{
    \d close
    \d \@{thread_id}\@
    \d 是否允许关闭讨论回复（锁定），可以使讨论下沉
}
\r{
    \d open
    \d \@{thread_id}\@
    \d 是否允许打开讨论已经关闭的回复（取消锁定）
}
\r{
    \d top_temp top_board top_parent top_top
    \d \@({thread_id}, {top_type})\@
    \d 是否允许置顶/取消置顶讨论，如top_temp对应于\@top({thread_id}, 'temp')\@和已经是\@'temp'\@状态的讨论的\@top({thread_id}, 'off')\@这两个operation。
}
\r{
    \d good_reserved good_elite
    \d \@({thread_id}, {good_type})\@
    \d 是否允许添加/去除保留、精华讨论，如good_reserved对应于\@good({thread_id}, 'reserved')\@和已经是\@'reserved'\@状态的讨论的\@good({thread_id}, 'off')\@这两个operation
}
\r{
    \d anonymous
    \d \@{thread_id}\@
    \d 是否允许发布匿名讨论
}
\r{
    \d onymous
    \d \@{thread_id}\@
    \d 是否允许取消匿名讨论的匿名状态
}
\r{
    \d view_anonymous
    \d \@{thread_id}\@
    \d 是否允许查看匿名讨论的实名信息
}
\r{
    \d highlight
    \d \@{thread_id}\@
    \d 是否允许添加/去除讨论高亮
}
\table{end}
