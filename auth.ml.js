\h3{授权}

API的授权使用\link+[OAuth2]{http://oauth.net/2/}。

网站的授权采用\link+[Resource Owner Password Credentials Grant]{http://tools.ietf.org/html/rfc6749#section-4.3}。第一版API中暂不支持第三方应用授权。
第三方应用采用\link+[Authorization Code Grant]{http://tools.ietf.org/html/rfc6749#section-4.1}，将在第二版API中实现。

\h4{网站授权}
由于Resource Owner Password Creditials是直接明文发送至服务器，服务器与客户端直接的连接必须是在HTTPS/TLS的保护下。


