const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const shell = electron.shell;

const path = require('path');
const url = require('url');
const os = require('os');


import {bufferToStream,streamToBuffer} from "./stream_utils.es6";
import PngQuant from "pngquant";

export default class MainApp{
  constructor(){
    this.mainWindow=null;
    app.on('ready', this.createWindow.bind(this));
    //app.on('ready',()=>{
    //  this.createWindow();
    //});

    app.on('window-all-closed', function () {
      //if (process.platform !== 'darwin') {
        app.quit();
      //}
    });
  }
  createWindow () {
    this.mainWindow = new BrowserWindow({width: 800, height: 600});
    this.mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }));
    
    this.mainWindow.webContents.on('new-window',function(event,url){
      event.preventDefault();
      shell.openExternal(url);
    });
    
    //this.mainWindow.webContents.openDevTools();

    //this.mainWindow.on('closed', function () {
    //  this.mainWindow = null;
    //});
    ipcMain.on("request compress",this.onCompressRequest.bind(this));
    
  }
  
  
  compress(originalFileBuffer){
    //https://www.npmjs.com/package/pngquant
    //http://derpturkey.com/buffer-to-stream-in-node/
    let myPngQuanter=new PngQuant([192, '--quality', '60-80', '--nofs', '-']);
    let sourceStream=bufferToStream(originalFileBuffer);
    let destinationStream=new require('stream').Duplex;
    return streamToBuffer(sourceStream.pipe(myPngQuanter));

  }
  
  onCompressRequest(event,bufferOriginal){
    
    this.compress(bufferOriginal).then((bufferResult)=>{
      if(!this.mainWindow){
        return;
      }
      this.mainWindow.webContents.send("report compress",bufferResult);
    }).catch((e)=>{
      this.mainWindow.webContents.send("error compress",e.stack);
    })

  }
  
}


