\h3{权限：回复}

\h4{简介}

回复操作权限表资源对应与一个回复资源，记录了该资源的操作，操作的执行者和操作记录之间的关系。

\h4{入口和过滤器}
回复的oplist可以通过\@/resources/oplists/posts/{post_id}\@访问（引用资源），如果知道其id可以直接访问源资源\@/resources/oplists/{oplist_id}\@。

Post oplist支持的过滤器：
\list*{
    \* \@?client={client}\@：特定客户端的权限，默认客户端为\@"cc98web"\@
    \* \@?user={user}&user_type={user_type}\@：特定用户（用户组或代理组）对此post的操作权限列表，其中\@user_type\@可取的值为\@"NORMAL"\@\@"GROUP"\@\@"PROXY"\@，不用此过滤器时显示完整的oplist
    \* \@?format={type}\@：输出不同的格式，\@type\@可以为\@"json"\@或\@"text"\@，默认为\@"json"\@
}

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定回复时使用\@/resources/oplists/posts/{post_id}\@。

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
        "id": "/resources/oplists/posts/1361",
        "source": "/resources/oplists/284"
    }
}

\code+{end}

这个回复表示：通过\@"/resources/oplists/posts/1361"\@访问了1361号回复的oplist，该oplist为284号，该oplist(284)的上级oplist(threads)是25号，该oplist(284)同时也是同一thread中的默认oplist(\@default == oplist_id\@)，并不从上级(boards)继承而来(\@!is_heritage\@)，而是这个threads单独指定的。

\@ops\@根据筛选器\@?format\@不同分为两种表现形式。参见\link+[oplist]{/#/permission_oplist.ml.js}

\h4{针对post的操作}
\table{begin}
\r{
    \h op
    \h operand
    \h description
}
\r{
    \d edit
    \d \@{post_id}\@
    \d 是否允许编辑回复贴内容
}
\r{
    \d delete
    \d \@{post_id}\@
    \d 是否允许删除回复贴
}
\r{
    \d disable
    \d \@{post_id}\@
    \d 是否允许关闭回复贴
}
\r{
    \d enable
    \d \@{post_id}\@
    \d 是否允许查看，并且打开已经关闭的回复贴
}
\r{
    \d hide
    \d \@{post_id}\@
    \d 是否允许隐藏的回复贴的内容
}
\r{
    \d unhide
    \d \@{post_id}\@
    \d 是否允许取消隐藏的回复贴的内容
}
\r{
    \d view_hidden
    \d \@{post_id}\@
    \d 是否允许查看隐藏的回复贴的内容
}
\r{
    \d rank
    \d \@({post_id}, {rank_chage})\@
    \d 是否允许改变回复评分（顶/踩/感谢回复）
}
\table{end}
