\h3{获取Access Token}

\h4{Access Token Request}

\@application/x-www-form-urlencoded\@格式，内容实体包括6个参数：
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
    \* 是否满足限速条件（防止暴力破解密码），具体参考\link+[限速]{#/ratelimit.ml.js}
    \* 验证client credentials，即\@client_id\@和\@client_secret\@是否合格
    \* 验证resource owner credentials，即\@username\@和\@password\@是否正确
}

\h5{成功回复}

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
Content-Type: application/json;charset=UTF-8
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

\h5{错误回复}

参考：\link+[Error Response]{http://tools.ietf.org/html/rfc6749#section-5.2}

错误回复应该使用400状态码，返回的参数包括
\list*{
    \* \@error\@：必须，错误状态，为以下几个之一：
        \list*{
            \* \@invalid_request\@：请求格式不正确，参数不正确
            \* \@invalid_client\@：客户端认证失败
            \* \@invalid_grant\@：token无效/过期
            \* \@unauthorized_client\@：客户端不允许使用这个授权类型
            \* \@unsupported_grant_type\@：授权类型不支持
            \* \@invalid_scope\@：错误的scope
        }
    \* \@error_description\@：必须（OAuth2可选），human-readable ASCII字符，进一步描述错误类型，用于记录日志和开发调试用。
    \* \@error_uri\@：必须（OAuth2可选），包含用户可读错误信息的页面地址，改页面内\emphasis{应该}包括引导用户完成正确授权的内容。
}

\code+[http]{begin}
HTTP/1.1 400 Bad Request
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache
\code+{end}

\code+[json]{begin}
{
        "error":"invalid_request"
}
\code+{end}

\h3{使用Access Token}

Access token直接用于访问资源，仅仅需要在报头加入\@Authorization: Bearer {access_token}\@。

\code+[http]{begin}
GET /some_resource HTTP 1.1
Host: api.cc98.org
ContentType: application/json;charset=UTF-8
Authorization: Bearer 2YotnFZFEjr1zCsicMWpAA
\code+{end}

服务器需要验证
\list#{
    \* 是否满足限速条件（防止脚本恶意刷贴），具体参考\link+[限速]{#/ratelimit.ml.js}
    \* 验证access token是否正确，如果不正确，应引导用户重新登录；如果access token过期，应引导客户端刷新access token，参考\link+[refresh token]{#/auth_refresh.ml.js}
    \* 访问的scope是否在授权内
}

错误回复参照上文。
