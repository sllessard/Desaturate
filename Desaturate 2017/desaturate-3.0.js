import {lazyLoad} from './src/lazyLoad-1.0';

let modalOpen = false;

//Handles title, active nav indicator and infinite scroll
let pageInit = (function () {
	const siteTitle = document.title;
	let currentPag = '';
	let nextPag = '';

	function titleCreate() { //Head Title creator
		let pageTitle = $(".fullHeader h1").text();

		if(pageTitle !== ""){
			document.title = siteTitle + " \xBB " + pageTitle; //Site title + Entry title if defined
		} else {
		 document.title = siteTitle; //Only site title

		}
		
	}

	function loadedPage() {
		$(".ajaxLinks .active").removeClass("active");
    $('.navLink a').each(function(){ //Adds class to highlight active page in nav.
    	if ($(this).text() == $("#sectionName").text()) {
    		$(this).addClass('active');
    		return false;
    	}
  	});
	}

  function initiate() {
  	let el = $(".unicorn");

  	if ($('#infPag').length > 0) {
  		if ((el.position().top + el.outerHeight(true)) <= (($(window).scrollTop() + $(window).height()) + 100)) {
  			scrollAjax();
  		} else {
  			$(document).scroll(function(){	
  				$(document).off('scroll');
  				if ((el.position().top + el.outerHeight(true)) <= (($(window).scrollTop() + $(window).height()) + 400)) {
  					scrollAjax();
  				} else { setTimeout(function(){
  					initiate();
  				}, 250); }
  			});
  		}
  	}
  }

  function scrollAjax() {
  	$.ajax({
  		type: 'GET',
  		url: $('#infPag a').attr('href'),
  		success: function(data){
  			let newItems = $(data).find('.uniemb');
  			nextPag = $(data).find('.infPag').attr('href');
  			$('.unikin').append(newItems);
  			if (currentPag !== nextPag) {
  				$('#infPag a').attr('href', $(data).find('.infPag').attr('href'));

  				if (nextPag === undefined) {

  					return;
  				} else {	
  					currentPag = nextPag;
  					setTimeout(function(){
  						initiate();
  					}, 250);
  				}
  			}
  		}
  	});
  }

  document.addEventListener('touchstart', function removeHover(){
  	$('html').removeClass("noTouch");
  	document.removeEventListener('touchstart', removeHover, false);
  });

  return {
  	ajaxLoad: () => {
  		lazyLoad();
  		loadedPage();
  		initiate();
  		titleCreate();
  	}
  };
})();

