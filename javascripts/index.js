var ko = require('knockout');
var $ = require('jquery');
var jsml = require('jsml-jquery');
var hljs = require('highlight.js');
var grammar = require('grammar');

var nav = [
    { link_text: "简介", link_file:"intro.ml.js", child:false},
    { link_text: "基本协议", link_file:"protocol.ml.js", child:[
        { link_text: "HTTP缓存", link_file:"cache.ml.js"},
        { link_text: "HTTP请求", link_file:"request.ml.js"},
        { link_text: "HTTP回复", link_file:"respond.ml.js"}]
    },
    { link_text: "资源", link_file:"resources.ml.js",
        child:[{link_text: "resources/boards", link_file:"resources_boards.ml.js"}]
    }
]

function buildErrorMessage(e){
    return e.line !== undefined && e.column !== undefined
        ? "Line " + e.line + ", column " + e.column + ": " + e.message
        : e.message;
}

function get_file(url){
    var string = $.ajax({url: url,async: false, cache: false, dataType: "text"
    }).responseText;
    return string;
}

function index_model( nav ) {
    var self = this;
    self.nav_head = nav;
    self.section = ko.observable("");
    self.message = ko.observable("");
    self.update_main_view = function(line){
        var t = get_file(line["link_file"]);
        try{
            self.message("");
            var parsed = grammar.parse(t);
            var html = $(document.createElement("div")).jsml(parsed).html();
            self.section(html);
        }catch(e)
        {
            self.message(buildErrorMessage(e));
        }
    }

    //default page
    self.update_main_view(nav[0]);
}

ko.applyBindings(new index_model(nav));
