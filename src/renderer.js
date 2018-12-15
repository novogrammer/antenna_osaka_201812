require("babel-register")();
const RenderApp=require("./RenderApp.es6").default;
global.$=global.jQuery=require('jquery');
$(window).on("load",()=>{
  $(function(){
    window.renderApp=new RenderApp();
  });
})
