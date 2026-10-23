(function(){
  var d=document,top=d.getElementById('top'),hero=d.querySelector('.hero');
  requestAnimationFrame(function(){d.body.classList.add('loaded')});
  function onScroll(){
    if(!hero){top.classList.add('light');return}
    top.classList.toggle('light',window.scrollY>hero.offsetHeight-80);
  }
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});

  var mb=top.querySelector('.menu-btn');
  mb.addEventListener('click',function(){var o=top.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'});
  var drop=top.querySelector('.drop'),db=drop.querySelector('button');
  db.addEventListener('click',function(){var o=drop.classList.toggle('open');db.setAttribute('aria-expanded',o)});
  d.addEventListener('click',function(e){if(!drop.contains(e.target)){drop.classList.remove('open');db.setAttribute('aria-expanded','false')}});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){drop.classList.remove('open');db.setAttribute('aria-expanded','false')}});
  // hover image: only while the pointer is on a service title
  var hv=d.getElementById('hover');
  if(hv&&matchMedia('(hover:hover)').matches){
    var imgs=hv.querySelectorAll('img');
    d.querySelectorAll('.service').forEach(function(s){
      var t=s.querySelector('h3 .ul'),i=+s.dataset.img;
      t.addEventListener('mouseenter',function(){imgs.forEach(function(m,k){m.classList.toggle('on',k===i)});hv.classList.add('on')});
      t.addEventListener('mouseleave',function(){hv.classList.remove('on')});
      t.addEventListener('mousemove',function(e){hv.style.transform='translate('+(e.clientX+24)+'px,'+(e.clientY-hv.offsetHeight/2)+'px)'});
    });
  }

  var sel=d.getElementById('c-what');
  if(sel&&/interest=group/.test(location.search)){sel.value='group'}
})();
