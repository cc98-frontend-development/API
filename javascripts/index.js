var $ = require('jquery');
var ML = require('ML');
var ko = require('knockout');
require('Sammy');

var nav = [
    { link_text: "简介", link_file:"intro.ml.js", child:false},
    { link_text: "文档约定", link_file:"convention.ml.js", child:false},
    { link_text: "基本协议", link_file:"protocol.ml.js", 
        child:[
        { link_text: "HTTP缓存", link_file:"basic_cache.ml.js"},
        { link_text: "请求和回复", link_file:"basic_request_and_respond.ml.js"},
        { link_text: "JSON", link_file:"basic_json.ml.js"},
        { link_text: "限速", link_file:"basic_ratelimit.ml.js"}]
    },
    { link_text: "资源", link_file:"resources.ml.js",
        child:[
        {link_text: "/resources/posts", link_file:"resources_posts.ml.js"},
        {link_text: "/resources/threads", link_file:"resources_threads.ml.js"},
        {link_text: "/resources/boards", link_file:"resources_boards.ml.js"}
        ]
    },
    { link_text: "统计", link_file:"statistics.ml.js",
        child:[
        {link_text: "关联表", link_file:"statistics_xtabs.ml.js"}
        ]
    },
    { link_text: "授权", link_file:"auth.ml.js",
        child:[
        {link_text: "access token", link_file:"auth_access.ml.js"},
        {link_text: "refresh token", link_file:"auth_refresh.ml.js"}]
    },
    { link_text: "权限", link_file:"permission.ml.js",
        child:[
        {link_text: "oplist规则", link_file:"permission_oplist.ml.js"},
        {link_text: "resources/oplists/posts", link_file:"resources_oplists_posts.ml.js"},
        {link_text: "resources/oplists/threads", link_file:"resources_oplists_threads.ml.js"}
//        {link_text: "resources/oplists/boards", link_file:"resources_oplists_boards.ml.js"}
        ]
    }
]

function index_model( nav ) {
    var self = this;
    self.nav_head = nav;
    self.update_main_view = function(line){
        location.hash = "#/"+line["link_file"] ;
    }

    Sammy(function(){
        this.get('#/:link_file', function(){
            var file = "pages/" + this.params['link_file'];
            ML.render_file(file, $("#section"), $("#message"));
        });
        //default page
        this.get('', function() { this.app.runRoute('get', "#/intro.ml.js") });
    }).run();
}

ko.applyBindings(new index_model(nav));
