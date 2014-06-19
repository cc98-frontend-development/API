var $ = require('jquery');
var ML = require('ML');
var ko = require('knockout');
require('Sammy');

var nav = [
    { link_text: "简介", link_file:"intro.ml.js", child:false},
    { link_text: "基本协议", link_file:"protocol.ml.js", 
        child:[
        { link_text: "HTTP缓存", link_file:"cache.ml.js"},
        { link_text: "HTTP请求", link_file:"request.ml.js"},
        { link_text: "HTTP回复", link_file:"respond.ml.js"}]
    },
    { link_text: "资源", link_file:"resources.ml.js",
        child:[{link_text: "resources/boards", link_file:"resources_boards.ml.js"}]
    },
    { link_text: "授权", link_file:"auth.ml.js",
        child:[
        {link_text: "access token", link_file:"auth_access.ml.js"},
        {link_text: "refresh token", link_file:"auth_refresh.ml.js"}]
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
            var file = this.params['link_file'];
            ML.render_file(file, $("#section"), $("#message"));
        });
        //default page
        this.get('', function() { this.app.runRoute('get', "#/intro.ml.js") });
    }).run();
}

ko.applyBindings(new index_model(nav));
