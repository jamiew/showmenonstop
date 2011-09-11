// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require swfobject
//= require jquery.easing.1.3
//= require jquery_ujs
//= require_tree .


// globals
var megaplaya = false;
var search_visible = true;


// parse any hashbangs and use that as search right away
$(document).ready(function(){

  load_player();
  redraw();

  $('#background').click(skip_video);

  if(window.location.hash){
    set_query_from_hash();
  }
  else {
    randomize_query();
  }

});

$(window).bind('hashchange', function() {
  set_query_from_hash();
  search();
});

$(window).resize(redraw);


function redraw() {
  $('#player').css('height', $(window).height() + 'px');
  $('#player').css('width', $(window).width() + 'px');

  $('#background').css('height', $(window).height() + 'px');
  $('#background').css('width', $(window).width() + 'px');

  if (search_visible) {
    $('#showme').css('top', ($('#search_wrapper').position().top - $('#showme').height() + 60) + 'px');
  }
  else {
    $('#showme').css('top', ($(window).height() - $('#showme').height()) + 'px');
  }
  $('#showme').css('left', ($(window).width() / 2 - $('#showme').width() / 2) + 'px');

  $('#search_wrapper').css('width', $(window).width() + 'px');
  $('#search_wrapper').css('top', $(window).height() / 2 - 243 / 2);
  // TODO if doc-width < #search_wrapper width, offset it so things remain centered
}

function skip_video(){
  if(!megaplaya){
    debug("Megaplaya not loaded, can't skip yet");
    return false;
  }

  debug("Skipping video...");
  megaplaya.api_nextVideo();
}

function get_query(){
  return $('#query')[0].value;
}

function set_query(query){
  $('#query')[0].value = query;
}

function set_query_from_hash(){
  if(window.location.hash) {
    var hash = window.location.hash.replace('#', '');
    set_query(decodeURIComponent(hash));
  }
}

function randomize_query(){
  var queries = ['kitties', 'kid cudi', 'tree frogs', 'kids jumping off sheds', 'ytmnds'];
  query = shuffle(queries)[0];
  set_query(query);
}

function search(){
  var query = get_query();
  debug(">> search() query="+query);

  var encoded = '#'+encodeURIComponent(query);
  window.location.hash = encoded;

  $('#title').hide();
  $('#player').show();
  hide_search();
  search_youtube(query);
  // search_vimeo(query);

  return false;
}

function load_player(){
  debug(">> load_player()");

  $('#player').flash({
    swf: 'http://vhx.tv/embed/megaplaya',
    width: '100%;',
    height: '100%',
    allowFullScreen: true,
    allowScriptAccess: "always"
  });
}

function toggle_search(){
  if(search_visible){
    hide_search();
  }
  else {
    show_search();
  }
}

function show_search(){
  debug("show_search()");

  if (search_visible){
    debug("show_search(): already visible, skipping");
    //return;
  }

  // $('#showme').css('position', 'static');
  $('#showme').animate({ top: ($('#search_wrapper').position().top - $('#showme').height() + 60) + 'px' }, 1500, 'easeOutElastic');
  $('#search').fadeIn('fast', function(){ $('#query').select(); });
  search_visible = true;
}

function hide_search(){
  $('#background').css('background', 'transparent');
  if(!search_visible){
    return;
  }
  $('#showme').animate({ top: ($(window).height() - $('#showme').height()) + 'px'}, 1500, 'easeOutElastic');
  $('#search').fadeOut('slow'); // immediately
  search_visible = false;
}

function megaplaya_loaded(){
  debug(">> megaplaya_loaded()");
  megaplaya = $('#player').children()[0];
  megaplaya.api_disable();

  $('#player').click(function(){
    alert('test');
  });

  if(window.location.hash){
    debug("hash is present, executing searching!");
    $('#search').hide();
    search();
  }
  else {
    show_search();
  }
}

function search_vimeo(query){
  // TODO; Vimeo API requires authentication for search :-(
  /*
  $.ajax({
    type: "GET",
    url: "http://vimeo.com/api/v2/jamiew/videos.json",
    dataType: "jsonp",
    success: function(videos, status, ajax) {
      debug(">> load_videos().success");
      if(videos) {
        megaplaya.api_playQueue(videos);
      }
      else {
        $('#title').html("No videos found :(").fadeIn();
      }
    }
  });
  */
}

function search_youtube(query){
  debug(">> search_youtube() query="+query);
  var results = 50;
  var script = document.createElement('script');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', 'http://gdata.youtube.com/feeds/videos?vq=' + query +
         '&max-results=' + results + '&alt=json-in-script&' +
         'callback=search_youtube_callback&orderby=relevance&' +
         'sortorder=descending&format=5&fmt=18');
  document.documentElement.firstChild.appendChild(script);
}

function search_youtube_callback(resp){
  debug(">> search_youtube_callback()");
  if(resp.feed.entry == undefined) {
    set_query("No results, sorry dawg");
    show_search();
    return false;
  }

  var urls = $.map(resp.feed.entry, function(entry,i){ return {url: entry.link[0].href}; });
  debug(urls);

  urls = shuffle(urls);
  return megaplaya.api_playQueue(urls);
}

function debug(string){
  try {
    console.log(string);
  } catch(e) { }
}

function shuffle(v){
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i, 0), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
}
