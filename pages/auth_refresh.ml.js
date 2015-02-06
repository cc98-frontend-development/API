\h3{获取Refresh Token}

Refresh token伴随着获取access token而一同获取，参考\link+[access token]{#/auth_access.ml.js}

\h3{使用Refresh Token}

使用access token访问资源时，由于access token过期，服务器回复

\code+[http]{begin}
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8; api_version=1.0
Cache-Control: no-store
Pragma: no-cache
\code+{end}

\code+[json]{begin}
{
    "error":"invalid_grant",
    "error_description":"expired access token",
    "error_uri":"auth.cc98.org/token"
}
\code+{end}

客户端检查到这样的回复，就用储存的refresh token获取新的access token：


\@application/x-www-form-urlencoded\@格式，内容实体包括5个参数：
\list*{
    \* \@grant_type\@：必要，必须为\@refresh_token\@
    \* \@refresh_token\@：必要，之前获取的refresh token
    \* \@scope\@：必要，暂定\@api.cc98.org\@
    \* \@client_id\@：必要，必须为\@cc98web\@
    \* \@client_secret\@：必要，在用户登录界面时发送给客户端，代表不同的客户端程序的版本，可由主要网页客户端文件的hash计算出。
}

\code+[http]{begin}
POST /token HTTP/1.1
Host: auth.cc98.org
Content-Type: application/x-www-form-urlencoded
\code+{end}

\code+[http]{begin}
grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA&scope=api.cc98.org&client_id=cc98web&client_secret=36b80d0df530972fa4dbf8da33230092
\code+{end}

服务器端需要
\list#{
    \* 是否满足限速条件，具体参考\link+[限速]{#/basic_ratelimit.ml.js}
    \* 验证client credentials，即\@client_id\@和\@client_secret\@是否合格
    \* 验证refresh_token，是否正确，其对应的access token是否过期
    \* 如果过期，发放新的access token，和新的refresh token；否则回复原有的aceess token，但重新计算过期时间。
}
