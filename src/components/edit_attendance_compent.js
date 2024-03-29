import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Modal from 'react-awesome-modal';

import alphabet from '../data/alphabet';

import user from '../images/user_white.png';
import default_user from "../images/user.png";

import './make_class_component.css';

var ReactGridLayout = require('react-grid-layout');

var target = "";
var targetKey = "";
var classInfo;
var layout = [
    {i: 'profile', x: 1, y: 1, w: 2, h: 6, static: true},
    {i: 'name', x: 1, y: 7, w: 2, h: 2, static: true},
    {i: 'dept', x: 1, y: 9, w: 2, h: 2, static: true},
    {i: 'email', x: 1, y: 11, w: 2, h: 2, static: true},
    {i: 'attendance', x: 3, y: 0, w: 9, h: 12, static: true},
];

class EditAttendance extends Component{
    constructor(props){
        super(props);

        this.state={
            user_name: '...',
            user_img: user,
            synch: false,
            userID: '',
            sid : props.match.params.sid,
            classname : props.match.params.classname,
            firebase : props.Firebase.fb,
            init : false,
            visible : false,
            editDate : "",
            editAttend : "",
            editRow : "",
            editSeat : "",
            editReporter : "",
            ReporterEditable : false,
            seatEditable : false,
            rowParser : [],
            seatNum : [],
            profile_img : "",
            width : 0,
        }

        let that = this;
        new Promise(function(resolve, reject){
            that.state.firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    that.setState({user_name : user.displayName, userID : user.uid});
                    resolve();
                } else {
                    alert("Oops! you are signed out!");
                    window.location.pathname = "TATABOX/";
                }
            });
        }).then(function(result) {
                that.state.firebase.database().ref('/AUTH/'+that.state.userID).once('value').then(function(snapshot) {
                var userimgs = (snapshot.val() && snapshot.val().imgs) || user;
                that.setState({user_img: userimgs, classname: props.match.params.classname, synch: true});
            });
        })

        this.makeAttendance = this.makeAttendance.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleback = this.handleback.bind(this);
        this.update = this.update.bind(this);

    }

    componentDidMount(){
        var classname = this.state.classname;
        var sid = this.state.sid;
        this.state.firebase.database().ref("/classInfo").once("value").then(function(snapshot){
            snapshot.forEach(function(child){
                if(child.val().name === classname){
                    classInfo = child.val();
                    targetKey = child.key;
                    for(var i = 0; i < child.val().students.length; i++){
                        if(child.val().students[i].sid===sid){
                            target = child.val().students[i];
                            break;
                        }
                    }
                }
            })
        })
        .then(()=>{
            var rows = [];
            for(var i = 0; i<classInfo.layout.length; i++){
                rows.push({
                    num : i,
                    label : alphabet[i]
                });
            }
            var seats = [];
            for(var i = 0; i<classInfo.layout[0].length; i++){
                seats.push(i);
            }
            this.setState({
                seatNum : seats,
                rowParser : rows,
                init : true,
            })
            this.setProfile();
            const width = document.getElementById('full').clientWidth;
            this.setState({
                width: width
            })
        })
    }

    handleback(){
        // let classname_ = this.state.classname;
        window.location.pathname="TATABOX/check/" + this.state.classname;
    }

    gotoMade() {
        window.location.pathname="TATABOX/made"
    }

    setProfile(){
        const storage = this.state.firebase.storage();
        const storageRef = storage.ref();
        let that = this;
        if(target.imgpath === ""){
            this.setState({
                profile_img : default_user,
                init : true
            });
        }else{
            var imgRef = storageRef.child('images/' + target.imgpath);
            imgRef.getDownloadURL().then(url=>{
                that.setState({
                    profile_img : url,
                    init : true
                });
                
            }).catch(err=>{
                console.log(err);
                that.setState({
                    profile_img : default_user,
                    init : true
                });
            })
        }
    }

    closeModal(){
        this.setState({
            visible : false
        })
    }

    handleChange = name => event => {
        if(name === "editAttend"){
            if(event.target.value==="absent"){
                this.setState({
                    editAttend : "absent",
                    editRow : "",
                    editSeat : "",
                    editReporter : "",
                    ReporterEditable : false,
                    seatEditable : false
                })
                return;
            }
            else if(event.target.value==="reported"){
                this.setState({
                    editAttend : "reported",
                    ReporterEditable : true
                })
                return;
            }
            else{
                this.setState({
                    editAttend : "attend",
                    ReporterEditable : false,
                    seatEditable : true
                })
                return;
            }
        }


        this.setState({
          [name]: event.target.value,
        });
    }

    parseRow(row){
        return (this.state.rowParser[row]===undefined) ? "" : this.state.rowParser[row].label;
    }

    update(){
        for(var i = 0; i<classInfo.students.length; i++){
            if(classInfo.students[i].sid === this.state.sid ){
                for(var j = 0; j<classInfo.students[i].attendance.length; j++){
                    if(classInfo.students[i].attendance[j].date === this.state.editDate){
                        classInfo.students[i].attendance[j].attend = this.state.editAttend;
                        classInfo.students[i].attendance[j].row = this.state.editRow;
                        classInfo.students[i].attendance[j].seat = this.state.editSeat;
                        classInfo.students[i].attendance[j].reporter = this.state.editReporter;
                        break;
                    }
                }
            }
        }

        this.state.firebase.database().ref("/classInfo/"+targetKey).set(classInfo)
        .then(
            ()=>{
                window.location.reload();
            }
        );
    }


    makeAttendance(){
        if(target.attendance !== undefined){
        return(target.attendance.map(attendance=>{
            var seatNum = parseInt(attendance.seat) + 1;
            var seat = (attendance.attend === "absent") ? "" : alphabet[parseInt(attendance.row)] + seatNum.toString();
            var reporter = (attendance.attend === "reported") ? attendance.reporter : "";
            var attend = (attendance.attend === "attend") ? "O": "X";

            if(attendance.attend === "reported") attend = "Reported"

            return(
                <TableRow key={attendance.date}>
                    <TableCell style={{fontSize:"17px"}}>{attendance.date}</TableCell>
                    <TableCell style={{fontSize:"17px"}}>{attend}</TableCell>
                    <TableCell style={{fontSize:"17px"}}>{seat}</TableCell>
                    <TableCell style={{fontSize:"17px"}}>{reporter}</TableCell>
                    <TableCell>
                        <Button variant="contained" color="primary"
                        onClick={()=>{
                            if(attendance.attend === "reported"){
                                this.setState({
                                    editAttend : attendance.attend,
                                    editDate : attendance.date,
                                    editSeat : attendance.seat,
                                    editRow : attendance.row,
                                    editReporter : reporter,
                                    visible : true,
                                    ReporterEditable : true
                                })
                            }else if(attendance.attend === "attend"){
                                this.setState({
                                    editAttend : attendance.attend,
                                    editDate : attendance.date,
                                    editSeat : attendance.seat,
                                    editRow : attendance.row,
                                    editReporter : reporter,
                                    seatEditable : true,
                                    visible : true
                                })
                            }else{
                                this.setState({
                                    editAttend : attendance.attend,
                                    editDate : attendance.date,
                                    editSeat : attendance.seat,
                                    editRow : attendance.row,
                                    editReporter : reporter,
                                    visible : true
                                })
                            }
                        }}
                        >Edit</Button>
                    </TableCell>
                </TableRow>
            )
        }))
        }
    }

    EditReporter(){
        if(this.state.ReporterEditable){
            return(
                <input value={this.state.editReporter} onChange={this.handleChange("editReporter")}/>
            )
        }
        else{
            return this.state.editReporter;
        }
    }

    EditRow(){
        if(this.state.seatEditable){
            return(
                <select value={this.state.editRow} onChange={this.handleChange("editRow")}>
                    {this.state.rowParser.map(row=>{
                        return(
                            <option value={row.num}>{row.label}</option>
                        )
                    })}
                </select>
            )
        }
        else{
            return this.parseRow(this.state.editRow);
        }
    }
    EditSeat(){
        if(this.state.seatEditable){
            return(
                <select value={this.state.editSeat} onChange={this.handleChange("editSeat")}>
                    {this.state.seatNum.map(seat=>{
                        return(
                            <option value={seat}>{seat+1}</option>
                        )
                    })}
                </select>
            )
        }
        else{
            return parseInt(this.state.editSeat)+1;
        }
    }

    render(){
        if(this.state.init){
        let $profile = null;
        let $profileImg = null;

        if (this.state.synch) {
            $profile = (<img style={{borderRadius: "50%"}} src={this.state.user_img} id = 'user_img' alt="" />);
        } else {
            $profile = (<img style={{borderRadius: "50%"}} src={user} id = 'user_img' alt=""/>);
        }
        

        if (this.state.width !== 0) {
            var imgSize = this.state.width * 0.12;
            console.log(this.state.profile_img);
            $profileImg = (<img style={{width: imgSize, height: imgSize, borderRadius: "50%"}} src={this.state.profile_img} alt=""/>);
        }    


        return(
            <div id = 'full'>
                <div id = 'headbar3'>
                    <h1 id = 'logo'style={{marginTop:"5px", cursor:"pointer"}} onClick={this.gotoMade}>TATABOX</h1>
                    <h2 style={{color: "white",float:"left", marginLeft: "15px",marginTop:"29px"}}>{this.state.classname}</h2>
                    <div id = 'menu'>
                        <Button
                            className="center"
                            id = 'menu_button'
                            buttonRef={node => {
                            this.anchorEl = node;
                            }}
                            aria-owns={this.state.open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={this.handleToggle}
                        >
                        <img
                            id = "menu-img"
                            src = {require('../images/menu.png')}
                            alt=""
                        >
                        </img>
                        </Button>
                    </div>
                    <h3 id = 'userid'>{this.state.user_name}</h3>
                    <div id = 'img_cropper'>
                        {$profile}
                    </div>
                    <div id = 'backtoclass' style={{marginRight:"2vh",marginTop:"3vh",paddingLeft:"0px"}} onClick={this.handleback}>
                        <h3>Back to Class</h3>
                    </div>
                    <div id = 'backtoclass' onClick={this.handleback}>
                        <img style={{width:"30px", height:"30px"}} src = {require('../images/back.png')} alt=""></img>
                    </div>
                </div>
                <div id = 'body' style={{position:"relative",display:"flex", alignItems:"center",paddingTop:"1%",paddingBottom:"1%"}}>
                    <h1 style={{marginLeft:"1.5%", marginTop:"0.5%",whiteSpace:"nowrap"}}>Student Management</h1>
                    <Button variant="contained" color="secondary" onClick={()=>{window.location.pathname="/TATABOX/management/"+this.state.classname}} style={{marginLeft:"65vw"}}>DONE</Button>
                </div>
                <div id = 'body2' style={{backgroundColor:'#FFFFFF', overflowY:"auto"}}>
                    <ReactGridLayout className="layout" layout = {layout} cols = {12} rowHeight={30} width={this.state.width*0.90}>
                        <div key="profile">
                            {$profileImg}
                        </div>
                        <div key="name">
                            <h3>Name & Student ID</h3>
                            <br/>
                            {target.name}
                            {" / "}
                            {target.sid}
                        </div>
                        <div key="dept">
                            <h3>Major</h3>
                            <br/>
                            {target.dept}
                        </div>
                        <div key="email">
                            <h3>Email</h3>
                            <br/>
                            {target.email}
                        </div>
                        <div key="attendance" style={{overflowY:"scroll", scrollBehavior:"smooth"}}>
                            <h3>Attendance</h3>
                            <br/>
                            <Table>
                                <TableHead>
                                    <TableRow style={{backgroundColor:"#7eab54",height:"20px"}}>
                                        <TableCell style={{color:"white",fontWeight:"bold",fontSize:"20px"}}>Date</TableCell>
                                        <TableCell style={{color:"white",fontWeight:"bold",fontSize:"20px"}}>Attendance</TableCell>
                                        <TableCell style={{color:"white",fontWeight:"bold",fontSize:"20px"}}>Seat</TableCell>
                                        <TableCell style={{color:"white",fontWeight:"bold",fontSize:"20px"}}>Reporter</TableCell>
                                        <TableCell style={{color:"white",fontWeight:"bold",fontSize:"20px"}}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody >
                                        {this.makeAttendance()}
                                </TableBody>
                            </Table>
                        </div>
                    </ReactGridLayout>
                </div>
                <Modal
                    visible={this.state.visible} 
                    width="400" 
                    height="350" 
                    effect="fadeInUp" 
                    onClickAway={this.closeModal}
                    >
                    <br/>
                    <h2>Edit Attendance</h2><br/>
                    Date : {this.state.editDate}<br/><br/>
                    Attendance : {" "}
                    <select value={this.state.editAttend} onChange={this.handleChange("editAttend")}>
                        <option value="attend">attend</option>
                        <option value="absent">absent</option>
                        <option value="reported">reported</option>
                    </select>
                    <br/><br/>
                    Seat Row : {this.EditRow()}<br/><br/>
                    Seat Number : {this.EditSeat()}<br/><br/>
                    Reported by : {this.EditReporter()}<br/><br/> <br/>      
                    <Button variant="contained" color="primary" onClick={()=>{
                        if(window.confirm("Are you sure to edit the information?"))
                            this.update()
                    }}
                    style ={{float:"left", marginLeft:"5vh"}}
                    >Save</Button>
                     <Button variant="contained" color="secondary" onClick={this.closeModal} style={{float:"right",marginRight:"5vh"}}>cancel</Button>
                </Modal>
            </div>
        )
        }
        else{
            return(
                <div></div>
            )
        }
    }
}


export default EditAttendance;