//Image and text modals with key and touch handlers
let modal = (function()	{

	let displayedIndex = 0;
	let modalArray =[];
	let modalType = "none";
	let xDown = null;
	let fadeSpeed = 300;                                         
	let yDown = null; 


	function modalArrayBuilder($that, itemsContainer, item, dataRef, lazyRef) { //Create array of other modal items in restricted section for pagination
		modalArray = $that.closest(itemsContainer).find(item).map(function(index){

			if($(this).attr(lazyRef) !== undefined) {
	 			if ($that.attr(lazyRef) == $(this).attr(lazyRef)) { //Get index of element clicked
	 				displayedIndex = index;
	 			}
	 			return $(this).attr(lazyRef); //Used for when images and lazy loaded and src has not been applied
	 		} else { 
		 		if ($that.attr(dataRef) == $(this).attr(dataRef)) { //Get index of element clicked
		 			displayedIndex = index;
		 		}
		 		return $(this).attr(dataRef);
		 	}
		});

		indexPosition();
		return modalArray;
	}

	function indexPosition() {
		let length = modalArray.length;

		$("#currentImageIndex").html(displayedIndex + 1);
		$("#totalImages").html(length);
	}

	function breadcrumbCreator() {
		let pathSection = $(".navLink .active");

		$(".pathSection").html(pathSection.text()).attr("href", pathSection.attr("href")); 
		$("#pathEntryTitle").text($("#entryName").text());
		if ($("#entryName").attr("class") === "italicTitle") {
			$("#pathEntryTitle").addClass("entryItalicTitle");
		}
	}

	function modalImageDisplay() {
		let	windowHeight = $("#lightbox").height();
		$("#lightbox img").attr("src", modalArray[displayedIndex]);
		if($("#imageWrapper").innerHeight() > windowHeight) { //If image is larger than window do not center
			$("#imageWrapper").removeClass("vertCenter").fadeTo(fadeSpeed, 1);
		} else {
			$("#imageWrapper").addClass("vertCenter").fadeTo(fadeSpeed, 1);
		}
	}

	function modalTextDisplay() {
		$.ajax({
			type: 'GET',
			url: modalArray[displayedIndex],
			success: function(data){
				$('#textWrapper').empty().append(data).fadeTo(fadeSpeed, 1);
			}
		});
	}

	function toggleModal(contentDisplay) {

		pagDisplay();

		if ($("#lightbox").css("display") === "none") {
			modalOpen = true;
			breadcrumbCreator();
			
			modalArray.length > 1 ? $(".pagButtons").css("display", "block") : $(".pagButtons").css("display", "none");

			$("#lightbox").css("display", "block").fadeIn(fadeSpeed, function(){
				$("body").css("overflow-y","hidden");	
				switch (modalType) {

					case 'image':
					modalImageDisplay();
					break;

					case 'text':
					$("#textWrapper").addClass('flexClass', modalTextDisplay());
					break;
				}

			});
		} else {
			modalOpen = false;
			$("#lightbox").fadeOut(fadeSpeed, function(){
				$("#textWrapper").empty().removeClass('flexClass').css("opacity", "0");
				$("#imageWrapper img").attr('src', '#');
				$("#imageWrapper").css("opacity", "0")
				$("body").css("overflow-y","auto");
				document.removeEventListener('touchstart', handleTouchStart, false);        
				document.removeEventListener('touchmove', handleTouchMove, false);
			});
		}
	}

	function pagDisplay() {
		if (modalArray.length > 1){
			$(".pagButtons").toggle();
			document.addEventListener('touchstart', handleTouchStart, false);        
			document.addEventListener('touchmove', handleTouchMove, false);
			if (modalType === "image") {
				$(".imageLeft, .imageRight").toggle();
			}
		}
	}

	function modalPag($that) {
		if ($that.hasClass("leftImagePag")) {
			displayedIndex -= 1;
			if (displayedIndex < 0) {displayedIndex = modalArray.length -1; }
		} else {
			displayedIndex += 1;
			if (displayedIndex > (modalArray.length - 1)) {displayedIndex = 0;} 
		}
		indexPosition();

		switch (modalType) {
			case 'image':
				$("#imageWrapper").fadeTo(fadeSpeed, 0, function(){
					modalImageDisplay();
				});
				break;

			case 'text':
				$("#textWrapper").fadeTo(fadeSpeed, 0, function(){
					modalTextDisplay();
				});
				break;
		}
	}

	function keyEvents(keyPressed) {
		if (modalOpen === true) {
			switch (modalType) {

				case 'image': 
	      	if (keyPressed == 27) { // esc keycode
	      		toggleModal();
				 		//window.scroll(0, scrollPosition);
	      	} else if (keyPressed == 39) { //Right arrow
	      		$(".imageRight").click();
	      	} else if (keyPressed == 37) { //Left arrow
	      		$(".imageLeft").click();
	      	} break;

	      case 'text':
	      	if (keyPressed == 27) {
	      		toggleModal();
					 	//window.scroll(0, scrollPosition);
					 } else if (keyPressed == 39) {
					 	$(".imageRight").click();
					 } else if (keyPressed == 37) { 
					 	$(".imageLeft").click();
					 }
			}
		}
	}

	function handleTouchStart(evt) {                                         
		xDown = evt.touches[0].clientX;                                      
		yDown = evt.touches[0].clientY;                                      
	}

	function handleTouchMove(evt) {
		if ( ! xDown || ! yDown ) {
			return;
		}

		let xUp = evt.touches[0].clientX;                                    
		let yUp = evt.touches[0].clientY;

		let xDiff = xDown - xUp;
		let yDiff = yDown - yUp;

		if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
			if ( xDiff > 0) {
				$(".imageRight").click();
			} else if ( xDiff <= 0) {
				$(".imageLeft").click();
			}                  
		} 
		/* reset values */
		xDown = null;
		yDown = null;                                             
	}

	return {
		arrayBuilder: modalArrayBuilder,
		visibleImageModal: () => {
			modalType = 'image';
			toggleModal();
		},
		visibleLyricsModal: () => {
			modalType = 'text';
			toggleModal();
		},
		toggleModal: toggleModal,
		pagination: modalPag,
		keyEvents: keyEvents
	};
})();

