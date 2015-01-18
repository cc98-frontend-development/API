\h3{文档约定}

本文档用\link+[ML]{/ebony/ml.html}写成，从前端使用的角度出发，描述了API提供的方法、数据结构，并给出相应的后端实现上的约定。

文档中使用了一些样式、图表、代码约定如下：

\h4{基本样式}

正文部分采用这样的样式表示。

\emphasis{强调}表示应该引起注意。

\@代码\@内嵌于正文中。

而独立的代码块：

\code{begin}
使用这样的样式
\code{end}

\h4{数据结构}

本文档用各类方式描述数据结构。

\h5{SQL}
后端应该关注的数据库结构，使用SQL语言描述。约定使用SQL Server的SQL方言。其中，SQL关键字使用大写，而其他保留字使用小写，变量名则使用混合大小写（\@CamelCase\@）。

数据库结构按照遵守\link+[第四范式]{http://en.wikipedia.org/wiki/Fourth_normal_form}进行\link+[规范化]{http://en.wikipedia.org/wiki/Database_normalization}，不排除在特殊情况下使用更高的范式的可能。除非严重影响性能，否则不考虑使用更低的范式。

\h5{类Coffeescript}

前端关注的JSON数据结构，使用类似Coffee Script的方式描述，其中大写开头的符号（\@Post\@）表示一个数据类型，为英文单数形式。
小写字母与下划线组成的符号（\@snake_case\@）表示一个数据实例中的变量。通常对应到后端的变量名使用混合大小写，没有下划线的方式（\@CamelCase\@）。

类Coffee Script中包括三类基本类型：\@String\@表示字符串类型，对应于JSON中的\@"string"\@；
\@Numeric\@表示数值类型，对应与JSON中的\@123.0\@；
\@Boolean\@表示布尔量，对应于JSON中的\@true false\@。

类Coffee Script中描述的数据类型可能和后端SQL中的数据类型不符合，这是由于前端和后端对数据的不同处理方式决定的，后端\emphasis{必须}进行相应的数据转换。

注释中标注的\@computed\@表示该变量储存于其他资源中，在此资源中仅仅是计算后的显示，是只读变量。

\h5{JSON}

JSON用于表示数据结构的实例，其中涉及到URL的部分会使用URL模板，参见\link+[JSON]{#/basic_json.ml.js}。

\h5{ERD}

实体关系图（Entity Relasionship Diagram）反应了数据库表之间互相依赖的关系。

\@key\@表示变量名，

\@*key*\@表示用于标识这个资源的主要变量，对应于数据库的主键。

实线箭头表示数据间的强依赖关系，对应于数据库的外键，使用外键约束保证一致性。

虚线箭头表示数据间的弱依赖关系（比如说计算依赖关系），他们通过强的依赖关系相互关联，没有约束，只是通过储存的过程（和/或外部程序）维持一致性。
