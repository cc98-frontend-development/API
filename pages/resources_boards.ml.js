\h3{版块}

\h4{简介}

板块资源是指向板块实体的资源。cc98存在多级的板块，即有母版和子版。在API中，用\@parent\@属性标记板块的母板块，而顶级板块即所有\@parent=0\@，\@0\@是根板块的\@id\@。而根板块的\@parent\@为\@NULL\@。

访问板块列表，则使用URI\@/resources/boards\@，单独的板块信息在URI\@/resources/boards/{id}\@中，可以使用filter\@parent\@（URI\@/resources/boards?parent={id}\@），筛选特定板块下的子版。

板块中保存了其下子板块和子孙讨论，子孙回复的默认操作权限列表（oplist），其子孙可以选择是否继承。


\h4{数据结构}

\@computed\@表示后端不储存该字段，仅仅在读时计算出，在API层面只读。

\code+[coffee]{begin}
    class Boards
        String boards_id                # /resources/boards/{board_id}
        String parent                   # /resources/boards/{parent}, 0 or NULL
        String title
        String description
        String oplist                   # /resources/oplists/{oplist}
        String default_board_oplist     # computed, i.e. /resources/boards/{parent}:default_board_oplist, /resources/oplists/{default_board_oplist}
        String default_thread_oplist    # /resources/oplists/{default_thread_oplist}
        String default_post_oplist      # /resources/oplists/{default_post_oplist}

\code+{end}

\list*{
    \* \@parent\@，指向上级（板块）,\@parent == 0\@表示为总版，\@parent == NULL\@表示全站根板块，其余为各个子板块。
    \* \@title\@，板块名，纯文本
    \* \@description\@，板块简介，纯文本
    \* \@default_board_oplist\@，板块的默认oplist，储存于\@/resources/boards/{parent}:default_board_oplist\@
    \* \@default_thread_oplist\@，讨论的默认oplist
    \* \@default_post_oplist\@，讨论中回复的默认oplist
}

\h4{入口和过滤器}

特定板块资源的固定入口为\@/resources/boards/{board_id}\@，板块列表资源入口为\@/resources/boards\@，配合过滤器可以筛选出需要的板块列表。

板块列表资源支持的过滤器：
\list#{
    \* \@?parent={parent}\@，某一板块下的讨论列表；
}

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定板块时使用\@/resources/boards/{board_id}\@。

返回的JSON格式为：

\code+[json]{begin}
{
    "boards": {
        "board": {
            "board_id": "11"
            ...
            },
        "id": "/resources/boards/11",
        "source": "/resources/boards/11"
    }
}

\code+{end}

获取板块列表时使用\@/resources/boards?parent={parent}\@。
返回的JSON格式为：

\code+[json]{begin}

{
    "boards": {
        "collection": [
            {
                "board": {
                    "board_id": "11"
                    ...
                    },
                "id": "/resources/boards/11",
                "source": "/resources/boards/11"
            },
            {
                "board": {...},
                "id": "/resources/boards/xxx",
                "source": "/resources/boards/xxx"
            },
            ...],
        "id": "/resources/boards?parent=6",
        "source": "/resources/boards"
    }
}


\code+{end}
