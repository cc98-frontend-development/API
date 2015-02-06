\h3{版块}

\h4{简介}

板块资源是指向板块实体的资源。cc98存在多级的板块，即有母版和子版。在API中，用\@parent\@属性标记板块的母板块，而顶级板块即所有\@parent=0\@，\@0\@是根板块的\@id\@。而根板块的\@parent\@为\@NULL\@。

访问板块列表，则使用URI\@/resources/boards\@，单独的板块信息在URI\@/resources/boards/{id}\@中，可以使用filter\@parent\@（URI\@/resources/boards?parent={id}\@），筛选特定板块下的子版。

板块中保存了其下子板块和子孙讨论，子孙回复的默认操作权限列表（oplist），其子孙可以选择是否继承。

\h4{数据结构}

\h5{JSON API}
\@computed\@表示后端在读时计算出，在API层面只读。

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
    String icon_url                 # computed
    String last_thread_id
    String last_post_id
    # Activity statistics:
    Number post_number_month
    Number post_number_today
    Number thread_number_month
    Number thread_number_today
    Number viewer_number_month
    Number viewer_number_today

\code+{end}

\list*{
    \* \@parent\@，指向上级（板块）,\@parent == 0\@表示为主版（子版块是一级版块），\@parent == NULL\@表示根板块，其余为各个子板块。
    \* \@title\@，板块名，纯文本
    \* \@description\@，板块简介，纯文本
    \* \@oplist\@，版块当前oplist
    \* \@default_board_oplist\@，板块的默认oplist，储存于\@/resources/boards/{parent}:default_board_oplist\@
    \* \@default_thread_oplist\@，讨论的默认oplist
    \* \@default_post_oplist\@，讨论中回复的默认oplist
    \* \@icon_url\@，图标的访问地址，图标存于数据库中，地址由后端生成。
    \* \@last_thread_id\@: 记录最新发表讨论id。
    \* \@last_post_id\@: 记录最新发表回复id。
    \* \@thread_number_month\@: 记录版块下过去一月讨论数。
    \* \@thread_number_today\@: 记录版块下今日讨论数。
    \* \@viewer_number_month\@: 记录版块下过去一月讨论查看数（同一用户多次查看同一讨论记一次）。
    \* \@viewer_number_today\@: 记录版块下今日讨论查看数（同一用户多次查看同一讨论记一次）。
    \* \@post_number_month\@: 记录版块下过去一月回复数（同一用户多次回复同一讨论记一次）。
    \* \@post_number_today\@: 记录版块下今日回复数（同一用户多次回复同一讨论记一次）。
}

\h5{数据库Schema}

\fig{begin}
    \img{pages/graph/erd/boards.png}
\fig{end}

\code+[sql]{begin}

CREATE TABLE Icons(
    IconId int NOT NULL IDENTITY,
    Icon varbinary(max) NOT NULL,
    MIMEType nvarchar(64) NULL DEFAULT NULL,
    Path nvarchar(128) NULL DEFAULT NULL,
    CONSTRAINT PK_IconId PRIMARY KEY CLUSTERED (IconId ASC),
);

