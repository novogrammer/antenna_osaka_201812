const electron=require('electron');
const ipcRenderer=electron.ipcRenderer;
const {dialog} = electron.remote;

const $=require('jquery');

import DataURI from "datauri";

export default class RenderApp{
  constructor(){
    this.setupEvents();
  }
  setupEvents(){
    $(".dropArea").on("dragover",(e)=>{
      e.preventDefault();
    })
    $(".dropArea").on("drop",this.onDrop.bind(this));
    
    ipcRenderer.on("report compress",this.onReportCompress.bind(this));
    ipcRenderer.on("error compress",this.onErrorCompress.bind(this));
  }
  onDrop(e){
    let {originalEvent}=e;
    let files=originalEvent.dataTransfer.files;
    for(let file of files){
      console.log(file);
      this.fileToBuffer(file).then((buffer)=>{
        this.requestCompress(buffer);
        let datauri=new DataURI();
        datauri.format(".png",buffer);
        let $img=$("<img>").attr("src",datauri.content);
        $("body").append($img);
      });
    }
    e.stopPropagation();
    e.preventDefault();
  }
  fileToBuffer(file){
    return new Promise((resolve,reject)=>{
      let reader=new FileReader();
      reader.onload=(e)=>{
        let buffer=Buffer.from(e.target.result);
        resolve(buffer);
      };
      reader.readAsArrayBuffer(file);
    });
  }
  requestCompress(buffer){
    ipcRenderer.send("request compress",buffer)
  }
  onReportCompress(event,buffer){
    console.log("onReportCompress",buffer);
    let datauri=new DataURI();
    datauri.format(".png",buffer);
    let $img=$("<img>").attr("src",datauri.content);
    $("body").append($img);
  }
}
