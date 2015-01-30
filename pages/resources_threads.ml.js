\h3{讨论}

\h4{简介}

讨论资源是指向讨论实体的资源。用户可以在每个版块下发布新讨论，也可以针对他人发布的讨论进行回复，参考\link+[回复]{#/resources_posts.ml.js}。

讨论由一系列回复组成，可以看成一串（threads）回复，发布第一个回复的时候可以决定讨论的类型。暂定实现的讨论有以下三种类型：

话题（Topic）、问答（QA）和投票（Poll）。话题是基本类型，后两种可以看成是对话题的扩展。

讨论资源里记录了该讨论的第一个的回复，在该讨论里的回复在没有指定其他回复时默认回复这个第一回复。

\h4{数据结构}

\h5{JSON API}
\@computed\@表示后端在读时计算出，在API层面只读。

\code+[coffee]{begin}
class Thread
    String id
    String parent
    String oplist
    String default_thread_oplist    # computed, i.e. /resources/boards/{parent}:default_thread_oplist
    String default_post_oplist
    String first_post
    String title
    String author                   # computed, i.e. /resources/posts/{first_post}:author, /resources/user/{author}
    String author_name              # computed, i.e. /resources/users/{author}:name
    String type                     # 'topic' 'qa' 'poll'
    String top_type                 # 'off' 'board' 'parent' 'top'
    String top_timeout              # ISO 8601 format
    String good_type                # 'off' 'reserved' 'elite'
    Boolean anonymous
    Boolean no_post
    String time                     # ISO 8601 format
    Highlight highlight
    String last_post                # computed,
    String last_post_time           # computed, i.e. /resources/posts/{last_post}:time
    Number post_number              # computed
    Number viewer_number            # computed
    Number post_to_viewer_ratio     # computed
    Number popularity_score         # computed

class Highlight
    String color
    Boolean bold
    Boolean italic
\code+{end}

\fig{begin}
    \img{pages/graph/erd/threads.png}
\fig{end}

\list*{
    \* \@parent\@，指向上级（板块）
    \* \@default_thread_oplist\@，讨论的默认oplist，储存于\@/resources/boards/{parent}:default_thread_oplist\@
    \* \@default_post_oplist\@，讨论中回复的默认oplist
    \* \@type\@回复类型，'topic'（话题） 'qa'（问答） 'poll'（投票）
    \* \@top_type\@置顶类型，'off'（无置顶） 'board'（板块置顶） 'parent'（上级板块置顶） 'top'（全站置顶）
    \* \@top_timeout\@置顶过期时间，NULL表示永久置顶。
    \* \@good_type\@精华类型，'off'（未加精华） 'reserved'（保留回复） 'elite'（精华回复）
    \* \@anonymous\@，此讨论是否为匿名讨论，默认为\@false\@
    \* \@no_post\@，此讨论是否关闭回复，默认为\@false\@
    \* \@first_post\@，此讨论的第一个回复
    \* \@author\@ \@author_name\@，取自第一个回复的作者信息
    \* \@time\@，此讨论发布时间
    \* \@highlight\@，此讨论高亮状态：\list*{
        \* \@color\@颜色，#XXXXXX格式，X为\@/[0-9a-fA-F]/\@
        \* \@bold\@加粗
        \* \@italic\@斜体
    }
    \* \@last_post\@：最新回复
    \* \@last_post_time\@：最新回复时间 i.e. \@/resources/posts/{last_post}:time\@
    \* \@post_number\@：总回复人数，最小为1
    \* \@viewer_number\@：总点击人数，最小为1
    \* \@post_to_viewer_ratio\@：i.e. \@post_number/viewer_number\@
    \* \@popularity_score\@：i.e. \@(post_number + log(viewer_number))* post_to_viewer_ratio/log(now() - time + 1)\@，更多的回复和更对的点击率可以得到更高的分数，而更长的时间得到的分数更低。
}

\h5{数据库Schema}

SQL Server:
\code+[sql]{begin}

CREATE TABLE ThreadStats(
    ThreadId            int NOT NULL UNIQUE,
    LastPost            int NOT NULL,
    PostToViewerRatio   float NOT NULL,
    PopularityScore     float NOT NULL,

    INDEX IDX_PopularityScore (PostToViewerRatio DESC),

    CONSTRAINT PK_ThreadId PRIMARY KEY CLUSTERED (ThreadId),
    CONSTRAINT FK_ThreadId FOREIGN KEY (ThreadId)
        -- ThreadStats and ThreadCounters are in an one-to-one relationship.
        -- ThreadCounters and Threads are in an one-to-one relationship.
        REFERENCES ThreadCounters (ThreadId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT FK_LastPost FOREIGN KEY (LastPost)
        REFERENCES Posts (PostId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        -- Should update LastPostId before deleting the post.
);

CREATE TABLE ThreadCounters(
    ThreadId            int NOT NULL UNIQUE,
    PostNumber          int NOT NULL DEFAULT 1,
    ViewerNumber        int NOT NULL DEFAULT 1,

    CONSTRAINT PK_ThreadId PRIMARY KEY CLUSTERED (ThreadId),
    CONSTRAINT FK_ThreadId FOREIGN KEY (ThreadId)
        REFERENCES Threads (ThreadId)
        -- ThreadCounters and Threads are in an one-to-one relationship.
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE ThreadsTypeAttributes(
    Type nvarchar(16) NOT NULL DEFAULT 'topic' PRIMARY KEY NONCLUSTERED,
    Comment nvarchar(64) NULL
);
INSERT INTO ThreadsTypeAttributes (Type, Comment) VALUES ('topic', '话题，默认');
INSERT INTO ThreadsTypeAttributes (Type, Comment) VALUES ('qa', '问答');
INSERT INTO ThreadsTypeAttributes (Type, Comment) VALUES ('poll', '投票');

CREATE TABLE ThreadsTopTypeAttributes(
    Type nvarchar(16) NOT NULL DEFAULT 'off' PRIMARY KEY NONCLUSTERED,
    Comment nvarchar(64) NULL
);
INSERT INTO ThreadsTopTypeAttributes (Type, Comment) VALUES ('off', '未置顶，默认');
INSERT INTO ThreadsTopTypeAttributes (Type, Comment) VALUES ('board', '本版置顶') ;
INSERT INTO ThreadsTopTypeAttributes (Type, Comment) VALUES ('parent', '上级版块（区）置顶');
INSERT INTO ThreadsTopTypeAttributes (Type, Comment) VALUES ('top', '全站置顶');

CREATE TABLE ThreadsGoodTypeAttributes(
    Type nvarchar(16) NOT NULL DEFAULT 'off' PRIMARY KEY NONCLUSTERED,
    Comment nvarchar(64) NULL
);
INSERT INTO ThreadsGoodTypeAttributes (Type, Comment) VALUES ('off', '未加精华，默认');
INSERT INTO ThreadsGoodTypeAttributes (Type, Comment) VALUES ('reserved', '保留');
INSERT INTO ThreadsGoodTypeAttributes (Type, Comment) VALUES ('elite', '精华');

CREATE TABLE Threads(
    ThreadId          int NOT NULL IDENTITY,
    Parent            int NOT NULL,
    Oplist            int NOT NULL,
    DefaultPostOplist int NOT NULL,
    FirstPost         int NULL,
    -- for insert the thread record before the first post record without triggering the constraint.
    Title             nvarchar(256) NOT NULL,
    Type              nvarchar(16) NOT NULL,
    TopType           nvarchar(16) NOT NULL,
    TopTimeout        datetime NULL, -- NULL means alway on top.
    GoodType          nvarchar(16) NOT NULL,
    Anonymous         bit NOT NULL,
    NoPost            bit NOT NULL,
    Time              datetime NOT NULL,
    Highlight         nvarchar(64) NULL DEFAULT NULL,
    -- e.g. A JSON expression of '{"color": "0x222222", "italic": false, "bold": false}'.

    INDEX IDX_Parent (Parent),
    INDEX IDX_Type (Type),
    INDEX IDX_TopType (TopType),
    INDEX IDX_GoodType (GoodType),
    INDEX IDX_Time (Time DESC),

    CONSTRAINT PK_ThreadId PRIMARY KEY CLUSTERED (ThreadId),
    CONSTRAINT FK_Parent FOREIGN KEY (Parent)
        REFERENCES Boards (BoardId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete a board without deleting all its threads.
    CONSTRAINT FK_Oplist FOREIGN KEY (Oplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_DefaultPostOplist FOREIGN KEY (DefaultPostOplist)
        REFERENCES Oplists (OplistId)
        ON UPDATE CASCADE
        ON DELETE NO ACTION, -- Can not delete an oplist in use.
    CONSTRAINT FK_FirstPost FOREIGN KEY (FirstPost)
        REFERENCES Posts (PostId)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
        -- when there's no other posts besides the FirstPost in this thread,
        -- deleting the first post would delete the thread.
    CONSTRAINT FK_Type FOREIGN KEY (Type)
        -- Use foreign key constraint to limit the values.
        REFERENCES ThreadsTypeAttributes (Type)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT FK_TopType FOREIGN KEY (TopType)
        -- Use foreign key constraint to limit the values.
        REFERENCES ThreadsTopTypeAttributes (Type)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT FK_GoodType FOREIGN KEY (GoodType)
        -- Use foreign key constraint to limit the values.
        REFERENCES ThreadsGoodTypeAttributes (Type)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

\code+{end}

\h5{数据库View}
\code+[sql]{begin}

CREATE VIEW ThreadsView AS
SELECT
    t.ThreadId AS Id,
    t.Parent,
    t.Oplist,
    b.DefaultThreadOplist,
    t.DefaultPostOplist,
    t.FirstPost,
    t.Title,
    t.Type,
    t.TopType,
    t.TopTimeout,
    t.GoodType,
    t.Anonymous,
    t.NoPost,
    p.Author,
    u.Name AS AuthorName,
    t.Time,
    t.Highlight,
    c.PostNumber,
    c.ViewerNumber,
    s.PostToViewerRatio,
    s.PopularityScore,
    s.LastPost,
    lp.Time AS LastPostTime
FROM Threads AS t
    INNER JOIN Boards AS b         ON b.BoardId = t.Parent
    INNER JOIN Posts AS p          ON p.PostId = t.FirstPost
    INNER JOIN Posts AS lp         ON lp.PostId = t.LastPost
    INNER JOIN Users AS u          ON u.UserId = p.Author
    INNER JOIN ThreadCounters AS c ON c.ThreadId = t.ThreadId
    INNER JOIN ThreadStats AS s    ON s.ThreadId = t.ThreadId;

CREATE VIEW  ThreadsViewSortInvtime
AS
SELECT * ROW_NUMBER() OVER (ORDER BY Time DESC)
FROM ThreadsView ORDER BY Time DESC;

CREATE VIEW  ThreadsViewSortMru
AS
SELECT * ROW_NUMBER() OVER (ORDER BY LastPostTime DESC)
FROM ThreadsView ORDER BY LastPostTime DESC;

CREATE VIEW  ThreadsViewSortPop
AS
SELECT * ROW_NUMBER() OVER (ORDER BY PopularityScore DESC)
FROM ThreadsView ORDER BY PopularityScore DESC;

CREATE PROCEDURE getThreadsByParentSortInvtime
    @parentId int,
    @count int = 20,
    @offset int = 0
AS
BEGIN
    SELECT *
    FROM ThreadsViewSortInvtime
    WHERE Parent = @parentId  AND RowNumber BETWEEN @count*@offset+1 AND @count*(@offset+1)
END;

CREATE PROCEDURE getThreadsByParentSortMru
    @parentId int,
    @count int = 20,
    @offset int = 0
AS
BEGIN
    SELECT *
    FROM ThreadsViewSortMru
    WHERE Parent = @parentId  AND RowNumber BETWEEN @count*@offset+1 AND @count*(@offset+1)
END;

CREATE PROCEDURE getThreadsByParentSortPop
    @parentId int,
    @count int = 20,
    @offset int = 0
AS
BEGIN
    SELECT *
    FROM ThreadsViewSortPop
    WHERE Parent = @parentId  AND RowNumber BETWEEN @count*@offset+1 AND @count*(@offset+1)
END;

-- Using case:
EXECUTE getThreadsByParentSortInvtime 113, 20, 0;
EXECUTE getThreadsByParentSortMru 113, 20, 0;
EXECUTE getThreadsByParentSortPop 113, 20, 0;
\code+{end}


\h4{入口和过滤器}

特定讨论资源的固定入口为\@/resources/threads/{$id}\@，讨论列表资源入口为\@/resources/threads\@，配合过滤器可以筛选出需要的讨论列表。

讨论列表资源支持的过滤器：
\list#{
    \* \@?parent={$parent}\@，某一板块下的讨论列表；
    \* \@?type={$type}\@，某一类型的讨论列表；
    \* \@?top_type={$top_type}\@，某一置顶的讨论列表；
    \* \@?good_type={$good_type}\@，某一精华类型的讨论列表；
    \* \@?author={$user_id}\@，某一作者发布的讨论列表；
    \* \@?sort_by={$method}\@，排序方式，默认为\@'invtime'\@（时间逆序），可选\@'mru'\@（最新回复），\@'pop'\@（热门优先）。
    \* \@?count={$count}&offset={$offset}\@，讨论列表的第\@$count*$offset+1\@到\@$count*$offset+$count\@项，共计\@$count\@项。默认\@$count=20, $offset=0\@。\@$count\@上限为100，即一个请求最多返回100条post的集合。
}
过滤器可以组合应用，解析顺序如上述。

\h4{资源访问方法：OPTIONS}
\alert[info]{max-age:days, must-revalidate}

OPTIONS用于获得用户对当前资源的访问方法，通过报头Allow字段返回。

其中，OPTIONS方法一直可用，其他方法根据用户当前的返回。

特定的讨论：
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
    "self": "threads/",
    "source": "threads/",
    "base": "/resources/",
    "links": {
        "post": {
            "href": "threads/?parent={parent}",
            "method": "POST",
            "description": "添加新讨论"
        },
        "edit": {
            "href": "threads/{id}",
            "method": "PUT",
            "description": "编辑此讨论"
        },
        "delete": {
            "href": "threads/{id}",
            "method": "DELETE",
            "description": "删除此讨论"
        },
        "top": {
            "href": "threads/{id}?top={$top_type}&timeout={$top_timeout}",
            "method": "PUT",
            "description": "置顶此讨论"
        },
        "untop": {
            "href": "threads/{id}?top=off",
            "method": "PUT",
            "description": "取消此讨论的置顶状态"
        },
        "good": {
            "href": "threads/{id}?good={$good_type}",
            "method": "PUT",
            "description": "加入精华"
        },
        "ungood": {
            "href": "threads/{id}?good=off",
            "method": "PUT",
            "description": "取消精华"
        },
        "anonymous": {
            "href": "threads/{id}?anonymous=yes",
            "method": "PUT",
            "description": "设置为匿名"
        },
        "onymous": {
            "href": "threads/{id}?anonymous=no",
            "method": "PUT",
            "description": "取消匿名状态"
        },
        "close": {
            "href": "threads/{id}?no_post=yes",
            "method": "PUT",
            "description": "关闭讨论的回复"
        },
        "open": {
            "href": "threads/{id}?no_post=no",
            "method": "PUT",
            "description": "打开讨论的回复"
        },
        "parent": {
            "href": "boards/{parent}",
            "method": "GET",
            "description": "讨论所在的版块"
        },
        "oplist": {
            "href": "oplists/{oplist}",
            "method": "GET",
            "description": "讨论的权限"
        },
        "default_post_oplist": {
            "href": "oplists/{default_post_oplist}",
            "method": "GET",
            "description": "默认的回复权限"
        },
        "default_thread_oplist": {
            "href": "oplists/{default_thread_oplist}",
            "method": "GET",
            "description": "版块下默认的讨论权限"
        },
        "author": {
            "href": "users/{author}",
            "method": "GET",
            "description": "讨论的作者"
        }
    }
}
\code+{end}

\h4{获取资源：GET}
\alert[info]{max-age:days, must-revalidate}

GET方法用于获取资源。

获取特定讨论时使用\@/resources/threads/{$id}\@。

返回完整的资源。
\code+[json]{begin}
{
    "threads": {
        "id": "1361"
        ...
    },
    "self": "threads/{id}",
    "source": "threads/{id}",
    "base": "/resources/"
}
\code+{end}

\alert{
小心处理匿名情况：后端需要检查用户是否有oplist中定义的view_anonymous权限，如果有，返回author和author_name；如果没有，则author为空，author_name由原始的用户名hash而来。
}

为了避免频繁刷新带来的资源浪费，回复列表的cache策略稍有改动：
\alert[info]{
默认max-age:minutes，无需验证，可以获得全局的回复列表\newline
有parent过滤器时，max-age:days, must-revalidate，获得某一讨论的回复列表}

获取资源列表时使用\@/resources/threads/\@，通过过滤器获得需要的资源列表。默认的过滤器为\@?sort_by=invtime&count=20&offset=0\@。

获取资源列表内仅仅包括\@id\@ \@parent\@ \@type\@ \@top_type\@ \@good_type\@ \@title\@ \@highlight\@ \@author\@ \@author_name\@ \@post_number\@ \@viewer_number\@，需要其他信息的，则需要使用访问特定讨论的接口。

\code+[json]{begin}

{
    "threads": [
        {
            "id": "1361",
            ...
        },
        {
            "id": "1365",
            ...
        },
        ...
    ],
    "links": {
        "first_page": {
            "href": "threads/?parent={parent}&sort_by=invtime&count=20&offset=0",
            "method": "GET",
            "description": "第一页"
        },
        "prev_page": {
            "href": null,
            "method": "GET",
            "description": "前一页"
        },
        "next_page": {
            "href": "threads/?parent={parent}&sort_by=invtime&count=20&offset=1",
            "method": "GET",
            "description": "后一页"
        },
        "last_page": {
            "href": "threads/?parent={parent}&sort_by=invtime&count=20&offset=163",
            "method": "GET",
            "description": "最后页"
        }
    },
    "item": "threads/{id}",
    "self": "threads/?parent={parent}&sort_by=invtime&count=20&offset=0",
    "source": "threads/",
    "base": "/resources/"
}

\code+{end}

links包括了页面间跳转的方法。

\h4{新建资源：POST}

新建讨论通过向\@/resources/posts\@使用POST方法，发送如下格式的JSON：
\code+[json]{begin}
{
    "threads": {
        "first_post": { ... },
        ...
    }
}
\code+{end}

如果向\@/resources/threads/?parent={$parent}\@使用POST方法，表示向\@$parent\@版块中新建讨论，等同于指定了\@parent\@项目，下述的\@parent\@项将被忽略。

其中可以提供以下属性：
\table{begin}
\r{
    \h 属性名
    \h 类型
    \h 必需
    \h 描述
}
\r{
    \d \@parent\@
    \d \@String\@
    \d yes，可用\@?parent={$parent}\@过滤器指定
    \d \@/resources/boards/{parent}\@，所在板块id，根据\@{parent}\@检查上级（板块）的\@post\@权限
}
\r{
    \d \@title\@
    \d \@String\@
    \d yes
    \d 讨论标题，必须为纯文本
}
\r{
    \d \@type\@
    \d \@String\@
    \d yes
    \d 讨论类型，\@'topic'\@ \@'qa'\@ \@'poll'\@中任一
}
\r{
    \d \@first_post\@
    \d \@Post\@
    \d yes
    \d 第一回复，格式参考\link+[回复]{#/resources_posts.ml.js}，但无须指定其\@parent\@
}
\r{
    \d \@top_type\@ \@top_timeout\@
    \d \@String\@
    \d optional
    \d \@top_type\@置顶类型，\@'off'\@（默认） \@'board'\@ \@'parent'\@ \@'top'\@中任一；\@top_timeout\@过期时间，ISO 8601格式，默认为\@null\@，检查用户有此板块相应的\@top\@权限
}
\r{
    \d \@good_type\@
    \d \@String\@
    \d optional
    \d 精华类型，\@'off'\@（默认） \@'reserved'\@ \@'elite'\@中任一，检查用户有此板块相应的\@good\@权限
}
\r{
    \d \@anonymous\@
    \d \@Boolean\@
    \d optional
    \d 是否匿名，\@false\@（默认）, \@true\@检查用户有此板块的\@anonymous\@权限
}
\r{
    \d \@no_post\@
    \d \@Boolean\@
    \d optional
    \d 是否关闭回复，\@false\@（默认）, \@true\@检查用户有此板块的\@close\@权限
}
\r{
    \d \@highlight\@
    \d \@Object\@
    \d optional
    \d 是否高亮，直接提供json（e.g.\@{"color":"#030303"， "bold":false, "italic":false}\@），检查用户有此板块的\@highlight\@权限
}

\table{end}

成功回复\@200 Created\@，且报头中的\@Location\@为新建的thread链接。

失败则根据失败原因分别回复。

\h4{删除资源：DELETE}

\alert[info]{no-cache, no-store}

删除讨论需要向\@/resources/threads/{$id}\@使用DELETE方法，成功回复\@204 No Content\@。

讨论下的所有回复也因此删除，需要检查delete权限，和讨论下所有回复的delete权限。

失败则根据失败原因分别返回。

\h4{修改资源：PUT}

\alert[info]{no-cache, no-store}

根据修改的资源内容不同分为如下操作。

向\@/resources/threads/{$id}\@使用PUT方法，格式为：

\code+[json]{begin}
{
    "threads": {
        ...
    }
}

\code+{end}

可改变的内容为:

\table{begin}
\r{
    \h 属性名
    \h 类型
    \h operation
    \h 描述
}
\r{
    \d \@title\@
    \d \@String\@
    \d \@title($id)\@
    \d 标题，必须为纯文本，检查title权限
}
\r{
    \d \@top_type\@
    \d \@String\@
    \d \@top($id, $top_type, $timeout)\@
    \d 置顶，检查相应的top权限
}
\r{
    \d \@good_type\@
    \d \@String\@
    \d \@good($id, $good_type)\@
    \d 精华，检查相应的good权限
}
\r{
    \d \@anonymous\@
    \d \@Boolean\@
    \d \@anonymous($id})\@ or \@onymous($id)\@
    \d 匿名，检查相应的anonymous/onymous权限
}
\r{
    \d \@no_post\@
    \d \@Boolean\@
    \d \@close($id)\@ or \@open($id)\@
    \d 关闭/打开回复，检查相应的open/close权限
}
\r{
    \d \@highlight\@
    \d \@Object\@
    \d \@highlight($id)\@
    \d 高亮标题，检查相应的highlight权限
}
\table{end}