CREATE TABLE Boards(
    BoardsId int NOT NULL IDENTITY,
    Parent int NULL,
    -- Root boards' Parent is NULL.
    -- Each root boards is either the parent of the main board or detached boards for special purpose.
    Title nvarchar(64) NOT NULL,
    Description nvarchar(256) NOT NULL,
    Oplist int NOT NULL,
    DefaultBoardOplist int NOT NULL,
    DefaultThreadOplist int NOT NULL,
    DefaultPostOplist int NOT NULL
    IconId int NOT NULL,
    
    INDEX IDX_Parent (Parent),
    
    CONSTRAINT PK_BoardId PRIMARY KEY CLUSTERED (BoardId ASC),
    CONSTRAINT FK_Parent FOREIGN KEY (Parent)
        REFERENCES Boards (BoardId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete a board with sub-borads.
    CONSTRAINT FK_Oplist FOREIGN KEY (Oplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_DefaultBoradOplist FOREIGN KEY (DefaultBoardOplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_DefaultThreadOplist FOREIGN KEY (DefaultThreadOplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_DefaultPostOplist FOREIGN KEY (DefaultPostOplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_IconId FOREIGN KEY (IconId)
        REFERENCES Icons (IconId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION -- Can not delete an icon in use.
);

CREATE TABLE BoardStats(
    BoardId             int NOT NULL UNIQUE,
    LastThreadId        int NULL,
    LastPostId          int NULL,
    PostNumberMonth     int NOT NULL,
    PostNumberToday     int NOT NULL,
    ThreadNumberMonth   int NOT NULL,
    ThreadNumberToday   int NOT NULL,
    ViewerNumberMonth   int NOT NULL,
    ViewerNumberToday   int NOT NULL,

    CONSTRAINT PK_BoardId PRIMARY KEY CLUSTERED (BoardId),
    CONSTRAINT FK_BoardId FOREIGN KEY (BoardId)
        -- BoardStats and Boards are in an one-to-one relationship.
        REFERENCES Boards (BoardId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_LastThreadId FOREIGN KEY (LastThreadId)
        REFERENCES Threads (ThreadId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
        -- Should update LastThreadId before deleting the thread.
    CONSTRAINT FK_LastPostId FOREIGN KEY (LastPostId)
        REFERENCES Posts (PostId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        -- Should update LastPostId before deleting the post.
);

\code+{end}

\h5{数据库View}
\code+[sql]{begin}

CREATE VIEW BoardsView AS
SELECT
    b.BoardId AS Id,
    b.Parent,
    b.Oplist,
    b.Title,
    b.Description,
    i.Path AS IconUrl,
    pb.DefaultBoardOplist,
    b.DefaultPostOplist,
    b.DefaultThreadOplist,
    s.LastPostId,
    s.LastThreadId,
    s.PostNumberMonth,
    s.PostNumberToday,
    s.ThreadNumberMonth,
    s.ThreadNumberToday,
    s.ViewerNumberMonth,
    s.ViewerNumberToday
FROM Boards AT b
    INNER JOIN Boards as pb         ON pb.BoardsId = b.Parent
    INNER JOIN Icons as i           ON i.IconId = b.IconId
    INNER JOIN BoardStats AS s      ON s.BoardId = b.BoardId;

CREATE PROCEDURE getBoardsByParent
    @parentId int
AS
BEGIN
    SELECT * FROM BoardsView
    WHERE Parent = @parentId
END;
\code+{end}


\h4{入口和过滤器}

特定板块资源的固定入口为\@/resources/boards/{$id}\@，板块列表资源入口为\@/resources/boards\@，配合过滤器可以筛选出需要的板块列表。

板块列表资源支持的过滤器：
\list#{
    \* \@?parent={$parent}\@，某一板块下的讨论列表；
}

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

特定的版块：
\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Length: XXX
Cache-control: max-age=2592000, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT
Allow: OPTIONS, GET
\code+{end}
\code+[json]{begin}
HTTP/1.1 200 OK
{
    "self": "posts/",
    "source": "posts/",
    "base": "/resources/",
    "links": {
        "parent": {
            "href": "boards/{parent}",
            "method": "GET",
            "description": "上级版块"
        },
        "oplist": {
            "href": "oplists/{oplist}",
            "method": "GET",
            "description": "版块的权限"
        },
        "default_post_oplist": {
            "href": "oplists/{default_post_oplist}",
            "method": "GET",
            "description": "默认的回复权限"
        },
        "default_thread_oplist": {
            "href": "oplists/{default_thread_oplist}",
            "method": "GET",
            "description": "默认的讨论权限"
        }
    }
}

\code+{end}

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定板块时使用\@/resources/boards/{$id}\@。

\code+[json]{begin}
{
    "boards": {
        "id": "13"
        ...
    },
    "self": "boards/{id}",
    "source": "boards/{id}",
    "base": "/resources/"
}
\code+{end}

获取板块列表时使用\@/resources/boards?parent={$parent}\@。
返回的JSON格式为：

\code+[json]{begin}

{
    "boards": [
        {
            "id": "13",
            ...
        },
        {
            "id": "14",
            ...
        },
        ...
    ],
    "links": {
        "tier_one_boards": {
            "href": "boards/?parent=0",
            "method": "GET",
            "description": "一级版块"
        }
    },
    "item": "boards/{id}",
    "self": "boards/?parent={parent}",
    "source": "boards/",
    "base": "/resources/"
}

\code+{end}

\h4{删除资源：DELETE}

\alert[info]{no-cache, no-store}

删除版块需要向\@/resources/boards/{$id}\@使用DELETE方法，成功回复\@204 No Content\@。

版块下所有讨论，及讨论的所有回复也将因此删除（危险！），需要检查delete权限，版块下所有讨论和所有回复的权限（危险！）。

失败则根据失败原因分别返回。

\h4{修改资源：PUT}

\alert[info]{no-cache, no-store}

向\@/resources/boards/{$id}\@使用PUT方法，JSON格式为：

\code+[json]{begin}
{
    "boards": {
        ...
    }
}

\code+{end}

也可以使用上述\@links\@内提供的接口，用过滤器的方式，改变一部分内容。过滤器方式指定的操作将覆盖JSON方式。

可改变的内容为:
\table{begin}
\r{
    \h 属性名
    \h 类型
    \h operation
    \h 描述
}
\r{
    \d \@parent\@
    \d \@String\@
    \d \@move($parent)\@
    \d 移动版块为其他版块的子版块，检查move权限和目标版块的adopt权限
}
\r{
    \d \@title\@ \@description\@
    \d \@String\@
    \d \@title($id)\@ \@describe($id)\@
    \d 版块名字，简介，必须为纯文本，检查edit权限
}
\table{end}

