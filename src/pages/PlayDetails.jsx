import React,{useEffect,useState}from'react';import{useParams,useNavigate}from'react-router-dom';import axios from'axios';import{IoCalendarOutline,IoLocationOutline,IoTimeOutline,IoPeopleOutline,IoInformationCircleOutline,IoFilmOutline,IoClose,IoPerson,IoMail,IoCall,IoRemove,IoAdd,IoChevronUp,IoChevronDown,IoStar,IoDiamond,IoCheckmarkCircle,IoArrowForward,IoPhonePortrait,IoCard,IoCash}from'react-icons/io5';
const API='http://localhost:5000';
export default function PlayDetails(){
  const{id}=useParams();const n=useNavigate();
  const[p,setP]=useState(null);const[l,setL]=useState(true);const[bM,setBM]=useState(false);const[payM,setPayM]=useState(false);const[proc,setProc]=useState(false);
  const[u,setU]=useState(null);const[tix,setTix]=useState('regular');const[q,setQ]=useState(1);const[total,setTotal]=useState(0);const[showSeat,setShowSeat]=useState(false);
  const[avail,setAvail]=useState({regular:[],vip:[],vvip:[]});const[alloc,setAlloc]=useState([]);const[payMethod,setPayMethod]=useState('mpesa');const[payCode,setPayCode]=useState('');
  const[toasts,setToasts]=useState([]);
  const toast=(msg,type='info',dur=3000)=>{const id=Date.now()+Math.random();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),dur);};
  const rmToast=id=>setToasts(p=>p.filter(t=>t.id!==id));

  useEffect(()=>{fetchP();fetchU();},[id]);
  const fetchP=async()=>{try{setL(true);const res=await axios.get(`${API}/api/plays/${id}`);setP(res.data);genSeat();}catch{toast('Failed to load play details','error');}finally{setL(false);}};
  const genSeat=()=>{
    const d={regular:[],vip:[],vvip:[]};
    for(let i=1;i<=20;i++)d.regular.push({id:i,number:`A${i}`,type:'regular',available:Math.random()>0.1});
    for(let i=1;i<=20;i++)d.vip.push({id:i+20,number:`B${i}`,type:'vip',available:Math.random()>0.2});
    for(let i=1;i<=10;i++)d.vvip.push({id:i+40,number:`C${i}`,type:'vvip',available:Math.random()>0.3});
    setAvail(d);
  };
  const fetchU=async()=>{
    try{const t=localStorage.getItem('token');if(t){const res=await axios.get(`${API}/api/users/profile`,{headers:{Authorization:`Bearer ${t.trim()}`}});setU(res.data);}else setU(null);}
    catch{setU(null);}
  };
  useEffect(()=>{
    if(p){
      const priceMap={regular:p.regularPrice||0,vip:p.vipPrice||0,vvip:p.vvipPrice||0};
      setTotal(priceMap[tix]*q);
      const seatType=tix;const seatsToAlloc=q;const free=avail[seatType]?.filter(s=>s.available)||[];
      const all=free.slice(0,seatsToAlloc).map(s=>({id:s.id,number:s.number,type:s.type}));
      setAlloc(all);
    }
  },[tix,q,p,avail]);

  const handleBook=()=>{
    if(!u){toast('Please login to book tickets','warning');n('/login');return;}
    const free=avail[tix]?.filter(s=>s.available)||[];
    if(free.length<q){toast(`Only ${free.length} ${tix.toUpperCase()} seats available.`,'warning');return;}
    setBM(true);
  };
  const handleConfirm=()=>{if(alloc.length!==q){toast('Could not allocate enough seats. Please try again.','warning');return;}setPayM(true);};
  const processPay=async()=>{
    if(!payCode.trim()){toast('Please enter your payment code','warning');return;}
    if(alloc.length===0){toast('No seats allocated. Please try again.','warning');return;}
    setProc(true);
    try{
      const data={
        playId:id,playTitle:p.title,ticketType:tix,quantity:q,allocatedSeats:alloc.map(s=>s.number),totalPrice:total,
        paymentMethod:payMethod,paymentCode:payCode,bookingDate:new Date().toISOString(),playDate:p.date,
        customerName:u?.fullName,customerEmail:u?.email,customerPhone:u?.phone,userId:u?._id,
      };
      const res=await axios.post(`${API}/api/bookings`,data);
      if(res.data.success){
        toast('Booking Successful! Check My Bookings for details.','success');
        reset();n('/home/my-bookings');
      }
    }catch(error){
      let msg='Payment failed. Please try again.';
      if(error.response?.data?.msg)msg=error.response.data.msg;
      else if(error.response?.data?.errors)msg=error.response.data.errors.map(e=>e.msg).join(', ');
      else if(error.message==='Network Error')msg='Network error. Please check your connection.';
      toast(msg,'error');
    }finally{setProc(false);}
  };
  const reset=()=>{setTix('regular');setQ(1);setAlloc([]);setShowSeat(false);setPayMethod('mpesa');setPayCode('');setBM(false);setPayM(false);};
  const fmtDate=d=>new Date(d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const getPrice=t=>p?.[t+'Price']||0;
  const img=p?.image?`${API}${p.image}`:null;const past=p?new Date(p.date)<=new Date():false;
  const allSeats=[...(avail.regular||[]),...(avail.vip||[]),...(avail.vvip||[])];

  const s={
    container:{backgroundColor:'#f8f9fa',minHeight:'100vh',fontFamily:'system-ui'},
    centered:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',padding:20},
    loadingText:{marginTop:10,fontSize:16,color:'#666'},
    noDataText:{fontSize:16,color:'#666',marginTop:10,marginBottom:20},
    retryButton:{backgroundColor:'#6200EE',padding:'12px 30px',borderRadius:8,border:'none',cursor:'pointer',color:'#fff',fontSize:16,fontWeight:600},
    imageContainer:{width:'100%',height:300,position:'relative',backgroundColor:'#e0e0e0',display:'flex',alignItems:'center',justifyContent:'center'},
    image:{width:'100%',height:'100%',objectFit:'cover'},
    noImageText:{color:'#666',fontSize:16,marginTop:10},
    pastEventOverlay:{position:'absolute',top:20,right:20,backgroundColor:'rgba(244,67,54,0.9)',padding:'8px 15px',borderRadius:20},
    pastEventText:{color:'#fff',fontSize:12,fontWeight:'bold'},
    detailsContainer:{padding:20},
    title:{fontSize:28,fontWeight:'bold',color:'#1a1a1a',marginBottom:15,textAlign:'center'},
    infoBar:{display:'flex',justifyContent:'space-between',marginBottom:25,padding:15,backgroundColor:'#fff',borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'},
    infoItem:{display:'flex',alignItems:'center',flex:1},
    infoItemText:{fontSize:14,color:'#333',marginLeft:8,flex:1},
    section:{marginBottom:30},
    sectionTitle:{fontSize:22,fontWeight:'bold',color:'#1a1a1a',marginBottom:15},
    pricesSection:{backgroundColor:'#fff',borderRadius:12,padding:20,marginBottom:25,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'},
    pricesGrid:{display:'flex',justifyContent:'space-between',marginTop:10,gap:10},
    priceCard:{flex:1,backgroundColor:'#f8f9fa',padding:15,borderRadius:10,textAlign:'center'},
    priceCardVip:{backgroundColor:'#FFF3E0',border:'1px solid #FF9800'},
    priceCardVvip:{backgroundColor:'#E3F2FD',border:'1px solid #2196F3'},
    priceType:{fontSize:16,fontWeight:600,color:'#333',marginBottom:5},
    priceValue:{fontSize:20,fontWeight:'bold',color:'#6200EE',marginBottom:5},
    priceDesc:{fontSize:12,color:'#666'},
    description:{fontSize:16,lineHeight:24,color:'#444',textAlign:'justify'},
    castScroll:{display:'flex',overflowX:'auto',gap:20,paddingBottom:10},
    actorCard:{alignItems:'center',width:100},
    actorAvatar:{width:70,height:70,borderRadius:35,backgroundColor:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10},
    actorName:{fontSize:14,fontWeight:600,color:'#333',textAlign:'center'},
    actorRole:{fontSize:12,color:'#666',textAlign:'center',marginTop:2},
    detailsGrid:{display:'flex',flexWrap:'wrap',justifyContent:'space-between'},
    detailCard:{width:'48%',backgroundColor:'#fff',padding:15,borderRadius:10,marginBottom:15,textAlign:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
    detailCardTitle:{fontSize:14,fontWeight:600,color:'#333',marginTop:10,marginBottom:5},
    detailCardValue:{fontSize:16,color:'#666'},
    statusUpcoming:{color:'#4CAF50'},
    statusPast:{color:'#F44336'},
    bookingContainer:{marginTop:20,marginBottom:20},
    bookButton:{backgroundColor:'#6200EE',display:'flex',alignItems:'center',justifyContent:'center',padding:18,borderRadius:12,border:'none',cursor:'pointer',color:'#fff',fontSize:18,fontWeight:'bold',gap:10,boxShadow:'0 4px 10px rgba(0,0,0,0.2)'},
    bookButtonDisabled:{backgroundColor:'#9E9E9E',cursor:'not-allowed'},
    bookingNote:{textAlign:'center',color:'#F44336',marginTop:10,fontSize:14},
    // Modal
    modalOverlay:{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:1000},
    modalContent:{backgroundColor:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'90%',width:'100%',maxWidth:600,display:'flex',flexDirection:'column'},
    modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:20,borderBottom:'1px solid #eee'},
    modalTitle:{fontSize:20,fontWeight:'bold',color:'#1a1a1a',margin:0},
    modalBody:{padding:20,overflowY:'auto'},
    playTitleModal:{fontSize:18,fontWeight:600,color:'#333',marginBottom:20,textAlign:'center'},
    userInfo:{backgroundColor:'#f8f9fa',padding:15,borderRadius:10,marginBottom:20},
    userInfoItem:{display:'flex',alignItems:'center',marginBottom:8},
    userInfoText:{fontSize:14,color:'#333',marginLeft:10},
    ticketTypeButtons:{display:'flex',gap:10,marginBottom:20},
    ticketTypeButton:{flex:1,padding:15,textAlign:'center',borderRadius:10,backgroundColor:'#f8f9fa',border:'1px solid #ddd',cursor:'pointer'},
    ticketTypeButtonActive:{backgroundColor:'#6200EE',borderColor:'#6200EE',color:'#fff'},
    ticketTypeButtonText:{fontSize:14,fontWeight:600,color:'#333'},
    ticketTypeButtonTextActive:{color:'#fff'},
    ticketTypePrice:{fontSize:12,color:'#666',marginTop:5},
    inputGroup:{marginBottom:20},
    inputLabel:{fontSize:16,fontWeight:600,color:'#333',marginBottom:8,display:'block'},
    quantitySelector:{display:'flex',alignItems:'center',justifyContent:'space-between',border:'1px solid #ddd',borderRadius:10,padding:'0 15px',height:50},
    quantityButton:{background:'none',border:'none',cursor:'pointer'},
    quantityText:{fontSize:18,fontWeight:'bold',color:'#333'},
    quantityHelper:{fontSize:12,color:'#666',marginTop:5,textAlign:'center'},
    seatToggle:{display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor:'#f8f9fa',padding:15,borderRadius:10,marginBottom:20,cursor:'pointer'},
    seatToggleText:{fontSize:16,fontWeight:600,color:'#6200EE'},
    seatDisplay:{marginBottom:20},
    seatDisplayTitle:{fontSize:18,fontWeight:'bold',color:'#333',marginBottom:10},
    seatLegend:{display:'flex',flexWrap:'wrap',gap:10,marginBottom:15,backgroundColor:'#f8f9fa',padding:10,borderRadius:8},
    legendItem:{display:'flex',alignItems:'center',gap:5},
    legendColor:{width:15,height:15,borderRadius:3},
    legendRegular:{backgroundColor:'#e3f2fd',border:'1px solid #2196F3'},
    legendVip:{backgroundColor:'#FFF3E0',border:'1px solid #FF9800'},
    legendVvip:{backgroundColor:'#E8F5E8',border:'1px solid #4CAF50'},
    legendAllocated:{backgroundColor:'#6200EE',border:'1px solid #6200EE'},
    legendUnavailable:{backgroundColor:'#f5f5f5',border:'1px solid #ddd'},
    legendText:{fontSize:12,color:'#666'},
    seatAllocationInfo:{backgroundColor:'#f0f7ff',padding:12,borderRadius:8,marginBottom:15},
    seatAllocationText:{fontSize:14,color:'#333',fontWeight:600},
    allocatedSeatsText:{fontSize:16,color:'#6200EE',fontWeight:'bold',marginTop:5},
    seatsGrid:{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:6,marginBottom:15},
    seat:{width:35,height:35,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #2196F3',backgroundColor:'#e3f2fd',position:'relative'},
    seatVip:{borderColor:'#FF9800',backgroundColor:'#FFF3E0'},
    seatVvip:{borderColor:'#4CAF50',backgroundColor:'#E8F5E8'},
    seatAllocated:{backgroundColor:'#6200EE',borderColor:'#6200EE'},
    seatUnavailable:{backgroundColor:'#f5f5f5',borderColor:'#ddd'},
    seatText:{fontSize:10,fontWeight:600,color:'#333'},
    seatTextAllocated:{color:'#fff'},
    seatTextUnavailable:{color:'#999'},
    seatCheckmark:{position:'absolute',top:-3,right:-3},
    stageIndicator:{backgroundColor:'#333',padding:10,borderRadius:8,textAlign:'center',marginTop:10},
    stageText:{color:'#fff',fontSize:14,fontWeight:'bold'},
    priceSummary:{backgroundColor:'#f8f9fa',padding:20,borderRadius:12},
    priceRow:{display:'flex',justifyContent:'space-between',marginBottom:10},
    priceLabel:{fontSize:16,color:'#666'},
    priceValueRow:{fontSize:16,color:'#333',fontWeight:600},
    divider:{height:1,backgroundColor:'#ddd',marginVertical:10},
    totalRow:{marginTop:10},
    totalLabel:{fontSize:18,fontWeight:'bold',color:'#333'},
    totalValue:{fontSize:20,fontWeight:'bold',color:'#6200EE'},
    modalFooter:{display:'flex',padding:20,borderTop:'1px solid #eee',gap:10},
    cancelButton:{flex:1,padding:15,backgroundColor:'#f5f5f5',border:'none',borderRadius:10,fontSize:16,fontWeight:600,color:'#666',cursor:'pointer'},
    confirmButton:{flex:2,padding:15,backgroundColor:'#6200EE',border:'none',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:'#fff',fontSize:16,fontWeight:600,cursor:'pointer'},
    confirmButtonDisabled:{backgroundColor:'#9E9E9E',cursor:'not-allowed'},
    paymentAmount:{fontSize:36,fontWeight:'bold',color:'#6200EE',textAlign:'center',marginBottom:20},
    paymentMethods:{display:'flex',gap:10,marginBottom:20},
    paymentMethod:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:15,borderRadius:10,backgroundColor:'#f8f9fa',border:'1px solid #ddd',cursor:'pointer'},
    paymentMethodActive:{backgroundColor:'#6200EE10',borderColor:'#6200EE'},
    paymentMethodText:{fontSize:14,fontWeight:600,color:'#333',marginTop:5},
    paymentMethodTextActive:{color:'#6200EE'},
    mpesaInstructions:{backgroundColor:'#f0f7ff',padding:15,borderRadius:10,marginBottom:20},
    instructionsTitle:{fontSize:16,fontWeight:'bold',color:'#333',marginBottom:10},
    instructionsText:{fontSize:14,color:'#666',marginBottom:5},
    input:{width:'100%',padding:12,border:'1px solid #ddd',borderRadius:10,fontSize:16,backgroundColor:'#f9f9f9'},
    inputHelper:{fontSize:12,color:'#666',marginTop:5},
    paymentSummary:{backgroundColor:'#f8f9fa',padding:20,borderRadius:12},
    paymentSummaryTitle:{fontSize:18,fontWeight:'bold',color:'#333',marginBottom:15},
    paymentRow:{display:'flex',justifyContent:'space-between',marginBottom:10},
    paymentLabel:{fontSize:14,color:'#666'},
    paymentValue:{fontSize:14,color:'#333',fontWeight:600},
    paymentTotal:{marginTop:10},
    paymentTotalLabel:{fontSize:16,fontWeight:'bold',color:'#333'},
    paymentTotalValue:{fontSize:18,fontWeight:'bold',color:'#6200EE'},
    // Toast
    toastContainer:{position:'fixed',top:20,right:20,zIndex:2000,display:'flex',flexDirection:'column',gap:10},
    toast:{display:'flex',alignItems:'center',justifyContent:'space-between',minWidth:250,maxWidth:400,padding:'12px 16px',borderRadius:8,color:'#fff',fontSize:14,fontWeight:500,boxShadow:'0 4px 12px rgba(0,0,0,0.15)',animation:'slideIn 0.3s ease'},
    toastSuccess:{backgroundColor:'#4CAF50'},
    toastError:{backgroundColor:'#F44336'},
    toastWarning:{backgroundColor:'#FF9800'},
    toastInfo:{backgroundColor:'#2196F3'},
    toastClose:{background:'none',border:'none',cursor:'pointer',marginLeft:12,padding:0,color:'#fff',fontSize:18,lineHeight:1},
  };

  const Toast=()=>(
    <div style={s.toastContainer}>{toasts.map(t=><div key={t.id} style={{...s.toast,...s[`toast${t.type}`]}}><span>{t.msg}</span><button onClick={()=>rmToast(t.id)} style={s.toastClose}>✕</button></div>)}</div>
  );

  if(l)return(<div style={s.centered}><div className="spinner"/><p style={s.loadingText}>Loading...</p></div>);
  if(!p)return(<div style={s.centered}><IoFilmOutline size={60} color="#666"/><p style={s.noDataText}>Play not found</p><button style={s.retryButton} onClick={()=>n(-1)}>Go Back</button></div>);

  return(<div style={s.container}>
    <Toast/>
    <div style={s.imageContainer}>{img?<img src={img} alt={p.title} style={s.image}/>:<><IoFilmOutline size={60} color="#666"/><p style={s.noImageText}>No Image</p></>}{past&&<div style={s.pastEventOverlay}><span style={s.pastEventText}>PAST EVENT</span></div>}</div>
    <div style={s.detailsContainer}>
      <h1 style={s.title}>{p.title}</h1>
      <div style={s.infoBar}><div style={s.infoItem}><IoCalendarOutline size={20} color="#6200EE"/><span style={s.infoItemText}>{fmtDate(p.date)}</span></div><div style={s.infoItem}><IoLocationOutline size={20} color="#6200EE"/><span style={s.infoItemText}>{p.venue||'Venue not specified'}</span></div></div>
      <div style={s.pricesSection}><h2 style={s.sectionTitle}>Ticket Prices</h2><div style={s.pricesGrid}>
        <div style={s.priceCard}><div style={s.priceType}>Regular</div><div style={s.priceValue}>KES {p.regularPrice||0}</div><div style={s.priceDesc}>Standard</div></div>
        <div style={{...s.priceCard,...s.priceCardVip}}><div style={s.priceType}>VIP</div><div style={s.priceValue}>KES {p.vipPrice||0}</div><div style={s.priceDesc}>Premium</div></div>
        <div style={{...s.priceCard,...s.priceCardVvip}}><div style={s.priceType}>VVIP</div><div style={s.priceValue}>KES {p.vvipPrice||0}</div><div style={s.priceDesc}>Front row</div></div>
      </div></div>
      <div style={s.section}><h2 style={s.sectionTitle}>About</h2><p style={s.description}>{p.description}</p></div>
      {p.actors?.length>0&&<div style={s.section}><h2 style={s.sectionTitle}>Cast</h2><div style={s.castScroll}>{p.actors.map((a,i)=><div key={i} style={s.actorCard}><div style={s.actorAvatar}><IoPerson size={50} color="#6200EE"/></div><div style={s.actorName}>{a.actor?.fullName||a.actor?.name||'Actor'}</div><div style={s.actorRole}>{a.role||'Role'}</div></div>)}</div></div>}
      <div style={s.section}><h2 style={s.sectionTitle}>Details</h2><div style={s.detailsGrid}>
        <div style={s.detailCard}><IoTimeOutline size={24} color="#6200EE"/><div style={s.detailCardTitle}>Duration</div><div style={s.detailCardValue}>2-3h</div></div>
        <div style={s.detailCard}><IoPeopleOutline size={24} color="#6200EE"/><div style={s.detailCardTitle}>Rating</div><div style={s.detailCardValue}>PG-13</div></div>
        <div style={s.detailCard}><IoInformationCircleOutline size={24} color="#6200EE"/><div style={s.detailCardTitle}>Status</div><div style={{...s.detailCardValue,...(past?s.statusPast:s.statusUpcoming)}}>{past?'Past':'Upcoming'}</div></div>
      </div></div>
      <div style={s.bookingContainer}>
        <button style={{...s.bookButton,...(past&&s.bookButtonDisabled)}} onClick={handleBook} disabled={past}><IoFilmOutline size={24}/><span>{past?'Event Ended':'Book Tickets'}</span></button>
        {past&&<p style={s.bookingNote}>Event already took place</p>}
      </div>
    </div>

    {bM&&<div style={s.modalOverlay} onClick={()=>setBM(false)}><div style={s.modalContent} onClick={e=>e.stopPropagation()}>
      <div style={s.modalHeader}><h2 style={s.modalTitle}>Book Tickets</h2><button style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setBM(false)}><IoClose size={24} color="#666"/></button></div>
      <div style={s.modalBody}>
        <div style={s.playTitleModal}>{p.title}</div>
        <div style={s.userInfo}>
          <div style={s.userInfoItem}><IoPerson size={16} color="#666"/><span style={s.userInfoText}>{u?.fullName||'User'}</span></div>
          <div style={s.userInfoItem}><IoMail size={16} color="#666"/><span style={s.userInfoText}>{u?.email||'No email'}</span></div>
          <div style={s.userInfoItem}><IoCall size={16} color="#666"/><span style={s.userInfoText}>{u?.phone||'No phone'}</span></div>
        </div>
        <div style={s.ticketTypeButtons}>{['regular','vip','vvip'].map(t=><div key={t} style={{...s.ticketTypeButton,...(tix===t&&s.ticketTypeButtonActive)}} onClick={()=>setTix(t)}><div style={{...s.ticketTypeButtonText,...(tix===t&&s.ticketTypeButtonTextActive)}}>{t.toUpperCase()}</div><div style={s.ticketTypePrice}>KES {getPrice(t)}</div></div>)}</div>
        <div style={s.inputGroup}><label style={s.inputLabel}>Quantity</label><div style={s.quantitySelector}><button style={s.quantityButton} onClick={()=>setQ(Math.max(1,q-1))}><IoRemove size={24} color="#6200EE"/></button><span style={s.quantityText}>{q}</span><button style={s.quantityButton} onClick={()=>setQ(q+1)}><IoAdd size={24} color="#6200EE"/></button></div><div style={s.quantityHelper}>{alloc.length} seat(s) allocated automatically</div></div>
        <div style={s.seatToggle} onClick={()=>setShowSeat(!showSeat)}><span style={s.seatToggleText}>{showSeat?'Hide Seat Map':'View Seat Map'}</span>{showSeat?<IoChevronUp size={20} color="#6200EE"/>:<IoChevronDown size={20} color="#6200EE"/>}</div>
        {showSeat&&<div style={s.seatDisplay}>
          <div style={s.seatLegend}>
            <div style={s.legendItem}><div style={{...s.legendColor,...s.legendRegular}}/><span style={s.legendText}>Regular</span></div>
            <div style={s.legendItem}><div style={{...s.legendColor,...s.legendVip}}/><span style={s.legendText}>VIP</span></div>
            <div style={s.legendItem}><div style={{...s.legendColor,...s.legendVvip}}/><span style={s.legendText}>VVIP</span></div>
            <div style={s.legendItem}><div style={{...s.legendColor,...s.legendAllocated}}/><span style={s.legendText}>Your seats</span></div>
            <div style={s.legendItem}><div style={{...s.legendColor,...s.legendUnavailable}}/><span style={s.legendText}>Taken</span></div>
          </div>
          <div style={s.seatAllocationInfo}><div style={s.seatAllocationText}>Your allocated seats ({tix.toUpperCase()}):</div><div style={s.allocatedSeatsText}>{alloc.length?alloc.map(s=>s.number).join(', '):'None'}</div></div>
          <div style={s.seatsGrid}>{allSeats.map(seat=>{
            const isAlloc=alloc.some(s=>s.id===seat.id);const isUnavail=!seat.available;
            let sty=s.seat;if(seat.type==='vip')sty={...sty,...s.seatVip};if(seat.type==='vvip')sty={...sty,...s.seatVvip};if(isAlloc)sty={...sty,...s.seatAllocated};if(isUnavail)sty={...sty,...s.seatUnavailable};
            return(<div key={seat.id} style={sty}><span style={{...s.seatText,...(isAlloc&&s.seatTextAllocated),...(isUnavail&&s.seatTextUnavailable)}}>{seat.number}</span>{seat.type!=='regular'&&<div style={{position:'absolute',bottom:2,right:2}}>{seat.type==='vip'?<IoStar size={8} color={isAlloc?'#fff':isUnavail?'#999':'#666'}/>:<IoDiamond size={8} color={isAlloc?'#fff':isUnavail?'#999':'#666'}/>}</div>}{isAlloc&&<IoCheckmarkCircle size={12} color="#fff" style={s.seatCheckmark}/>}</div>);
          })}</div>
          <div style={s.stageIndicator}><span style={s.stageText}>🎭 STAGE 🎭</span></div>
        </div>}
        <div style={s.priceSummary}>
          <div style={s.priceRow}><span style={s.priceLabel}>Ticket Price</span><span style={s.priceValueRow}>KES {getPrice(tix)}</span></div>
          <div style={s.priceRow}><span style={s.priceLabel}>Quantity</span><span style={s.priceValueRow}>× {q}</span></div>
          <div style={s.divider}/>
          <div style={{...s.priceRow,...s.totalRow}}><span style={s.totalLabel}>Total</span><span style={s.totalValue}>KES {total}</span></div>
        </div>
      </div>
      <div style={s.modalFooter}><button style={s.cancelButton} onClick={()=>setBM(false)}>Cancel</button><button style={{...s.confirmButton,...(alloc.length===0&&s.confirmButtonDisabled)}} onClick={handleConfirm} disabled={alloc.length===0}><IoArrowForward size={20}/><span>Proceed</span></button></div>
    </div></div>}

    {payM&&<div style={s.modalOverlay} onClick={()=>setPayM(false)}><div style={s.modalContent} onClick={e=>e.stopPropagation()}>
      <div style={s.modalHeader}><h2 style={s.modalTitle}>Complete Payment</h2><button style={{background:'none',border:'none',cursor:'pointer'}} onClick={()=>setPayM(false)}><IoClose size={24} color="#666"/></button></div>
      <div style={s.modalBody}>
        <div style={s.playTitleModal}>{p.title}</div><div style={s.paymentAmount}>KES {total}</div>
        <div style={s.paymentMethods}>
          {['mpesa','card','cash'].map(m=><div key={m} style={{...s.paymentMethod,...(payMethod===m&&s.paymentMethodActive)}} onClick={()=>setPayMethod(m)}>
            {m==='mpesa'?<IoPhonePortrait size={24} color={payMethod===m?'#6200EE':'#666'}/>:m==='card'?<IoCard size={24} color={payMethod===m?'#6200EE':'#666'}/>:<IoCash size={24} color={payMethod===m?'#6200EE':'#666'}/>}
            <span style={{...s.paymentMethodText,...(payMethod===m&&s.paymentMethodTextActive)}}>{m.toUpperCase()}</span>
          </div>)}
        </div>
        {payMethod==='mpesa'&&<div style={s.mpesaInstructions}><div style={s.instructionsTitle}>M-Pesa Instructions:</div><div style={s.instructionsText}>1. Go to M-Pesa menu</div><div style={s.instructionsText}>2. Lipa na M-Pesa</div><div style={s.instructionsText}>3. Paybill: 123456</div><div style={s.instructionsText}>4. Account: TICKET{id.slice(-6)}</div><div style={s.instructionsText}>5. Amount: KES {total}</div><div style={s.instructionsText}>6. Enter PIN</div></div>}
        <div style={s.inputGroup}><label style={s.inputLabel}>Payment Code *</label><input type="text" style={s.input} value={payCode} onChange={e=>setPayCode(e.target.value)} placeholder={payMethod==='mpesa'?'M-Pesa transaction code':'Payment reference'}/><div style={s.inputHelper}>Enter transaction code received after payment</div></div>
        <div style={s.paymentSummary}>
          <div style={s.paymentSummaryTitle}>Booking Summary</div>
          <div style={s.paymentRow}><span style={s.paymentLabel}>Event:</span><span style={s.paymentValue}>{p.title}</span></div>
          <div style={s.paymentRow}><span style={s.paymentLabel}>Tickets:</span><span style={s.paymentValue}>{q}×{tix.toUpperCase()}</span></div>
          <div style={s.paymentRow}><span style={s.paymentLabel}>Seats:</span><span style={s.paymentValue}>{alloc.map(s=>s.number).join(', ')}</span></div>
          <div style={s.paymentRow}><span style={s.paymentLabel}>Method:</span><span style={s.paymentValue}>{payMethod.toUpperCase()}</span></div>
          <div style={s.divider}/>
          <div style={{...s.paymentRow,...s.paymentTotal}}><span style={s.paymentTotalLabel}>Total:</span><span style={s.paymentTotalValue}>KES {total}</span></div>
        </div>
      </div>
      <div style={s.modalFooter}><button style={s.cancelButton} onClick={()=>setPayM(false)}>Back</button><button style={{...s.confirmButton,...(proc&&s.confirmButtonDisabled)}} onClick={processPay} disabled={proc}>{proc?<div className="spinner-small"/>:<><IoCheckmarkCircle size={20}/><span>Confirm</span></>}</button></div>
    </div></div>}
  </div>);
}
(()=>{const style=document.createElement('style');style.innerHTML=`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}.spinner{width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #6200EE;border-radius:50%;animation:spin 1s linear infinite}.spinner-small{width:20px;height:20px;border:3px solid #fff;border-top:3px solid transparent;border-radius:50%;animation:spin 1s linear infinite}`;document.head.appendChild(style);})();