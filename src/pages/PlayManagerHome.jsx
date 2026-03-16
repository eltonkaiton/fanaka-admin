import React,{useState,useEffect}from'react';import{useNavigate}from'react-router-dom';import{IoAddCircleOutline,IoAlbumsOutline,IoReceiptOutline,IoLogOutOutline,IoCalendarOutline,IoClose}from'react-icons/io5';
export default function PlayManagerHome(){const n=useNavigate();const[ap,setAp]=useState(null);const[tb,setTb]=useState(null);const[us,setUs]=useState(null);const[loading,setLoading]=useState(true);const[error,setError]=useState(null);
const[toasts,setToasts]=useState([]);const[confirm,setConfirm]=useState({show:false});
const toast=(msg,type='info',dur=3000)=>{const id=Date.now()+Math.random();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),dur);};
const rmToast=id=>setToasts(p=>p.filter(t=>t.id!==id));
useEffect(()=>{const f=async()=>{try{setLoading(true);setError(null);
const[playsRes,bookingsRes,showsRes]=await Promise.allSettled([
fetch('/api/plays/active/count'),fetch('/api/bookings/total/count'),fetch('/api/shows/upcoming/count')]);
const safe=async r=>{if(!r||!r.ok)return null;const t=await r.text();try{return JSON.parse(t)}catch{return null}};
const pd=await safe(playsRes.status==='fulfilled'?playsRes.value:null);
const bd=await safe(bookingsRes.status==='fulfilled'?bookingsRes.value:null);
const sd=await safe(showsRes.status==='fulfilled'?showsRes.value:null);
setAp(pd?.count??0);setTb(bd?.count??0);setUs(sd?.count??0);
if(!pd||!bd||!sd)setError('Some statistics could not be loaded.');
}catch(err){console.error(err);setError('Could not load dashboard statistics.');}finally{setLoading(false);}};f();},[]);
const handleLogout=()=>setConfirm({show:true});
const confirmLogout=()=>{localStorage.clear();toast('Logged out successfully','success');setTimeout(()=>n('/login'),1500);setConfirm({show:false});};
const cancelLogout=()=>setConfirm({show:false});
const actions=[{path:'/play-manager/create-play',icon:<IoAddCircleOutline size={40} color="#6200EE"/>,title:'Create New Play',description:'Add a new play to the repertoire'},
{path:'/play-manager/manage-plays',icon:<IoAlbumsOutline size={40} color="#03DAC6"/>,title:'Manage Plays',description:'Edit, update or remove existing plays'},
{path:'/play-manager/manager-bookings',icon:<IoReceiptOutline size={40} color="#FF6D00"/>,title:'View Bookings',description:'Check all ticket bookings and revenue'}];
const ToastContainer=()=>(<div style={s.toastContainer}>{toasts.map(t=><div key={t.id} style={{...s.toast,...s[`toast${t.type}`]}}><span>{t.msg}</span><button onClick={()=>rmToast(t.id)} style={s.toastClose}>✕</button></div>)}</div>);
const ConfirmModal=()=>confirm.show&&(<div style={s.modalOverlay} onClick={cancelLogout}><div style={s.confirmModal} onClick={e=>e.stopPropagation()}><h3>Confirm Logout</h3><p>Are you sure you want to logout?</p><div style={s.confirmButtons}><button style={s.cancelBtn} onClick={cancelLogout}>Cancel</button><button style={s.confirmBtn} onClick={confirmLogout}>Logout</button></div></div></div>);
const s={
container:{padding:'30px',fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",backgroundColor:'#f8fafc',minHeight:'100vh'},
header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px',flexWrap:'wrap',gap:'15px'},
title:{fontSize:'32px',fontWeight:'700',color:'#1e293b',margin:'0 0 5px 0'},
subtitle:{fontSize:'16px',color:'#64748b',margin:'0'},
logoutButton:{display:'flex',alignItems:'center',gap:'8px',backgroundColor:'#ef4444',color:'#fff',border:'none',borderRadius:'50px',padding:'10px 20px',fontSize:'16px',fontWeight:'500',cursor:'pointer',transition:'background-color 0.2s, transform 0.1s',boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)'},
statsContainer:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'20px',marginBottom:'40px'},
statCard:{display:'flex',alignItems:'center',gap:'15px',backgroundColor:'#ffffff',padding:'20px',borderRadius:'16px',boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)',border:'1px solid #e2e8f0'},
statInfo:{display:'flex',flexDirection:'column'},
statValue:{fontSize:'28px',fontWeight:'700',color:'#0f172a',lineHeight:'1.2'},
statLabel:{fontSize:'14px',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.5px'},
loading:{gridColumn:'1 / -1',textAlign:'center',padding:'40px',color:'#64748b',fontSize:'18px'},
error:{gridColumn:'1 / -1',textAlign:'center',padding:'20px',color:'#ef4444',fontSize:'16px'},
cardGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'25px',marginTop:'20px'},
card:{backgroundColor:'#ffffff',borderRadius:'20px',padding:'30px 20px',textAlign:'center',cursor:'pointer',transition:'transform 0.2s, box-shadow 0.2s',boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)',border:'none',display:'flex',flexDirection:'column',alignItems:'center',width:'100%'},
cardIcon:{marginBottom:'20px',backgroundColor:'#f1f5f9',padding:'15px',borderRadius:'50%',display:'inline-flex'},
cardTitle:{fontSize:'20px',fontWeight:'600',color:'#0f172a',margin:'0 0 8px 0'},
cardDescription:{fontSize:'14px',color:'#64748b',margin:'0',lineHeight:'1.5'},
footer:{marginTop:'40px',textAlign:'center',color:'#94a3b8',fontSize:'14px',borderTop:'1px solid #e2e8f0',paddingTop:'20px'},
toastContainer:{position:'fixed',top:20,right:20,zIndex:2000,display:'flex',flexDirection:'column',gap:10},
toast:{display:'flex',alignItems:'center',justifyContent:'space-between',minWidth:250,maxWidth:400,padding:'12px 16px',borderRadius:8,color:'#fff',fontSize:14,fontWeight:500,boxShadow:'0 4px 12px rgba(0,0,0,0.15)',animation:'slideIn 0.3s ease'},
toastSuccess:{backgroundColor:'#4CAF50'},toastError:{backgroundColor:'#F44336'},toastWarning:{backgroundColor:'#FF9800'},toastInfo:{backgroundColor:'#2196F3'},
toastClose:{background:'none',border:'none',cursor:'pointer',marginLeft:12,padding:0,color:'#fff',fontSize:18,lineHeight:1},
modalOverlay:{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1500},
confirmModal:{backgroundColor:'#fff',borderRadius:'12px',padding:'24px',maxWidth:'400px',width:'90%',boxShadow:'0 8px 24px rgba(0,0,0,0.2)'},
confirmButtons:{display:'flex',justifyContent:'space-between',gap:'12px',marginTop:'20px'},
cancelBtn:{flex:1,padding:'12px',borderRadius:'8px',border:'1px solid #ddd',backgroundColor:'#f5f5f5',fontSize:'16px',fontWeight:'500',cursor:'pointer'},
confirmBtn:{flex:1,padding:'12px',borderRadius:'8px',border:'none',backgroundColor:'#ef4444',color:'#fff',fontSize:'16px',fontWeight:'500',cursor:'pointer'},
};
return(<div style={s.container}><ToastContainer/><ConfirmModal/>
<div style={s.header}><div><h1 style={s.title}>Play Manager Dashboard</h1><p style={s.subtitle}>Welcome back! Manage your plays and bookings.</p></div><button style={s.logoutButton} onClick={handleLogout}><IoLogOutOutline size={22} color="#fff"/><span style={s.logoutText}>Logout</span></button></div>
<div style={s.statsContainer}>{loading?<div style={s.loading}>Loading stats...</div>:<><div style={s.statCard}><IoCalendarOutline size={30} color="#6200EE"/><div style={s.statInfo}><span style={s.statValue}>{ap}</span><span style={s.statLabel}>Active Plays</span></div></div><div style={s.statCard}><IoReceiptOutline size={30} color="#03DAC6"/><div style={s.statInfo}><span style={s.statValue}>{tb}</span><span style={s.statLabel}>Total Bookings</span></div></div><div style={s.statCard}><IoAlbumsOutline size={30} color="#FF6D00"/><div style={s.statInfo}><span style={s.statValue}>{us}</span><span style={s.statLabel}>Upcoming Shows</span></div></div></>}{error&&!loading&&<div style={s.error}>{error}</div>}</div>
<div style={s.cardGrid}>{actions.map((a,i)=><button key={i} style={s.card} onClick={()=>n(a.path)}><div style={s.cardIcon}>{a.icon}</div><h3 style={s.cardTitle}>{a.title}</h3><p style={s.cardDescription}>{a.description}</p></button>)}</div>
<p style={s.footer}>Use the sidebar for additional navigation options.</p>
</div>);}
(()=>{const style=document.createElement('style');style.innerHTML=`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`;document.head.appendChild(style);})();