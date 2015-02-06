\h3{关联表}

关联表是一类用于记录多对多关系的交叉表，我们用关联表来记录动作发起者和动作对象之间的关系，以获得各种统计信息（比如用户行为统计，用户偏好，活力计算，马甲识别，资源访问情况统计）。

\h4{回复关联表}

回复关联表记录了用户对回复的各类动作，以及对每一个回复最后一次动作发生的时间。每次修改这个关联表时，应该检查权限列表中的LOG字段，以决定是否将此次改动记录日志。

暂时不提供访问API。

\h5{数据库Schema}

\code+[sql]{begin}

CREATE TABLE UsersXPosts(
    UserId   int NOT NULL,
    PostId   int NOT NULL,
    Action   int NOT NULL,
    LastTime datatime NOT NULL, -- The time the action is performed most recently.

    INDEX IDX_UserId (UserId),
    INDEX IDX_PostId (PostId),
    INDEX IDX_Action (Action),
    INDEX IDX_LastTime (LastTime DESC),

    CONSTRAINT PK_UsersXPosts PRIMARY KEY NONCLUSTERED (UserId, PostId, Action),
    CONSTRAINT FK_UserId FOREIGN KEY (UserId)
        REFERENCES Users (UsersId),
        ON UPDATE CASCADE,
        ON DELETE CASCADE, -- When deleting a user, deletes all its records.
    CONSTRAINT FK_PostId FOREIGN KEY (PostId)
        REFERENCES Posts (PostId),
        ON UPDATE CASCADE,
        ON DELETE CASCADE, -- When deleting a post, deletes all its records.
    CONSTRAINT FK_Action FOREIGN KEY (Action)
        REFERENCES UserPostActions (Action),
        ON UPDATE CASCADE,
        ON DELETE NO ACTION -- Can not delete action in use.
);

CREATE TABLE UserPostActions (
    Action  nvarchar(32) NOT NULL PRIMARY KEY NONCLUSTERED,
    Comment nvarchar(96) NULL
);
INSERT INTO UserPostActions (Action, Comment) VALUES ('views', "查看");
INSERT INTO UserPostActions (Action, Comment) VALUES ('posts', "发表回复");
INSERT INTO UserPostActions (Action, Comment) VALUES ('replys', "回复某一回复");
INSERT INTO UserPostActions (Action, Comment) VALUES ('edits', "修改回复");
INSERT INTO UserPostActions (Action, Comment) VALUES ('ranks', "赞同/反对回复");
INSERT INTO UserPostActions (Action, Comment) VALUES ('enabled_changes', "改变回复开关状态");
INSERT INTO UserPostActions (Action, Comment) VALUES ('hidden_changes', "改变回复隐藏状态");
\code+{end}

\h5{数据库View}
\code+[sql]{begin}

CREATE VIEW UsersXPostsToday
AS
SELECT * FROM UsersXPosts WHERE LastTime > DATEADD(day, -1, CURRENT_TIMESTAMP);

-- using case: posts that the user with id 123 posts today?
SELECT PostId FROM UsersXPostsToday
WHERE UserId = 123 AND Action = 'posts';

-- using case: how many users have viewed the post with id 8481?
SELECT COUNT(UserId) FROM UsersXPosts
WHERE PostId = 8481;

-- using case: what post, and by whom is viewed most recently?
SELECT TOP (1) UserId, PostId FROM UsersXPosts
WHERE Action = 'views' ORDER BY (LastTime DESC);

-- using case: what is the favourite 3 threads(defined by posts number in that thread) of user with id 123?
SELECT TOP (3) * FROM 
    (SELECT p.Parent AS ThreadId, COUNT(uxp.PostId) OVER ( PARTITION BY p.ThreadId) AS PostsNumber
     FROM UsersXPosts AS uxp 
        INNER JOIN Posts AS p ON p.PostId = uxp.PostId
    WHERE uxp.UserId = 123 AND uxp.Action = 'posts')
ORDER BY PostsNumber DESC;

\code+{end}

\h4{讨论关联表}

暂时不提供访问API，只提供少量根据关联表统计的结果。

\h5{数据库Schema}

\code+[sql]{begin}

CREATE TABLE UsersXThreads(
    UserId   int NOT NULL,
    ThreadId int NOT NULL,
    Action   int NOT NULL,
    LastTime datatime NOT NULL, -- The time the action is performed most recently.

    INDEX IDX_UserId (UserId),
    INDEX IDX_PostId (PostId),
    INDEX IDX_Action (Action),
    INDEX IDX_LastTime (LastTime DESC),

    CONSTRAINT PK_UsersXThreads PRIMARY KEY CLUSTERED (UserId, ThreadId, Action),
    CONSTRAINT FK_UserId FOREIGN KEY (UserId)
        REFERENCES Users (UsersId),
        ON UPDATE CASCADE,
        ON DELETE CASCADE, -- When deleting a user, deletes all its records.
    CONSTRAINT FK_ThreadId FOREIGN KEY (ThreadId)
        REFERENCES Threads (ThreadId),
        ON UPDATE CASCADE,
        ON DELETE CASCADE, -- When deleting a thread, deletes all its records.
    CONSTRAINT FK_Action FOREIGN KEY (Action)
        REFERENCES UserThreadActions (Action),
        ON UPDATE CASCADE,
        ON DELETE NO ACTION -- Can not delete action in use.
);

CREATE TABLE UserThreadActions (
    Action  nvarchar(32) NOT NULL PRIMARY KEY NONCLUSTERED,
    Comment nvarchar(96) NULL
);
INSERT INTO UserThreadActions (Action, Comment) VALUES ('views', "查看");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('posts', "发表讨论");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('moves', "移动讨论");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('edits', "修改讨论(标题，类型）");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('top_changes', "置顶/取消置顶回复");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('good_changes', "改变精华状态");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('no_post_changes', "允许/关闭回复");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('anonymous_changes', "改变匿名状态");
INSERT INTO UserThreadActions (Action, Comment) VALUES ('highlight_changes', "改变高亮状态");
\code+{end}

\h5{数据库View}
\code+[sql]{begin}

CREATE VIEW UsersXThreadsToday
AS
SELECT * FROM UsersXThreads WHERE LastTime > DATEADD(day, -1, CURRENT_TIMESTAMP);

-- using case: threads that the user with id 123 threads today?
SELECT ThreadId FROM UsersXThreadsToday
WHERE UserId = 123 AND Action = 'threads';

-- using case: how many users have viewed the thread with id 8481?
SELECT COUNT(UserId) FROM UsersXThreads
WHERE ThreadId = 8481;

-- using case: what thread, and by whom is viewed most recently?
SELECT TOP (1) UserId, ThreadId FROM UsersXThreads
WHERE Action = 'views' ORDER BY (LastTime DESC);

\code+{end}
