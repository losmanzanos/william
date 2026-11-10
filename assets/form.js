/* Contact form. Primary: /api/contact (Cloudflare Pages Function + Resend).
   Backup: EmailJS, used only if the primary path is down. The EmailJS auto-reply is linked inside EmailJS. */
(function(){
  var EJ={publicKey:'XY2vmSVWCmxE5XA6u',serviceId:'service_dft',template:'template_inquiry'};
  var f=document.getElementById('cf'); if(!f) return;
  var st=f.querySelector('.status'), btn=f.querySelector('[type=submit]'), sent=document.getElementById('sent');
  var FALLBACK='Something went wrong on our end. Please call or text (720) 495-3924, or email will@denverforwardtherapy.com.';
  function say(m,bad){st.textContent=m;st.classList.toggle('bad',!!bad)}
  function done(){f.hidden=true;sent.hidden=false;sent.focus({preventScroll:true});sent.scrollIntoView({behavior:'smooth',block:'center'})}
  function viaEmailJS(data){
    if(!window.emailjs) return Promise.reject(new Error('emailjs unavailable'));
    return emailjs.send(EJ.serviceId,EJ.template,data,{publicKey:EJ.publicKey});
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f.website.value) return;
    if(!f.checkValidity()){say('Please fill in your name and email, and check the box.',true);var bad=f.querySelector(':invalid');bad&&bad.focus();return}
    btn.disabled=true;say('Sending…');
    var sel=f.interest;
    var data={who:f.who.value,age:f.age.value,interest:sel.options[sel.selectedIndex].text,name:f.elements.name.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim(),message:f.message.value.trim()};
    var ej={who:data.who,age:data.age,interest:data.interest,name:data.name,email:data.email,phone:data.phone||'Not given',message:data.message||'(No message)'};
    fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {status:r.status,body:j}})},
            function(){return {status:0,body:{}}})
      .then(function(res){
        if(res.status===200&&res.body.ok) return done();
        if(res.status===400){btn.disabled=false;say(res.body.error||'Please check the form and try again.',true);return}
        return viaEmailJS(ej).then(done,function(){btn.disabled=false;say(FALLBACK,true)});
      });
  });
})();
