\h3{Access Token Request}

内容实体包括6个参数：
\list*{
    \* \@grant_type\@：必要，必须为\@password\@
    \* \@username\@：必要，用户的用户名
    \* \@password\@：必要，用户的密码
    \* \@scope\@：必要，暂定\@api.cc98.org\@
    \* \@client_id\@：必要，必须为\@cc98web\@
    \* \@client_secret\@：必要，在用户登录界面时发送给客户端，代表不同的客户端程序的版本，可由主要网页客户端文件的hash计算出。
}

\code+[http]{begin}
POST /token HTTP 1.1
Host: auth.cc98.org
ContentType: application/x-www-form-urlencoded
\code+{end}

\code+[http]{begin}
grant_type=password&username=johndoe&password=A3ddj3w&scope=api.cc98.org&client_id=cc98web&client_secret=36b80d0df530972fa4dbf8da33230092
\code+{end}

服务器端需要
\list#{
    \* 是否满足限速条件（防止暴力破解密码）
    \* 验证client credentials，即\@client_id\@和\@client_secret\@是否合格
    \* 验证resource owner credentials，即\@username\@和\@password\@是否正确
}

\h4{成功回复}

如果通过了以上步骤，服务器发放access token和refresh token：

内容实体包括5个参数：
\list*{
    \* \@access_token\@：必要，access token
    \* \@token_type\@：必要，必须为\@bearer\@
    \* \@expire_in\@：必要（OAuth2建议），access token的过期时间（秒），3600表示收到这个回复后的3600秒后access token将过期
    \* \@refresh_token\@：必要（OAuth2可选），可以用这个token获取新的access token，避免让用户重复输入密码，具体参考\link+[refresh token]{#/auth_refresh.ml.js}
    \* \@scope\@：可选，暂定\@api.cc98.org\@，忽略即表示为\@api.cc98.org\@
}

\code+[http]{begin}
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Cache-Control: no-cache, no-store
\code+{end}

\code+[json]{begin}
{
    "access_token":"2YotnFZFEjr1zCsicMWpAA",
    "token_type":"bearer",
    "expires_in":3600,
    "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
}
\code+{end}


