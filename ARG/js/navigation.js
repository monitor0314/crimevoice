/* 頁面切換、返回與首頁位置記憶 */
const HOME_VIEWS=new Set(['news','newsProfile','profile','alt']);

function showView(v,previous=state.view,addHistory=true){
  if(!$('#'+v+'View'))return;

  const endingAudio=$('#endingAudio');
  if(v==='ending'){
    endingAudio.currentTime=0;
    endingAudio.play().catch(()=>{});
  }else if(state.view==='ending'){
    endingAudio.pause();
    endingAudio.currentTime=0;
  }

  if(HOME_VIEWS.has(state.view)&&!HOME_VIEWS.has(v)){
    state.lastHomeView=state.view;
    state.homeScrolls[state.view]=window.scrollY;
  }

  state.previous=previous;
  state.view=v;
  if(HOME_VIEWS.has(v))state.lastHomeView=v;

  $$('.view').forEach(view=>{
    view.classList.remove('active');
  });

  $('#'+v+'View').classList.add('active');

  const root=v==='news';

  $('#backBtn').classList.toggle(
    'hidden',
    root||['messages','search','activity','viewer'].includes(v)
  );

  $('#searchBtn').classList.toggle(
    'hidden',
    v!=='profile'
  );

  if(
    addHistory &&
    history.state?.argView!==v
  ){
    history.pushState(
      {
        argView:v,
        previousView:previous
      },
      ''
    );
  }

  scrollTo(0,0);
}

function openRememberedHome(){
  if(HOME_VIEWS.has(state.view)){
    showView('news',state.view);
    renderNews();
    return;
  }

  const target=state.lastHomeView||'news';
  const savedScroll=state.homeScrolls[target]||0;
  showView(target,state.view);
  requestAnimationFrame(()=>scrollTo(0,savedScroll));
}
