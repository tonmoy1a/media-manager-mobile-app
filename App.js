import React, { useState } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Dialog from "react-native-dialog";
import Video from 'react-native-video';
import folderIcon from './assets/folder_Icon.png';
import axios from 'axios';

const win = Dimensions.get('window');

const App: () => Node = () => {

  const [urlPrefix, setUrlPrefix] = useState('http://192.168.0.106:3000');
  const [fileData, setFileData] = useState({dir:[], files:[]});
  const [videoUrl, setVideoUrl] = useState('');
  const [currentPathArray, setCurrentPathArray] = React.useState([])
  const [currentFolder, setCurrentFolder] = React.useState('')
  const [selectedFile, setSelectedFile] = React.useState("")
  const [currentPath, setCurrentPath] = React.useState('/')
  const [visiable, setVisiable] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [fullscreen, setFullscreen] = React.useState(false)
  const [windowDiamention, setWindowDiamention] = React.useState({width:win.width, height:win.width/2})

  Dimensions.addEventListener('change', (e)=>{
    const {width, height} = e.window

    setWindowDiamention({width, height});
  })

  const pressUrlSubmit = async() => {

    const data = await fetch(`${urlPrefix}/api/`)

    const jsonData = await data.json();

    let ddd = []

    ddd = ddd.concat(jsonData.dir).concat(jsonData.files)

    setFileData(ddd)
  }

  const folderSelectHandle = (folderName) => {
    currentPathArray.push(folderName)
    setCurrentPathArray(currentPathArray)
    setCurrentPath((prev) => prev + '/'+folderName)
    setCurrentFolder(folderName)
    
    fetch(`${urlPrefix}/api/get-file/`+encodeURIComponent(currentPathArray.join('/')))
          .then((res) => res.json())
          .then(res => {
            let ddd = []

            ddd = ddd
              .concat(['Back'])
              .concat(res.dir)
              .concat(res.files)
              

            setFileData(ddd)

          });
  }

  const folderBack = () => {
    let current_path_split = currentPath.split('/')
    let current_f = current_path_split[current_path_split.length-1];
    if(current_f===""){
      current_f = current_path_split[current_path_split.length-2];
    }

    currentPathArray.pop();
    setCurrentPathArray(currentPathArray);
    console.log(currentPathArray.join('/'))
    let aaa = currentPath.replace(current_f, '');
    let bbb;
    if(currentPathArray.length==0){
      bbb = '/'
    }else{
      bbb = currentPathArray.join('/')
    }
    fetch(`${urlPrefix}/api/get-file/`+encodeURIComponent(bbb))
          .then((res) => res.json())
          .then(res => {
            let ddd = []

            ddd = ddd
              .concat(['Back'])
              .concat(res.dir)
              .concat(res.files)
              

            setFileData(ddd)
          });

    setCurrentPath(aaa)

  }

  const fileSelectHandle = (fileName) => {
    setWindowDiamention({width:win.width, height:win.height})
    setVideoUrl(currentPathArray.join('/')+'/'+fileName)
  }

  const getFileStreem = (fileName,  fileType) => {
    if(fileType){
      fileType = fileType.split('/')[0];

      if(fileType==='video'){
        return getFileThumb(fileName)
      }else if(fileType==='image'){
        return `${urlPrefix}/api/file-stream/${encodeURIComponent(currentPathArray.join('/')+'/'+fileName)}`
      }
    }

    return 'no';
  }

  const getFileThumb = (fileName) => {
    if(currentPathArray.join('/')==""){
      return `${urlPrefix}/api/file-thumbnail/`+encodeURIComponent('/')+'/'+fileName
    }else{
      return `${urlPrefix}/api/file-thumbnail/`+encodeURIComponent(currentPathArray.join('/'))+'/'+fileName
    }
    
  }

  const uploadFiles = async() => {
    try {
      const [res] = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles]
      })

      let fileData = {
        uri: res.uri,
        name: res.name,
        type: res.type,
      }

      const data = new FormData();
      data.append("file", fileData);
      data.append("name", res.name);
      data.append("type", res.type);

      axios.post(`${urlPrefix}/api/file-upload/${encodeURIComponent(currentPathArray.join('/')) !=='' ? encodeURIComponent(currentPathArray.join('/')) : encodeURIComponent('/')}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // await fetch(`${urlPrefix}/api/file-upload/${encodeURIComponent(currentPathArray.join('/')) !=='' ? encodeURIComponent(currentPathArray.join('/')) : encodeURIComponent('/')}`, {
      //   method: "POST",
      //   body: data,
      // });

      alert('uploaded')

    } catch (error) {
      alert('upload falied')
      console.log(error)
    }
  }

  const createFolder = async() => {
    console.log(encodeURIComponent(currentPathArray.join('/')));
    
    await fetch(`${urlPrefix}/api/create-folder/${encodeURIComponent(currentPathArray.join('/')) !=='' ? encodeURIComponent(currentPathArray.join('/')) : encodeURIComponent('/')}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({folderName})
    });

    setVisiable(false)
  }

  const listended = (e) => {
    console.log(e)
  }

  return (
    <SafeAreaView>
      <View>
        <Dialog.Container visible={visiable}>
          <Dialog.Title>Create Folder</Dialog.Title>
          <Dialog.Input onChangeText={(v) => setFolderName(v)} placeholder='Folder Name'/>
          <Dialog.Button label="Cancel" onPress={() => setVisiable(false)}/>
          <Dialog.Button label="Create" onPress={createFolder}/>
        </Dialog.Container>
        <View style={{flexDirection:'row', flexWrap:'wrap'}}>
          <TextInput
            onChangeText={(v) => {setUrlPrefix(v)}}
            value={urlPrefix}
            style={{width:'80%'}}
          />
          <Button
            onPress={pressUrlSubmit}
            title="Set Url"
            color="#841584"
            style={{width:'20%'}}
          />
        </View>

        <View style={{flexDirection:'row', flexWrap:'wrap'}}>
          <Button
            onPress={uploadFiles}
            title="Upload"
            color="#841584"
          />
          <Button
            onPress={() => setVisiable(true)}
            title="New Folder"
            color="#841584"
          />
          
        </View>
        
        
        
        {videoUrl!=='' &&
        <View style={{
          elevation: fullscreen ? 5 : 0,
          position: fullscreen ? 'absolute' : 'relative',
        }}>
        <Video source={{uri: `${urlPrefix}/api/file-stream/${encodeURIComponent(videoUrl)}`}}   // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref
          }}                                      // Store reference
          style={{
            width:windowDiamention.width,
            height:250,
            backgroundColor:'black'
          }} 
          resizeMode="contain"
          controls={true}
          onError={(e) => {console.log(e)}}
          fullscreen={fullscreen}
        />
        <Button
            onPress={() => setFullscreen(fullscreen ? false : true)}
            title="Full Screen"
            color="#841584"
          />
        <Text style={{fontWeight:'bold'}}>{videoUrl}</Text>
        </View>
        }
        
      </View>
      {/* <ScrollView contentInsetAdjustmentBehavior="automatic"> */}
          

          <FlatList
            data={fileData}
            numColumns={2}
            renderItem={({item}) => 
              <View style={{ width:'50%', padding:5 }}>
                {item.fileName ? 
                <TouchableOpacity onPress={() => {fileSelectHandle(item.fileName)}}>
                  <Text>{}</Text>
                  <Image source = {{uri: getFileStreem(item.fileName, item.fileType?.mime)}}
                    style = {{ height: 120 }}
                  />
                  <Text>{item.fileName}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity onPress={() => item==='Back' ? folderBack() : folderSelectHandle(item)}>
                  <Image source = {folderIcon}
                    style = {{ width:160, height: 120 }}
                  />
                  <Text>{item}</Text>
                </TouchableOpacity>
                }
              
              </View>
            }
            onEndReached={listended}
          />
        <View style={{flex:1, flexDirection:'row', flexWrap:'wrap'}}>
          
        {/* {fileData.files.map((val, key) => (
          <>
          { (key < 200) && 
            <View key={key} style={{ width:'50%', padding:5 }}>
            <TouchableOpacity onPress={() => {setVideoUrl(val.fileName)}}>
                <Image source = {{uri:`${urlPrefix}/api/file-thumbnail/%2F/${val.fileName}`}}
                  style = {{ height: 120 }}
                />
                <Text>{val.fileName}</Text>
            </TouchableOpacity>
            </View>
          }
          </>
          
        ))} */}
        </View>
        
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
});

export default App;
