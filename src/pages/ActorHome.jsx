import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaSearch,
  FaUserCircle,
  FaCalendar,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaSignOutAlt,
  FaTheaterMasks
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:5000";

function ActorHome({ actorId }) {

const [actor,setActor]=useState(null)
const [plays,setPlays]=useState([])
const [loading,setLoading]=useState(true)
const [search,setSearch]=useState("")
const [activeTab,setActiveTab]=useState("upcoming")
const [selectedPlay,setSelectedPlay]=useState(null)

useEffect(()=>{
fetchDashboard()
},[])

const fetchDashboard = async()=>{
try{

const res = await axios.get(`${API_BASE_URL}/api/actors/${actorId}/dashboard`)

setActor(res.data.actor)
setPlays(res.data.plays)

}catch(err){

console.log(err)

}finally{
setLoading(false)
}
}

const confirmPlay = async(playId)=>{
try{

await axios.patch(`${API_BASE_URL}/api/actors/${playId}/confirm`,{
actorId:actorId
})

setPlays(prev =>
prev.map(p => p._id===playId ? {...p,confirmed:true}:p)
)

alert("Availability confirmed")

}catch{
alert("Failed to confirm play")
}
}

const formatDate = (date)=>{

return new Date(date).toLocaleString()

}

const filteredPlays = plays.filter(play=>{

const match = play.title.toLowerCase().includes(search.toLowerCase())

const upcoming = new Date(play.date) > new Date()

return activeTab==="upcoming"
? match && upcoming
: match && !upcoming

})

if(loading){

return <div style={styles.center}>
<h2>Loading...</h2>
</div>

}

return (

<div style={styles.container}>

{/* HEADER */}

<div style={styles.header}>

<div>
<h3>Welcome back</h3>
<h1>{actor?.fullName}</h1>
</div>

<FaUserCircle size={40} color="white"/>

</div>


{/* SEARCH */}

<div style={styles.searchBox}>

<FaSearch/>

<input
placeholder="Search plays..."
value={search}
onChange={e=>setSearch(e.target.value)}
style={styles.searchInput}
/>

</div>


{/* TABS */}

<div style={styles.tabs}>

<button
onClick={()=>setActiveTab("upcoming")}
style={activeTab==="upcoming"?styles.activeTab:styles.tab}
>
Upcoming
</button>

<button
onClick={()=>setActiveTab("past")}
style={activeTab==="past"?styles.activeTab:styles.tab}
>
Past
</button>

</div>


{/* PLAY LIST */}

<div>

{filteredPlays.length===0 && (
<p>No plays available</p>
)}

{filteredPlays.map(play=>(

<div
key={play._id}
style={styles.card}
>

<div style={styles.cardLeft}>
<FaTheaterMasks size={40}/>
</div>

<div style={styles.cardRight}>

<h3>{play.title}</h3>

<p>
<FaCalendar/> {formatDate(play.date)}
</p>

<p>
<FaMapMarkerAlt/> {play.venue}
</p>

<p>
Role: {play.role || "Not specified"}
</p>

<div style={styles.cardButtons}>

{!play.confirmed ? (

<button
style={styles.confirmBtn}
onClick={()=>confirmPlay(play._id)}
>

<FaCheckCircle/>
Confirm

</button>

):(

<span style={styles.confirmed}>
Confirmed
</span>

)}

<button
style={styles.detailsBtn}
onClick={()=>setSelectedPlay(play)}
>

<FaInfoCircle/>
Details

</button>

</div>

</div>

</div>

))}

</div>


{/* PLAY DETAILS MODAL */}

{selectedPlay && (

<div style={styles.modalOverlay}>

<div style={styles.modal}>

<h2>{selectedPlay.title}</h2>

<p><b>Date:</b> {formatDate(selectedPlay.date)}</p>

<p><b>Venue:</b> {selectedPlay.venue}</p>

<p><b>Your Role:</b> {selectedPlay.role}</p>

<p>
<b>Regular:</b> KES {selectedPlay.regularPrice}
</p>

<p>
<b>VIP:</b> KES {selectedPlay.vipPrice}
</p>

<p>
<b>VVIP:</b> KES {selectedPlay.vvipPrice}
</p>

<p>
{selectedPlay.description}
</p>

<button
onClick={()=>setSelectedPlay(null)}
style={styles.closeBtn}
>
Close
</button>

</div>

</div>

)}


{/* LOGOUT */}

<button
style={styles.logout}
onClick={()=>window.location="/login"}
>

<FaSignOutAlt/>
Logout

</button>

</div>

)

}

const styles = {

container:{
padding:20,
fontFamily:"Arial",
background:"#f5f5f5",
minHeight:"100vh"
},

header:{
background:"#6200EE",
color:"white",
padding:20,
borderRadius:10,
display:"flex",
justifyContent:"space-between",
alignItems:"center"
},

searchBox:{
marginTop:20,
background:"white",
padding:10,
borderRadius:10,
display:"flex",
alignItems:"center",
gap:10
},

searchInput:{
border:"none",
outline:"none",
flex:1
},

tabs:{
display:"flex",
marginTop:20,
gap:10
},

tab:{
padding:10,
background:"#ddd",
border:"none",
cursor:"pointer"
},

activeTab:{
padding:10,
background:"#6200EE",
color:"white",
border:"none",
cursor:"pointer"
},

card:{
display:"flex",
background:"white",
marginTop:15,
padding:15,
borderRadius:10
},

cardLeft:{
marginRight:15
},

cardRight:{
flex:1
},

cardButtons:{
display:"flex",
gap:10,
marginTop:10
},

confirmBtn:{
background:"#4CAF50",
color:"white",
border:"none",
padding:8,
cursor:"pointer"
},

confirmed:{
color:"green",
fontWeight:"bold"
},

detailsBtn:{
background:"#eee",
border:"none",
padding:8,
cursor:"pointer"
},

logout:{
position:"fixed",
bottom:20,
right:20,
background:"#6200EE",
color:"white",
border:"none",
padding:15,
borderRadius:30,
cursor:"pointer"
},

center:{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh"
},

modalOverlay:{
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.6)",
display:"flex",
justifyContent:"center",
alignItems:"center"
},

modal:{
background:"white",
padding:30,
borderRadius:10,
maxWidth:500
},

closeBtn:{
marginTop:20,
background:"#6200EE",
color:"white",
border:"none",
padding:10,
cursor:"pointer"
}

}

export default ActorHome