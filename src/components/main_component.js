import React, {Component} from 'react';
import './main_component.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Modal from 'react-awesome-modal';
import user from '../images/user.png';
import firebase from '@firebase/app';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'
import loading from "../images/loading.gif"

const theme = createMuiTheme({
    palette: {
      primary: green,
      secondary: red
    },
});

class Main extends Component{
    constructor(props){
      super(props);
      
      this.firebaseO = this.props.Firebase;
      this.firebase = this.firebaseO.fb;
      this.state = {
        user_id : "",
        user_pw : "",
        up_modal : false,
        sign_up_id : "",
        sign_up_pw : "",
        sign_up_name : "",
        sign_up_school : "",
        sign_up_dept : "",
        selectedFile: '',
        imgPreviewUrl: '',
        user_img_url: '',
        synch:false,
        onProgress : false,
      }
      
      this.handleChange = this.handleChange.bind(this);
      this.openUp = this.openUp.bind(this);
      this.closeUp = this.closeUp.bind(this);
      //this.onSubmit - this.onSubmit.bind(this);
    }


    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
      };

    handleSignup = e =>{
        let that = this;

        if(that.state.sign_up_id === ""){
            alert("invaild id!");
            return;
        }
        if(that.state.sign_up_pw === ""){
            alert("invaild pw!");
            return;
        }
        if(that.state.sign_up_name === ""){
            alert("invaild name!");
            return;
        }
        if(that.state.sign_up_school === ""){
            alert("invaild school!");
            return;
        }
        if(that.state.sign_up_dept === ""){
            alert("invaild dept!");
            return;
        }

        this.setState({
            onProgress : true
        })

        if(that.state.selectedFile === ""){
            that.firebaseO.createUser(that.state.sign_up_id,
                that.state.sign_up_pw,
                that.state.sign_up_name,
                that.state.sign_up_school,
                that.state.sign_up_dept,
                "");
        }

        const file = that.state.selectedFile;

        const storage = that.firebaseO.fb.storage();
        const storageRef = storage.ref();
        const imgRef = storageRef.child('images/' + file.name);

        const metadata = {
            contentType: 'image/jpeg'
        }

        const uploadTask = imgRef.put(file , metadata)

        new Promise(function(resolve, reject) {
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                function(snapshot) {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED:
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING:
                            console.log('Upload is running');
                            break;
                        default:
                    }
                }, function(error) {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            break;
                        case 'storage/canceled':
                            break;
                        case 'storage/unknown':
                            break;
                        default:
                    }
                }, function() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        new Promise(function(resolve, reject) {
                            that.setState({
                                user_img_url : downloadURL,
                                synch: true
                            })
                            console.log('File available at ', downloadURL)
                            resolve()
                        }).then(function() {
                            console.log('last');
                            if (that.state.synch) {
                                that.firebaseO.createUser(that.state.sign_up_id,
                                    that.state.sign_up_pw,
                                    that.state.sign_up_name,
                                    that.state.sign_up_school,
                                    that.state.sign_up_dept,
                                    that.state.user_img_url);
                            }
                        })
                    })
                })
            if (that.state.sign_up_id === "" ||
                that.state.sign_up_dept === "" ||
                that.state.sign_up_pw === "" ||
                that.state.sign_up_name === "" ||
                that.state.sign_up_school === ""){
                uploadTask.cancel();
            }
            resolve()
        })
    };

    openUp(){
        this.setState({
            up_modal : true
        })
    };

    closeUp(){
        this.setState({
            up_modal : false,
            sign_up_id : "",
            sign_up_dept : "",
            sign_up_pw : "",
            sign_up_name : "",
            sign_up_school : ""
        })
    };

    onSubmit = e =>{
        this.setState({
            onProgress : true
        })
        this.firebaseO.signIn(this.state.user_id,this.state.user_pw);
    }

    signUpKeyPress(event) {
        var code = event.keyCode || event.which;
        if (code === 13) {
            this.handleSignup()
        }
    }

    signInKeyPress(event) {
        var code = event.keyCode || event.which;
        if (code === 13) {
            this.onSubmit()
        }
    }
    
    fileSelectedHandler = e => {
        //e.preventDefault();

        let that = this;
        let reader = new FileReader();
        let file = e.target.files[0];
        
        if (file !== null) {
            reader.onloadend = () => {
                that.setState({
                    selectedFile: file,
                    imgPreviewUrl: reader.result
                });
            }
            reader.readAsDataURL(file)
        }

    }
  
    componentDidMount(){
        return;
    }
  
  
    render(){
      let picture_instruction = "Click icon to\nadd profile image";
      this.firebaseO.signOut();

      let {imgPreviewUrl} = this.state;
      let $imgPreview = null;
      if (imgPreviewUrl) {
        $imgPreview = (<img src={imgPreviewUrl} style={{borderRadius: "50%"}} alt=""/>);
      } else {
        $imgPreview = (<img src={user} alt="user"/>);
      }
      return (
        <body>
            <div className="App">
                <div className = "box1">
                    <div className = "main-logo"> TATA BOX </div>
                    <div className = "main-explanation">The best helper of TA</div>
                </div>
                <div className = "box2">
                    <h1 style={{marginTop: "20%"}}>Welcome.</h1>
                    <form onSubmit={this.onSubmit} autoComplete="false">
                        <div align="left" style={{marginTop:"20%",marginLeft:"15%",fontWeight:"bold",color:"#808080"}}>
                            <label>
                                Email
                            </label>
                        </div>
                        <br/>
                        <div>
                            <TextField
                            id="user_id"
                            value={this.state.user_id}
                            onChange={this.handleChange("user_id")}
                            onKeyPress={this.signInKeyPress.bind(this)}
                            margin="normal"
                            style={{width:"70%"}}
                            />
                        </div>
                        <br/>
                        <br/>
                        <div align="left" style={{marginLeft:"15%",fontWeight:"bold",color:"#808080"}}>
                            <label>
                                Password
                            </label>
                        </div>
                        <br/>
                        <TextField
                        id="user_pw"
                        value={this.state.user_pw}
                        type="password"
                        onChange={this.handleChange("user_pw")}
                        onKeyPress={this.signInKeyPress.bind(this)}
                        margin="normal"
                        style={{width:"70%"}}
                        />
                        <br/>
                        <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center"}}>
                            <Button variant="contained" onClick={this.openUp} style={{
                                marginTop:"10%",width:"28%", borderRadius: 10,
                                border: "2px solid #4C9900",
                                background: 'none',
                                padding: "18px 18px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "#4C9900"}}>
                                Sign Up
                            </Button>

                            <Button variant="contained" color="primary" onClick={this.onSubmit} style={{
                                marginTop:"10%",width:"28%",borderRadius: 10,
                                border: "2px solid #4C9900",
                                backgroundColor: "#4C9900",
                                padding: "18px 18px",
                                fontWeight: "bold",
                                fontSize: "20px"}}>
                                Log In
                            </Button>
                        </div>
                    </form>
                    <Modal className = "signup-modal" visible={this.state.up_modal} width="600" height="600" effect="fadeInUp" onClickAway={()=> this.closeUp()}>
                        <div className = "title-box" align="center" style={{fontSize: "30px", fontWeight:"bold"}}>
                            <label className = "title"> SIGN UP </label>
                        </div>
                        <div className = "pic-id-pw">
                            <div className = "pic">
                                <div className = "pic-select">
                                    <div className = 'picture-container'>
                                        <input accept="image/*" type="file" name="file" id="file" class="inputfile" onChange={this.fileSelectedHandler} />
                                        {/* <label for="file"><img src={user} alt="user"/></label> */}
                                        <label for="file">{$imgPreview}</label>
                                    </div>
                                </div>
                                <div className = 'instruction-container'>
                                    <div className = 'pic-instruction'>
                                        {picture_instruction.split('\n').map( line => {return (<span>{line}<br/></span>)})}                                        
                                    </div>
                                </div>
                            </div>
                            <div className = "id-pw">
                                <div className = "id">
                                    <div className = "id-text" align="left" style={{marginLeft: "10%", fontSize: "24px", fontWeight:"bold",color:"#808080"}}>
                                        <label style = {{verticalAlign: "middle"}}>
                                            Email
                                        </label>
                                    </div>
                                    <div className = "id-input" >
                                        <TextField
                                        id="user_id"
                                        value={this.state.sign_up_id}
                                        onChange={this.handleChange("sign_up_id")}
                                        onKeyPress={this.signUpKeyPress.bind(this)}
                                        margin="normal"
                                        style={{width:"80%"}}
                                        />
                                    </div>
                                </div>
                                <div className = "pw">
                                    <div className = "pw-text" align="left" style={{marginLeft: "10%", fontSize: "24px", fontWeight:"bold",color:"#808080"}}>
                                        <label style = {{verticalAlign: "middle"}}>
                                            Password
                                        </label>
                                    </div>
                                    <div className = "pw-input">
                                        <TextField
                                        id="user_pw"
                                        type="password"
                                        value={this.state.sign_up_pw}
                                        onChange={this.handleChange("sign_up_pw")}
                                        onKeyPress={this.signUpKeyPress.bind(this)}
                                        margin="normal"
                                        style={{width:"80%"}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className = "name-school">
                                <div className = "name">
                                    <div className = "name-text" align="left" style={{marginLeft: "10%", fontSize: "24px", fontWeight:"bold",color:"#808080"}}>
                                        <label style = {{verticalAlign: "middle"}}>
                                            Name
                                        </label>
                                    </div>
                                    <div className = "name-input">
                                        <TextField
                                        id="user_name"
                                        value={this.state.sign_up_name}
                                        onChange={this.handleChange("sign_up_name")}
                                        onKeyPress={this.signUpKeyPress.bind(this)}
                                        margin="normal"
                                        style={{marginLeft: "2.5%", width:"80%"}}
                                        />
                                    </div>
                                </div>
                                <div className = "school">
                                    <div className = "school-text" align="left" style={{fontSize: "24px", fontWeight:"bold",color:"#808080"}}>
                                        <label style = {{verticalAlign: "middle"}}>
                                            School
                                        </label>
                                    </div>
                                    <div className = "school-input">
                                        <TextField
                                        id="user_school"
                                        value={this.state.sign_up_school}
                                        onChange={this.handleChange("sign_up_school")}
                                        onKeyPress={this.signUpKeyPress.bind(this)}
                                        margin="normal"
                                        style={{marginRight: "10%", width:"90%"}}
                                        />
                                    </div>
                                </div>
                        </div>
                        <div className = "dept">
                            <div className = "dept-text" align="left" style={{marginLeft: "5%", fontSize: "24px", fontWeight:"bold",color:"#808080"}}>
                                <label style = {{verticalAlign: "middle"}}>
                                    Departure
                                </label>
                            </div>
                            <div className = "dept-input">
                                <TextField
                                id="user_dept"
                                value={this.state.sign_up_dept}
                                onChange={this.handleChange("sign_up_dept")}
                                onKeyPress={this.signUpKeyPress.bind(this)}
                                margin="normal"
                                style={{width:"90%"}}
                                />
                            </div>
                        </div>
                        <div className = "signup-button-container">
                            <MuiThemeProvider theme={theme}>
                                <Button className = "cancel-signup"
                                        variant="contained" 
                                        color="secondary" 
                                        onClick={this.closeUp} 
                                        style={{
                                            width:"25%",
                                            borderRadius: 10,
                                            color: "white",
                                            fontSize: "20px",
                                            marginLeft: "5%",
                                            marginRight: '10%'
                                        }}
                                >
                                    Cancel
                                </Button>
                            </MuiThemeProvider>
                            <MuiThemeProvider theme={theme}>
                                <Button className = "signup-button" 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={this.handleSignup} 
                                        style={{
                                            width:"25%",
                                            borderRadius: 10,
                                            color: "white",
                                            fontSize: "20px",
                                            marginRight: "5%",
                                            marginLeft: "10%"
                                        }}
                                >
                                    Sign Up
                                </Button>
                            </MuiThemeProvider>
                        </div>
                    </Modal>
                    <Modal visible={this.state.onProgress} width="400" height="400" effect="fadeInUp"
                            style={{padding: "10"}}
                    >
                        <img src={loading} alt="loading..."/>
                    </Modal>
                </div>
            </div>
        </body>
      );
    }
  }
  
  export default Main;