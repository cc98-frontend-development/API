\h2{简介}

\h3{API}
API提供了一个数据接口，为网页客户端和服务器端通讯的协议，可以更好的分离网站的客户端和服务器端，也允许存在非网页形式的客户端。API可以让服务器端专注与业务、数据存取和缓存，让客户端更加专注数据呈现和交互。

新版cc98，采用基于JSON的RESTful协议作为API，只要支持HTTP协议，可以解析JSON的客户端均可以使用API访问服务器。

\h3{基本API和复合API}

基本API为后端提供的任意资源的直接访问接口，比如某帖子的一个回复，常常意味着数据库表的一个或几个记录。由于基本API访问的资源变化比较少，缓存潜力大，推荐优先使用基本API。

复合API为多个基本API的组合，如板块中的讨论列表，或者一个讨论里的一个分页，它对应了数据库表的多条记录或者多个表中的数据的汇总。复合API的数据变化较频繁，缓存潜力小，常常用于向前端提供汇总信息。设计的这些复合API，可以简少前端对资源访问的请求数，简化前端使用，但同时会复杂化后端的逻辑：前端不做缓存了，后端需要对复合API相对应的基本API数据进行缓存，避免频繁读写数据库，也应该对组合后的数据进行缓存，帮助多用户访问。

\h3{REST}

REST（REpresentational State Transfer）是一类基于HTTP的数据访问协议，它可以充分利用HTTP提供的机制交换数据，简化了前端和后端的设计。

主要特点如下：

\list*{
    \* URIs定位资源：服务器的资源通过一致的URI进行访问，资源是一个名词。比如\@http://server/resources/{id}\@。
    \* 显式使用HTTP methods： 除了常用的HTTP methods\@GET\@获取资源、\@POST\@新建资源外，REST还使用\@PUT\@修改资源、\@DELETE\@删除资源。\newline
    \* 获得的是资源：以往的协议中HTTP请求服务器返回的是渲染后的HTTP页面，而REST仅仅返回代表资源的JSON或者XML。
    \* 无状态：服务器端不储存客户端资源，连接状态相关的信息是显式地表现在请求和回复中的，请求和回复已经代表了资源本身和所有需要的相关状态；如果需要储存，也仅仅储存在客户端中（比如cookie）。
    \* 超媒体为应用状态的引擎（hypermedia as the engine of application state, a.k.a HATEOAS）：应用状态转移完全显式地表现在请求和回复中，不需要服务器参与状态的转移；客户端不假定服务器提供了任何服务，从一个入口可以通过解读超媒体形式的回复访问到所有相关的资源。
}
        
比如说:

过去使用

\code{begin}
GET /adduser?name=Robert HTTP/1.1

\code{end}

\mark{现在使用}

\code{begin}
POST /users HTTP/1.1
Host: myserver
Content-Type: application/json
{ "user":{ "name": "Robert" }
}

\code{end}

过去使用

\code{begin}
GET /updateuser?name=Robert&newname=Bob HTTP/1.1

\code{end}

\mark{现在使用}

\code{begin}
PUT /users/Robert HTTP/1.1
Host: myserver
Content-Type: application/json
{ "user": { "name": "Bob" }
}

\code{end}