//Ajax and resize navigation
let pageChange = (function() {
	let mediaNavVisible = false;

	function ajaxLoad(Url) {
		$.ajax({
			type: 'GET',
			url: Url,
			success: function(data){

				if (mediaNavVisible === true && (($( window ).width()/16) <= 32.5)) {
					mediaNav();
				}

				$('#ajaxContent').append().html(data);
				$(window).scrollTop(0);
				pageInit.ajaxLoad();
			},
			error: function() {
				window.location.replace("http://desaturate.net/404.html");
			}
		});
	}

	function mediaNav() {
		if (mediaNavVisible === false) {
			mediaNavVisible = true;
			$(".sidebarWrapper").css("left", "0");
			$(".pageHeader").animate({"height": "6rem"});
			$(".pageHeader p, .pageTitle, nav").animate({"opacity": "1"}, ()=>{
				if (($( window ).width()/16) <= 32.5) {
					$("body").css("overflow","hidden");
				} else {
					$("body").css("overflow","auto");
				}
			});
			$(window).off('resize');
		} else {
			mediaNavVisible = false;
			$("body").css("overflow","auto");
			$(".pageHeader").animate({"height": "4.5625rem"});
			$(".pageHeader p, .pageTitle, nav").animate({"opacity": "0"}, ()=>{
				$(".sidebarWrapper").css("left", "-100%");
			});
			$(window).on('resize', function() {
				if (($( window ).width()/16) > 32.5) {
					mediaNav();
				} 
			});
		}
	}

	return {
		runAjax: ajaxLoad,
		mediaNav: mediaNav
	};

})();

pageInit.ajaxLoad();

//Open Modal
$(document).on('click', ".lightboxSlide, .trackSlide", function(e){
	let $that = $(this);

	e.preventDefault();

	if ($(this).hasClass('lightboxSlide')) {
		modal.arrayBuilder($that, ".entryContent", ".lightboxSlide", "src", "data-src");
		modal.visibleImageModal();
	} else if ($(this).hasClass('trackSlide')){
		modal.arrayBuilder($that, ".trackListing", ".trackSlide", "href", "data-href");
		modal.visibleLyricsModal();
	}
});

//Close modal
$("#lightbox, #pathEntryTitle").on("click", function(e){
	if (e.target === this) {
		modal.toggleModal();
	}
});

//Modal Pagination
$(".boxPag").on("click", function(){
	let $that = $(this);
	modal.pagination($that);
});

//Modal Key events
$(document).keyup(function(e) {
	var keyPressed = e.which;
	modal.keyEvents(keyPressed);
});

//Ajax navigation
$(document).on('click', ".nav_button_left, .nav_button_right, .navLink a, .mediaNavLink a, .pageHeader a, .lightboxPath a:not(#pathEntryTitle), #pathSection, .entryHeader a, .grid-item:not('.externalPage')", function(e) {
	e.preventDefault();
	let destinationUrl = this.href;

	if (modalOpen === true) {
		modal.visibleImageModal();
	}
	history.pushState('', '', destinationUrl);
	pageChange.runAjax(destinationUrl);
});


window.onpopstate = function() {
	let path = location.pathname;
	if (modalOpen === true) {
		modal.visibleImageModal();
	}
	pageChange.runAjax(path);
};


$(document).on("click", ".mediaTitle, .mediaTitle em, #displayFull, #displayFull .contentWrap", function(e){
	if (e.target == this) {
		pseudoModalUrl = window.location.href;
		let sectionUrl = pseudoModalUrl.substring(0,pseudoModalUrl.lastIndexOf("/")); //Off click gets the section url and returns to imitate closing of image modals
		history.replaceState('', '', sectionUrl);
		pageChange.runAjax(sectionUrl);
	}
	});

$(document).on("click", ".navButton", function(){
	pageChange.mediaNav();
});
