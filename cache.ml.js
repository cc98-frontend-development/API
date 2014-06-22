\h3{HTTP缓存}

缓存的基本思想就是如果已经下载过的目标资源没有变，就可以用本地已经有的资源代替目标资源，从而加快资源呈现的速度，同时可以大大减少服务器和客户端的数据交换量。

HTTP/1.0并没有特别好的缓存机制（只有Expires），而在HTTP/1.1，缓存机制被改进了。本API使用HTTP/1.1的缓存机制，每一个回复都有清晰的缓存策略定义。API的实现\emphasis{应当}正确使用这个缓存机制。

\h4{缓存类型}

我们讨论的前端缓存主要有3类：

\h5{浏览器缓存}

浏览器缓存是最主要的缓存，也是最最有效的缓存，它储存在每个用户的磁盘（甚至内存）里。

\h5{代理服务器缓存}

代理服务器缓存是一类公共缓存，浏览器缓存可以减少同一资源被同一用户反复使用的代价，而代理服务器缓存则是减少多个用户短期访问同一资源的代价，大量数据交换发生浏览器和代理服务器间，而减少服务器和代理服务器的交换。

\h5{网关缓存}

网关缓存又叫反向代理缓存，和普通的代理服务器一样，也是公共缓存，但表现为主服务器的样子，用户不需要设置代理就可以使用它。但它的目的是通过减少服务器和代理服务器间的数据，使服务器能服务更多的用户，资源在代理服务器层面汇聚，消除重复，从而扩大服务器的服务能力。

\h4{缓存机制}


HTTP/1.0提供的Expires机制指定了一个时间点，在这个时间点之前再次访问这个资源，浏览器会假定没有变化，没有必要向服务器查询，而是直接从浏览器的缓存中返回。这种缓存机制不够精确，常常造成已经有更新却不能访问到的情况（特别是服务器端错误设置了缓存时间的时候）。本API不采用这种缓存机制。

HTTP/1.1的Cache-control提供了非常丰富的缓存机制。

\list*{

\* 公开性：由于API指定的数据交换基本都在HTTPS+HTTP认证下完成，默认情况下缓存均为私有缓存（浏览器缓存），而公共缓存（代理服务器缓存），需要\@public\@标注。

\* 寿命：私有缓存寿命由\@max-age={seconds}\@控制；公共缓存寿命由\@s-maxage={seconds}\@控制。

\* 验证：在缓存还没过期前，用户重新提交的请求，可以指定\@must-revalidate\@进行验证，正确的验证需要validator。

\* validator：有两种validator\@ETag\@和\@Last-Modified\@，前者使用的是计算出来的digest，后者则是用时间戳。当用\@ETag\@时，再次访问资源时加入\@If-None-Match\@可比较前后的ETag，如果相同认为严重成功，缓存命中，服务器返回状态码\@304 Not Modified\@。同理，如果使用\@Last-Modified\@，再次访问时用\@If-Modified-Since\@进行验证。

\* \@no-cache\@，\@no-store\@：分别提示浏览不要缓存和不要储存，用于标识一过性的数据。
}

\h4{举例}

首次访问返回:
\code+[http]{begin}

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8; api_version=1.0
Content-Lenght: XXX
Cache-control: max-age=3600, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

data....

\code+{end}

再次访问返回:
\code+[http]{begin}

HTTP/1.1 304 Not Modified
Content-Type: application/json; charset=utf-8; api_version=1.0
Cache-control: max-age=3600, must-revalidate
Last-Modified: Mon, 06 May 2013 06:12:57 GMT

\code+{end}
而没有数据返回。

\hline
\link+{https://www.mnot.net/cache_docs/}
