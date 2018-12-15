const electron=require('electron');
const ipcRenderer=electron.ipcRenderer;

const $=require('jquery');


export default class RenderApp{
  constructor(){
    this.setupEvents();
  }
  setupEvents(){
    /*
    document.ondragover = document.ondrop = function (e) {
      e.preventDefault()
    }
    */
    $(".dropArea").on("dragover",(e)=>{
      e.preventDefault();
    })
    $(".dropArea").on("drop",this.onDrop.bind(this));
    
    ipcRenderer.on("report compress",this.onReportCompress.bind(this));
  }
  onDrop(e){
    let {originalEvent}=e;
    let files=originalEvent.dataTransfer.files;
    for(let file of files){
      console.log(file);
      this.requestCompress(file);
    }
    e.stopPropagation();
    e.preventDefault();
  }
  requestCompress(file){
    let reader=new FileReader();
    reader.onload=(e)=>{
      let buffer=Buffer.from(e.target.result);
      ipcRenderer.send("request compress",buffer)
    };
    reader.readAsArrayBuffer(file);
    
  }
  onReportCompress(event,buffer){
    console.log(buffer);
  }
}
