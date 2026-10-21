(function(){
  var top=document.getElementById('top');
  var onScroll=function(){top.classList.toggle('scrolled',window.scrollY>8)};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  var mb=top.querySelector('.menu-btn');
  mb.addEventListener('click',function(){var o=top.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'});
  var drop=top.querySelector('.drop'),db=drop.querySelector('button');
  db.addEventListener('click',function(){var o=drop.classList.toggle('open');db.setAttribute('aria-expanded',o)});
  document.addEventListener('click',function(e){if(!drop.contains(e.target)){drop.classList.remove('open');db.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){drop.classList.remove('open');db.setAttribute('aria-expanded','false')}});
  var sel=document.getElementById('c-what');
  if(sel&&/interest=group/.test(location.search)){sel.value='group'}
})();
