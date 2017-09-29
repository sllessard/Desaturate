/*
Add a class to css of 'active'. This class will change your navigation elements when the user scrolls.
Whichever section is on the page will receive the styles placed in '.active'.

The code only recognizes elements in the <nav> of your html.
It uses the href tags to obtain the positions of your related section/article IDs.
I.e. your IDs and hrefs need to match and need to be valid IDs.

When the user scrolls down the 'active' class will change when the next section is 3/4 up the page.
When the user scrolls up the 'active' class will change when the divider bar of the current section hits the bottom of the browser. I.e. when the section is no longer in the browser, the divider itself has nothing to do with it.
*/


$(document).ready(function (){
  var visible = $('#catnap').css('height');
//nav tags array generated on ready, used to identify nav element to be active and article position on page
  var navs = $("nav a");
  var navIds = navs.map(function() { return $(this).attr('href');});
  var navIdsLength = navIds.length;
//Article position array generator
  var sectionPositions = [];
  var positionFinder = function(){
        sectionPositions.length = 0;
        for ( var i = 0; i < navIdsLength; i++) {
          var hT = $(navIds[i]).offset().top;
          sectionPositions.push(hT);
        }
      };
  
//Hidden section animation
  $('footer').click(function(){
    console.log(visible);
    if (visible === '0px'){
      $('#catnap').animate({height: '100%'}, 1000, function(){
        visible = $('#catnap').css('height');
      });
    } else {
      $('#catnap').animate({height: '0'}, 1000, function(){
        visible = $('#catnap').css('height');});
    }
  });
  

  
//Smooth scroll on nav click
  $('a[href*="#"]:not([href="#"])').click(function(){
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top
          }, 1000);
          return false;
        }
      }
  });

//Highlights correct nav element on load
 $(window).load(function(){
  
    positionFinder();
    for (var j = 0; j < sectionPositions.length; j++){
      var height = sectionPositions[j];
      if ($(window).scrollTop() > (height-(($(window).height())/4))){
        $('a[href="'+navIds[j-1]+'"]').removeClass('active');
        $('a[href="'+navIds[j]+'"]').addClass('active');
      }
    }
  });

//Lazy loader
  var images = $(".lazy");
  var imgSrc = images.map(function() {return $(this).attr('data-src');});
  var srcPos = [];
  var imgPositionFinder = function (){
  srcPos.length = 0;
  for ( var f = 0; f < imgSrc.length; f++) {
    var offs = $('img[data-src="'+imgSrc[f]+'"]').offset().top;
    srcPos.push(offs);
  }};
  imgPositionFinder();
  $(window).scroll(function () {
    var thisImg;
    for (var l =0; l < srcPos.length; l++){
      thisImg = ('img[data-src="'+imgSrc[l]+'"]');
      if (($(window).scrollTop() + $(window).height()) > srcPos[l] && $(thisImg).hasClass('lazy')){
        $(thisImg).attr("src",$(thisImg).attr("data-src"));
        $('img[data-src="'+imgSrc[l]+'"].lazy').animate({opacity: '1'}, 750);
        $(thisImg).removeAttr("data-src").removeClass("lazy");
        images = $(".lazy");
        imgSrc = images.map(function() {return $(this).attr('data-src');});
        positionFinder();
        imgPositionFinder();
      }
    }
  });

//Scroll functions
  var animated = false;
  var offset = $(window).scrollTop();
  
  $(window).scroll(function(){
//Scrolling down, active nav
  if (offset < $(window).scrollTop()){
    if (!animated) {
      animated = true;
      for (var k = 0; k < sectionPositions.length; k++){
        var height = sectionPositions[k];
        if ($(window).scrollTop() > (height-(($(window).height())/4)) && sectionPositions[k] > 0){
          $('a[href="'+navIds[k-1]+'"]').removeClass('active');
          $('a[href="'+navIds[k]+'"]').addClass('active');
        }
      }
      offset = $(window).scrollTop();
      animated = false;
    }
  }
  
//Scrolling up, active nav
  else if (offset > $(window).scrollTop()){
    if (!animated) {
      animated = true;
      for (var h = 0; h < sectionPositions.length; h++){
        var height2 = sectionPositions[h];
        if ($(window).height() -  3*$(window).height()/4 < (sectionPositions[h]) - $(window).scrollTop()){
          $('a[href="'+navIds[h]+'"]').removeClass('active');
          $('a[href="'+navIds[h-1]+'"]').addClass('active');
          {break;}
        }
      }
      offset = $(window).scrollTop();
      animated = false;
    }
  }
  });
});