\h3{oplist}

Oplist是关于operation的权限列表，也是一种资源，通过\@resources/oplist\@访问。
Oplist修改的修改权限是有层级的，即版面oplist的修改权限属于上一层版块，若上层为null（版块id为0的根版块，即全站）的oplist只能通过API读取，而不能修改。


\h4{语法定义}
例子：
\code{begin}
op1: [cc98web] user
op2: !user @group
op3: $proxy
!op1: !@group
\code{end}

Oplist根据op分为白名单和黑名单。
形如\@op: user\@的为白名单，而形如\@!op: user\@为黑名单。

权限检查时按这样的逻辑进行：

用户在白名单中，且用户不在黑名单中，则允许操作；\newline
用户不在白名单中，或用户在黑名单中，则拒绝操作。

有oplist允许3类用户：
\list*{
    \* 普通用户：即表示为 \@用户名\@
    \* 用户组：表示为 \@@用户组名\@
    \* 代理用户：表示 \@$代理用户名\@
}

其中，用户名是固定的内容，用户组名代表了一系列固定的用户名，而代理用户名则代表了一系列不固定的用户名，根据oplist所对应的资源不同，代理用户名对应的用户也因此不同。

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

完整语法定义为（in \link+[PEG.js]{http://pegjs.majda.cz/}）：

\code{begin}

Oplist
 = Items
 / isEof

Items = Item+

Item = (Whitelist / Blacklist) NL+

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
\code{end}

