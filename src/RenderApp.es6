const electron=require('electron');
const ipcRenderer=electron.ipcRenderer;
const {dialog} = electron.remote;

const $=require('jquery');

import DataURI from "datauri";

import fs from "fs";

export default class RenderApp{
  constructor(){
    this._originalBuffer=null;
    this._compressedBuffer=null;
    this.filename="";
    this.$imageArea=$(".imageArea");
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
      this.filename=file.name;
      this.fileToBuffer(file).then((buffer)=>{
        this.requestCompress(buffer);
        this.originalBuffer=buffer;
      });
      break;
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
  toDataUri(buffer){
    let datauri=new DataURI();
    datauri.format(".png",buffer);
    return datauri.content;
  }
  saveImage(filename,buffer){
    dialog.showSaveDialog({
      title:"pngを保存する",
      defaultPath:filename,
    },(filename,bookmark)=>{
      console.log(filename);
      fs.writeFile(filename,buffer,(error,bytesWritten,buffer)=>{
        if(error && error.stack){
          dialog.showErrorBox("saveImage",error.stack);
        }
      })
    });
  }
  get originalBuffer(){
    return this._originalBuffer;
  }
  set originalBuffer(originalBuffer){
    this._originalBuffer=originalBuffer;
    this.$imageArea.find(".original").remove();
    if(originalBuffer){
      let $img=$("<img>").attr("src",this.toDataUri(originalBuffer)).addClass("original");
      this.$imageArea.append($img);
    }
  }
  get compressedBuffer(){
    return this._compressedBuffer;
  }
  set compressedBuffer(compressedBuffer){
    this._compressedBuffer=compressedBuffer;
    this.$imageArea.find(".compressed").remove();
    if(compressedBuffer){
      let $img=$("<img>").attr("src",this.toDataUri(compressedBuffer)).addClass("compressed");
      $img.on("click",()=>{
        this.saveImage(this.filename,compressedBuffer);
      })
      this.$imageArea.append($img);
    }
  }
  onReportCompress(event,buffer){
    console.log("onReportCompress",buffer);
    this.compressedBuffer=buffer;
  }
  onErrorCompress(event,error){
    console.log("onErrorCompress",error);
    this.compressedBuffer=null;
    dialog.showErrorBox("onErrorCompress",error);
  }
}
