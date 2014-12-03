\h2{简介}

\h3{API}
API提供了一个数据接口，为网页客户端和服务器端通讯的协议，可以更好的分离网站的客户端和服务器端，也允许存在非网页形式的客户端。API可以让服务器端专注于业务、数据存取和缓存，让客户端更加专注数据呈现和交互。

新版cc98，采用基于JSON的RESTful协议作为API，只要支持HTTP协议，可以解析JSON的客户端均可以使用API访问服务器。

\h3{论坛架构}

\fig{begin}

\img{pages/graph/architecture.png}

如图所示，用户可以通过多种客户端访问。客户端向服务器请求两类数据：一类是Web数据，包括网页模板、样式表、网页程序的代码（Javascript）、图片等多媒体数据；另外一类数据是关于论坛的内容的，用API的方式访问（JSON格式），在客户端中完成对用户界面的数据填充。后端的Web服务器负责提供固定入口和静态内容，而API服务器负责提供动态数据。

\fig{end}
API服务器大致可以分为4个部分：

\list*{
	\* 路由层：负责解析API请求，并绑定到相应的应用层和数据层
	\* 应用层：负责执行API请求，调用相应的后端业务接口，会话管理
	\* 业务层：负责实现业务规则，提供业务接口
	\* 数据层：负责缓存API返回数据、应用层会话数据，封装数据库接口
}
前两层规则相对简单，可用IO优势的轻量级的技术（比如node.js、Python）实现；后两层规则复杂，需要整合能力强的重量级技术（比如Java、C#/.net）。

\h3{基本API和复合API}

基本API为后端提供的任意资源的直接访问接口，比如某帖子的一个回复，常常意味着数据库表的一个或几个记录。由于基本API访问的资源变化比较少，缓存潜力大，推荐优先使用基本API。

复合API为多个基本API的组合，如板块中的讨论列表，或者一个讨论里的一个分页，它对应了数据库表的多条记录或者多个表中的数据的汇总。复合API的数据变化较频繁，缓存潜力小，常常用于向前端提供汇总信息。设计的这些复合API，可以减少前端对资源访问的请求数，简化前端使用，但同时会复杂化后端的逻辑：前端不做缓存了，后端需要对复合API相对应的基本API数据进行缓存，避免频繁读写数据库，也应该对组合后的数据进行缓存，帮助多用户访问。

\h3{REST}

REST（REpresentational State Transfer）是一类基于HTTP的数据访问协议，它可以充分利用HTTP提供的机制交换数据，简化了前端和后端的设计。REST的最初定义：\link+[Architectural Styles and the Design of Network-based Software Architectures]{http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm}

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

\code+[http]{begin}
GET /adduser?name=Robert HTTP/1.1

\code+{end}

\mark{现在使用}

\code+[http]{begin}
POST /users HTTP/1.1
Host: myserver
Content-Type: application/json
\code+{end}

\code+[json]{begin}
{ "user":{ "name": "Robert" }
}

\code+{end}

过去使用

\code+[http]{begin}
GET /updateuser?name=Robert&newname=Bob HTTP/1.1

\code+{end}

\mark{现在使用}

\code+[http]{begin}
PUT /users/Robert HTTP/1.1
Host: myserver
Content-Type: application/json
\code+{end}

\code+[json]{begin}
{ "user": { "name": "Bob" }
}

\code+{end}

\h4{REST的核心概念：资源}

任意可以被命名的信息都被视为是资源：文档或图片，服务，其他资源的集合…

\bq{begin}
A resource is a conceptual mapping to a set of entities, not the entity that corresponds to the mapping at any particular point in time.

\bq{end}

这一概念的映射（资源）可以指向一个空集，或者多个资源指向同一个实体，比如说：“最新版”，“版本号：1.2.7”，可以指向同一个实体，但确实两个不同的资源，他们仅仅是因为在特定的时间上的表现为同一个实体。

区别资源的是语义上的概念，这个是不变的，而他们所指向的实体却可是随时间变化。

\h4{REST的核心概念：表现}

REST通过“表现”去表达资源的现在状态或者期望状态，通过在不同组件间传递“表现”去操作资源。

\bq{begin}
A representation is a sequence of bytes, plus representation metadata to describe those bytes.

\bq{end}

表现由数据（data）和描述数据的元数据（metadata）组成，有时还有描述元数据的元数据。元数据又可以进一部分为表现元数据（描述表现，如媒体类型），资源元数据（描述资源，如来源）。而控制数据则是用于描述如何操作表现的。
