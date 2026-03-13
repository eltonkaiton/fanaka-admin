import React from "react";

function HelpScreen() {
  return (
    <div style={styles.container}>

      <h1 style={styles.title}>Help & Support</h1>

      <p style={styles.text}>
        Need assistance? Here are some helpful tips:
      </p>

      <p style={styles.item}>• Register or login to access the latest plays.</p>
      <p style={styles.item}>• Browse upcoming plays on the home screen.</p>
      <p style={styles.item}>• Click on a play to see details and book tickets.</p>
      <p style={styles.item}>• For further inquiries, use the Contact Us section.</p>
      <p style={styles.item}>• Ensure your account is active before booking.</p>

    </div>
  );
}

const styles = {

container:{
minHeight:"100vh",
padding:"20px",
backgroundColor:"#f8f8f8",
display:"flex",
flexDirection:"column",
justifyContent:"flex-start",
maxWidth:"800px",
margin:"auto"
},

title:{
fontSize:"24px",
fontWeight:"bold",
marginBottom:"15px",
textAlign:"center",
color:"#6200EE"
},

text:{
fontSize:"16px",
marginBottom:"10px",
color:"#333"
},

item:{
fontSize:"16px",
marginBottom:"8px",
color:"#555"
}

};

export default HelpScreen;