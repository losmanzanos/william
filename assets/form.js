/* Contact form: EmailJS. The auto-reply to the sender is linked to the inquiry template inside EmailJS. */
(function(){
  var CFG={publicKey:'XY2vmSVWCmxE5XA6u',serviceId:'service_dft',notifyTemplate:'template_inquiry'};
  var f=document.getElementById('cf'); if(!f) return;
  var st=f.querySelector('.status'), btn=f.querySelector('[type=submit]'), sent=document.getElementById('sent');
  var ready=/^[A-Za-z0-9_-]{8,}$/.test(CFG.publicKey)&&!/^EMAILJS_/.test(CFG.publicKey)&&window.emailjs;
  if(ready) emailjs.init({publicKey:CFG.publicKey});
  function say(m,bad){st.textContent=m;st.classList.toggle('bad',!!bad)}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f.website.value) return;
    if(!f.checkValidity()){say('Please fill in your name and email, and check the box.',true);var bad=f.querySelector(':invalid');bad&&bad.focus();return}
    if(!ready){say('The form isn\u2019t connected yet. Please call or text (720) 495-3924, or email will@denverforwardtherapy.com.',true);return}
    btn.disabled=true;say('Sending\u2026');
    var sel=f.interest, interest=sel.options[sel.selectedIndex].text;
    var data={who:f.who.value,age:f.age.value,interest:interest,name:f.elements.name.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim()||'Not given',message:f.message.value.trim()||'(No message)'};
    emailjs.send(CFG.serviceId,CFG.notifyTemplate,data).then(function(){
      f.hidden=true;sent.hidden=false;sent.focus({preventScroll:true});sent.scrollIntoView({behavior:'smooth',block:'center'});
    }).catch(function(){
      btn.disabled=false;say('Something went wrong on our end. Please call or text (720) 495-3924, or email will@denverforwardtherapy.com.',true);
    });
  });
})();
