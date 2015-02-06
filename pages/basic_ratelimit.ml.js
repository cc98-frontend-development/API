\h3{限速}

\h4{简介}
限速机制用于防止API被不友好的客户端滥用而消耗大量服务器资源，所有本API的回复均带有一下限速报头：
\list*{
	\* \@X-RateLimit-Base\@，每小时允许的基本请求次数
	\* \@X-RateLimit-Burst\@，每小时允许的额外请求次数
	\* \@X-RateLimit-Count\@，当前时间窗内已经计算的请求数
	\* \@X-RateLimit-Refresh\@，限速时间窗更新的时间点，用\link+[UTC epoch seconds]{http://en.wikipedia.org/wiki/Unix_time}
}

Epoch seconds很容易变成常用的日期格式，如Javascript中：
\code{begin}
> new Date(1372700873 * 1000)
< Tue Jul 02 2013 01:47:53 GMT+0800 (CST)
\code{end}

\h4{限速规则}
\list*{
	\* 限速对象为UserIdxIP，同IP不同用户，或不同IP同一用户分别计算限速计数。游客的UserId相同，按不同IP计算限速
	\* 每次对API的请求均会使得回复报头的\@X-RateLimit-Count\@增加1
	\* 如果\@X-RateLimit-Count\@小于\@X-RateLimit-Base + X-RateLimit-Burst\@，则执行请求，按正常的流程返回；而如果大于等于，则返回\@429 Too Many Request\@，请求不再执行
	\* 当前时刻大于\@X-RateLimit-Refresh\@表示的时刻，则\@X-RateLimit-Count = max( X-RateLimit-Count - X-RateLimit-Base, 0)\@，同时更新\@X-RateLimit-Refresh\@
}

每个限速时间窗（1小时）内，用户平均可以访问API\@X-RateLimit-Base\@次。单个时间窗内，还允许额外访问\@X-RateLimit-Burst\@次，额外访问的计数则推迟到下个时间窗。

\h4{限速配额}
\table{begin}
\r{
	\h 登录状态
	\h 大部分API
	\h 搜索相关API
}
\r{
	\d 未授权（游客）
	\d \@X-RateLimit-Base\@: 180 \newline \@X-RateLimit-Burst\@: 90
	\d \@X-RateLimit-Base\@: 4 \newline \@X-RateLimit-Burst\@: 1
}
\r{
	\d 已授权
	\d \@X-RateLimit-Base\@: 1800 \newline \@X-RateLimit-Burst\@: 450
	\d \@X-RateLimit-Base\@: 20 \newline \@X-RateLimit-Burst\@: 5
}
\table{end}

\h4{数据库Schema}
\code+[sql]{begin}

CREATE TABLE RateLimit(
	UserId   int not NULL,
	Ip       nvarchar(64) NOT NULL,
	Base     int not NULL,
	Burst    int not NULL,
	Count    int not NULL,
	Refresh  datetime not NULL,

	INDEX IDX_Count (Count),

    CONSTRAINT PK_RateLimit PRIMARY KEY CLUSTERED (UserId, Ip),
	CONSTRAINT FK_UserId FOREIGN KEY (UserId)
		REFERENCES Users (UserId)
		ON UPDATE CASCADE
		ON DELETE CASCADE
);

\code+{end}
