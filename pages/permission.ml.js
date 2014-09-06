\h3{权限}

任何用户的动作都需要经过认证、授权、权限检查才能真正执行。

这部分的文档描述了根据授权凭证access token，完成权限检查的过程。

\h4{权限检查相关概念}

\h5{access token}

Access token是已经认证用户的临时访问凭证，它在特定的时间段内代表了用户。Access token的检查主要包括：

\list#{
    \* access token对应的用户id。
    \* access token是否有效：当前时间access token是否可用，如果已经过期，则使用refresh token生成新的access token；如果失效，则提示重新认证授权。 \link+[参考]{#/auth.ml.js}
}

\h5{operation}

Operation是用户对资源读写操作的一种抽象，它包括了三部分内容：操作者(operator) 被操作者(operand)和操作动作(op)。

例如：用户读取某一讨论的资源，可以表述为 \@user_id: read_thread(thread_id, ...)\@ 这样一个operation。其中\@user_id\@是operator，\@(thread_id, ...)\@是operand，而\@read_thread\@则是一个op。

Operand是执行op所需要的所有对象，包括了资源标识（比如例子中的\@thread_id\@）和其他需要的信息。operand的解读对于每个op来说都不同：如果把op看成函数，则operand就是它的参数。

\h5{oplist}
Oplist是关于资源的所允许的operation的列表，其自身的存在是一种operand->op的映射，而其中的内容则是oprand->operator的映射。

例如某一个thread的oplist部分内容如下：
\code{begin}

read_thread: @users
post: @users
!post: guest
edit_thread: $board_admin $author

\code{end}
表明所有属于组\@@users\@的用户都可以对这个thread进行读的操作(查看其中的回复)，而除了guest以外的\@@users\@用户可以post（发表回复），只有thread的作者（\@$author\@）和版块管理员（\@$board_admin\@）可修改这个thread。

Oplist的详细内容在\link+[这里]{#/permission_oplist.ml.js}给出。

\h5{proxy_operator}
有些时候必要的操作需要某些具有特权的“公共操作者”，而不是以普通用户的名义，这样的操作由代理操作者(proxy_operator)完成。表示为\@proxy_operator(operator)\@，即operator以proxy_operator的身份完成。
