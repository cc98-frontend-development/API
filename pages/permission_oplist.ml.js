\h3{oplist}

Oplist(Opertaion Permission List)是关于operation的权限列表，也是一种资源，通过\@resources/oplist\@访问。

Oplist是有层级的，最上层的oplist只能后台修改，API层面只读。

\h4{数据结构}

\code+[coffee]{begin}

    class Oplist
        String id           # /resources/oplists/{id}
        String oplist       # /resources/oplists/{oplist}
        Boolean is_heritage # default: false
        String default      # computed, /resources/oplists/{default}
        Operation ops[]

    class Operation
        Boolean deny        # true for blacklist, false for whitelist
        String op
        String client       # cc98web
        Boolean except      # used with 'user'
        String user_type    # NORMAL GROUP PROXY
        String user         # user/group/proxy name
        String log_level    # NOLOG LOG LOGALLOWD LOGDENIED
\code+{end}

\list*{
    \* \@id\@oplist id
    \* \@oplist\@表示记录此oplist操作权限的oplist。
    \* \@is_heritage\@此oplist是否是继承于上级资源指定的默认oplist
    \* \@default\@表示这个oplist绑定的资源的默认oplist，储存于绑定回复父资源（讨论）的\@default_post_oplist\@中。
}


\h4{oplist的层级}

可以根据oplist中operation的作用对象不同，把oplist分为两类，记录对oplist操作的oplist和记录对其他资源操作的oplist。

无论是oplist资源，还是普通资源，都有一个\@oplist\@属性，保存了记录对该资源操作的oplist的\@oplist_id\@。尽管所有的\@Oplist\@的数据结构均相同。

\fig{begin}

	\img{pages/graph/erd/oplist_to_resource.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}
\fig{end}

子资源oplist的oplist，通常是其父资源的oplist，子资源的oplist，权限等级上看做同父资源相同。

Post的oplist，和它的父资源Thread的权限等级相同。

Post的oplist的oplist，和它父资源Thread的oplist，和它的祖父资源Board权限等级相同。

\fig{begin}
	\img{pages/graph/erd/oplist_to_resource_2.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}
\fig{end}


\h4{oplist的copy-on-write机制}

由于一个oplist可能被多个资源使用，当修改某一资源的oplist时，会影响其他使用这个oplist的资源，这是我们不希望看到的。'
所以，修改某一资源的oplist时，后端会复制一份目前的oplist，并在这份oplist里面做出修改，而其他使用原oplist的资源不受影响。这个叫做copy-on-write机制。

当oplist只有一个资源使用的时候，修改这个oplist同样受到copy-on-write机制的影响，修改后的oplist和原来的oplist不是同一资源，他们的\@oplist_id\@不同。原来的那个oplist没有被任何资源使用，则从系统中删除。

\fig{begin}
	\img{pages/graph/erd/oplist_copy_on_write.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}
\fig{end}


\h4{默认oplist与继承}

同一的父资源下的子资源，通常使用同一个oplist，这个oplist则是子资源的默认oplist。

父资源保存了子资源默认oplist的引用。当子资源指定特殊的oplist时，copy-on-write机制会保证其他子资源仍然使用了默认oplist。

删除子资源的oplist动作，实际上是删除了子资源指定的特殊oplist，将其重新设定为默认oplist的过程。

\fig{begin}
	\img{pages/graph/erd/oplist_default.png}
    \alert[info]{\@*key*\@表示该键为主键；\@-key-\@表示该键储存于其他结构中，在此资源内只读；\@<key>\@表示该键为一结构}
\fig{end}

在父资源（e.g. Thread）中指定的子资源（e.g. Post）的默认oplist如果继承自祖父资源（e.g. Board），则其\@is_heritage\@属性为\@true\@；如果该oplist不是默认oplist，则\@is_heritage\@无意义，取默认值\@false\@


\h4{oplist 人类可读的表示的语法定义}
Oplist表示为机器可读的Operation的集合，为了便于表述，下面给出了其人类可读的表示定义。
例子：
\code{begin}
op1: [cc98web] user
op2: !user @group
op3: $proxy
!op1: !@group (LOGDENIED)
\code{end}

Oplist根据op分为白名单和黑名单。
形如\@op: user\@的为白名单，而形如\@!op: user\@为黑名单。

权限检查时按这样的逻辑进行：

用户在白名单中，\emphasis{且}用户不在黑名单中，则允许操作；\newline
用户不在白名单中，\emphasis{或}用户在黑名单中，则拒绝操作。

有oplist允许3类用户：
\list*{
    \* 普通用户：即表示为 \@用户名\@
    \* 用户组：表示为 \@@用户组名\@
    \* 代理用户：表示 \@$代理用户名\@
}

其中，用户名是固定的内容，用户组名代表了一系列固定的用户名，而代理用户名则代表了一系列相对不固定的用户名，根据oplist所对应的资源不同，代理用户名对应的用户也不同。

比如说，一个回复的oplist中，\@$author\@，就代表了这个回复的发表者，对于不同的回复，这个\@$author\@不同。

用户名前的\@!\@表示除外。它表示未定义，和黑名单稍有区别，看如下的例子：
\code{begin}
op1: !guest @user
\code{end}

读作：允许除guest外的任意用户或user组里的用户进行op1操作。

\code{begin}
op1:@user
!op1: guest
\code{end}

读作：允许user组里的用户进行op1操作，拒绝guest用户进行op1操作。

当guest也在user组里的时候，前者的结果是允许guest，后者是禁止。

用户列表前的\@[cc98web]\@表示API服务的客户端(client_id)，目前仅支持网页客户端\@cc98web\@，如果忽略，则表示默认的\@[cc98web]\@。

每条oplist后的\@(LOGALLOWED)\@、\@(LOGDENIED)\@或\@(LOG)\@是可选标记（注意没有空格），如果存在，则做权限判断时，检查到这条oplist的动作会被记录下来。\@(LOGALLOWED)\@表示通过这条oplist的动作被记录下来；\@LOGDENIED\@则表示不通过时记录；\@LOG\@则为任何状态下都记录；如果没有这个标记，等同于\@NOLOG\@，则表示不做记录；可以参考以下的格式记录：

\code{begin}
op1:user	| YYYY-MM-DD HH:MM:SS.sss user doing op1 with operand xxx		| ALLOWED
op2:@group	| YYYY-MM-DD HH:MM:SS.sss user@group doing op2 with operand xxx | DENIED
!op3:$proxy | YYYY-MM-DD HH:MM:SS.sss user$proxy doing op3 with operand xxx | DENIED
\code{end}

完整语法定义如下（in \link+[PEG.js]{http://pegjs.majda.cz/}）：

\code+[haskell]{begin}

Oplist
 = Items
 / isEof

Items = Item+

Item = (Whitelist / Blacklist) Log_mark? NL+

Log_mark = "(" "LOG" ("ALLOWED"/"DENIED")? / "NOLOG" ")" 

Whitelist = Op ":" Sp ("[" Sp? Client Sp?"]")? Users 

Blacklist = "!" Sp? Whitelist

Op = (!":" Normal_char)+

Users
 = User
 / (User Sp)+

User
 = "!"? (User_name
    / Group_name
    / Proxy_name)

User_name = Normal_char+

Group_name = "@" Normal_char+

Proxy_name = "$" Normal_char+

Client = "cc98web"

Normal_char = !("("/")"/"["/"]"/"@"/"$"/"!"/Sp_char/NL) .

isEof = !.

NL = "\r\n" / "\n"

Sp = Sp_char+

Sp_char = "\t" / " "
\code+{end}

