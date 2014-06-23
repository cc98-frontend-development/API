\h3{授权}

API的授权使用\link+[OAuth2]{http://oauth.net/2/}，其请求和回复的定义与API的其他部分略有不同。

网站的授权采用\link+[Resource Owner Password Credentials Grant]{http://tools.ietf.org/html/rfc6749#section-4.3}。第一版API中暂不支持第三方应用授权。
第三方应用采用\link+[Authorization Code Grant]{http://tools.ietf.org/html/rfc6749#section-4.1}，将在第二版API中实现。

\h4{网站授权}
网站使用OAuth2的\link+[Resource Owner Password Creditials Grant]{http://tools.ietf.org/html/rfc6749#section-4.3}方式授权，直接提交用户名和密码(Resource Owner Password Creditials)，服务器端验证身份后获得授权。由于Resource Owner Password Creditials是直接明文发送至服务器，服务器与客户端直接的连接必须是在HTTPS/TLS的保护下。

授权后将获得一个用作访问的access token，和一个用于更新access token的refresh token；访问需要授权的资源时，在报头里面加入\@Authorization: Bearer {access token}\@，access token过期失效时，则用refresh token获取新的access token，避免再次使用用户名和密码。


