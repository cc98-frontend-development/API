\h3{oplist}

Oplist是关于operation的权限列表，也是一种资源，通过\@resources/oplist\@访问。

Oplist是有层级的，最上层的oplist只能后台修改，API层面只读。


\h4{oplist 的表示语法定义}
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

每条oplist后的\@(LOGALLOWED)\@、\@(LOGDENIED)\@或\@(LOG)\@是可选标记（注意没有空格），如果存在，则做权限判断时，检查到这条oplist的动作会被记录下来。\@(LOGALLOWED)\@表示通过这条oplist的动作被记录下来；\@LOGDENIED\@则表示不通过时记录；\@LOG\@则为任何状态下都记录；如果没有这个标记，则表示不做记录；可以参考以下的格式记录：

\code{begin}
op1:user | YYYY-MM-DD HH:MM:SS.sss user doing op1 with operand xxx | ALLOWED
op2:@group | YYYY-MM-DD HH:MM:SS.sss user@group doing op2 with operand xxx | DENIED
!op3:$proxy | YYYY-MM-DD HH:MM:SS.sss user$proxy doing op3 with operand xxx | DENIED
\code{end}

完整语法定义为（in \link+[PEG.js]{http://pegjs.majda.cz/}）：

\code+[haskell]{begin}

Oplist
 = Items
 / isEof

Items = Item+

Item = (Whitelist / Blacklist) Log_mark? NL+

Log_mark = "(LOG" ("ALLOWED"/"DENIED")? ")"

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

Normal_char = !("["/"]"/"@"/"$"/"!"/Sp_char/NL) .

isEof = !.

NL = "\r\n" / "\n"

Sp = Sp_char+

Sp_char = "\t" / " "
\code+{end}

