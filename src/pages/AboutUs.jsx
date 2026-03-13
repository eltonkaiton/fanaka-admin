import React from "react";
import {
  IoArrowBack,
  IoHeart,
  IoPeople,
  IoStar,
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoYoutube
} from "react-icons/io5";
import { FaTheaterMasks } from "react-icons/fa";

function AboutUs() {

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div style={styles.page}>

      {/* Back Button */}
      <button style={styles.backButton} onClick={() => window.history.back()}>
        <IoArrowBack size={24} color="#6200EE"/>
      </button>

      {/* Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logoCircle}>
          <FaTheaterMasks size={50} color="#6200EE"/>
        </div>
      </div>

      <h1 style={styles.title}>Fanaka Arts</h1>
      <p style={styles.subtitle}>Bringing Stories to Life</p>

      {/* Who We Are */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Who We Are</h3>
        <p style={styles.text}>
        Fanaka Arts is a premier platform dedicated to showcasing the finest
        theatrical plays and cultural performances. We bridge the gap between
        talented artists and enthusiastic audiences.
        </p>
      </div>

      {/* What We Do */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>What We Do</h3>
        <p style={styles.text}>
        We provide audiences with a seamless way to explore, book and enjoy
        a diverse range of cultural events from traditional plays to
        contemporary performances.
        </p>
      </div>

      {/* Mission */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Our Mission</h3>
        <p style={styles.text}>
        Our mission is to connect audiences with artists and enhance the
        cultural experience in our community through storytelling.
        </p>
      </div>

      {/* Core Values */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Our Core Values</h3>

        <div style={styles.valueItem}>
          <IoHeart color="#6200EE"/>
          <div>
            <b>Passion for Arts</b>
            <p style={styles.smallText}>Promoting theatrical arts</p>
          </div>
        </div>

        <div style={styles.valueItem}>
          <IoPeople color="#6200EE"/>
          <div>
            <b>Community First</b>
            <p style={styles.smallText}>Connecting artists and audiences</p>
          </div>
        </div>

        <div style={styles.valueItem}>
          <IoStar color="#6200EE"/>
          <div>
            <b>Excellence</b>
            <p style={styles.smallText}>Only the best performances</p>
          </div>
        </div>

      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div>
          <h2 style={styles.statNumber}>50+</h2>
          <p>Plays</p>
        </div>

        <div>
          <h2 style={styles.statNumber}>100+</h2>
          <p>Artists</p>
        </div>

        <div>
          <h2 style={styles.statNumber}>1000+</h2>
          <p>Audience</p>
        </div>
      </div>

      {/* Contact */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Get in Touch</h3>

        <p style={styles.link} onClick={()=>openLink("mailto:info@fanakaarts.com")}>
          <IoMailOutline/> info@fanakaarts.com
        </p>

        <p style={styles.link} onClick={()=>openLink("tel:+1234567890")}>
          <IoCallOutline/> +1 (234) 567-890
        </p>

        <p style={styles.link} onClick={()=>openLink("https://fanakaarts.com")}>
          <IoGlobeOutline/> www.fanakaarts.com
        </p>

        <p style={styles.link}>
          <IoLocationOutline/> Nairobi, Kenya
        </p>

      </div>

      {/* Social */}
      <div style={styles.box}>
        <h3 style={styles.sectionTitle}>Follow Us</h3>

        <div style={styles.social}>
          <IoLogoFacebook size={24} color="#3b5998"/>
          <IoLogoTwitter size={24} color="#1da1f2"/>
          <IoLogoInstagram size={24} color="#e4405f"/>
          <IoLogoYoutube size={24} color="#ff0000"/>
        </div>
      </div>

      <p style={styles.copyright}>
        © {new Date().getFullYear()} Fanaka Arts. All rights reserved.
      </p>

    </div>
  );
}

const styles = {

page:{
padding:20,
background:"#f8f8f8",
fontFamily:"Arial",
maxWidth:800,
margin:"auto"
},

backButton:{
border:"none",
background:"transparent",
cursor:"pointer"
},

logoContainer:{
display:"flex",
justifyContent:"center",
marginTop:20
},

logoCircle:{
width:100,
height:100,
borderRadius:50,
background:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
margin:"auto",
boxShadow:"0 2px 8px rgba(0,0,0,0.1)"
},

title:{
textAlign:"center",
color:"#6200EE"
},

subtitle:{
textAlign:"center",
color:"#666",
marginBottom:20
},

box:{
background:"#fff",
padding:16,
borderRadius:10,
marginBottom:15,
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
},

sectionTitle:{
color:"#6200EE"
},

text:{
color:"#555"
},

valueItem:{
display:"flex",
gap:10,
alignItems:"center",
marginTop:10
},

smallText:{
margin:0,
fontSize:13,
color:"#666"
},

stats:{
display:"flex",
justifyContent:"space-around",
background:"#fff",
padding:20,
borderRadius:10,
marginBottom:15
},

statNumber:{
color:"#6200EE"
},

link:{
cursor:"pointer",
color:"#444"
},

social:{
display:"flex",
justifyContent:"center",
gap:20
},

copyright:{
textAlign:"center",
fontSize:12,
color:"#999",
marginTop:20
}

};

export default AboutUs;