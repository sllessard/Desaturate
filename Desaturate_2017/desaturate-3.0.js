$(document).ready(function(){
	var siteTitle = document.title;
	var imageLightboxActive = false;
	var textLightboxActive = false;
	var slide = $(".entryContent");
	var destinationUrl;
	var fadeSpeed = 300;
	var index = 0;
	var imageBox = false;
	var sliderImages = {};
	var sliderTracks ={};
	var blanketEntry = false;
	var scrollPosition = 0;
	var slidIn = false;
	var shortUrl;
	var pseudoModalUrl;
	var ias;
	var $container;
	var pageTitle;
	var infScroll = false;
	
	//Add hover effects to non-mobile
		function hoverAdder(){
			if (($( window ).width()/16) > 32.5) {
				$(".grid-item .hoverContainer, .nav_button_left, .nav_button_right, .externalLinks p").addClass("hoverClass");
			}
		}

	//Identify active page on load
		function loadedPage() {
			$("#ajaxLinks .active").removeClass("active");
		    $('.navLink a').each(function(){ //Uses loaded page section name to check against nav options. Adds class to highlight active page in nav.
		        if ($(this).text() == $("#sectionName").text()) {
		            $(this).addClass('active');
		            return false;
		        }
		    });
		    $('.mediaNavLink a').each(function(){
		        if ($(this).text() == $("#sectionName").text()) {
		            $(this).addClass('active');
		            return false;
		        }
		    });
		 //Change page tab title
		 if ($(".fullHeader h1").length > 0){
		 	pageTitle = $(".fullHeader h1").text();
		}
		if(pageTitle != undefined){
			document.title = siteTitle + " \xBB " + pageTitle; //Site title + Entry title if defined
		} else {
		 document.title = siteTitle; //Else only site title
		}
		 hoverAdder(); //Runs hoverAdder on newly loaded page
		}

	//Index display for modal images
		function indexPosition(index, length) {
			var position = index + 1;
			if ( length > 0) {
				$("#currentImageIndex").html(position);
				$("#totalImages").html(length);
			}
		}

	//Set Image to display in lightbox
		function lightboxImageDisplay (imageIndex, imagesObject) {
			var	windowHeight = $("#lightbox").height();
			$("#lightbox img").attr("src", imagesObject[imageIndex]);
			if($("#imageWrapper").innerHeight() > windowHeight) { //If image is larger than window do not center, center only when smaller than widnow
				$("#imageWrapper").removeClass("vertCenter");
				$("#imageWrapper").fadeTo(fadeSpeed, 1);
			} else {
				$("#imageWrapper").addClass("vertCenter");
				$("#imageWrapper").fadeTo(fadeSpeed, 1);
			}
		}

	//Close lightbox
		function closeLightbox() {
			imageLightboxActive = false; //Reset lightbox variables
			textLightboxActive = false;
			imageBox = false;
			index = 0;
			sliderImages= {};

			$("body").css("overflow-y","auto");

		 	$("#lightbox, #imageWrapper").fadeOut(fadeSpeed, function(){
		 		$("#imageWrapper").removeClass("vertCenter");
		 	});

		 	$(".pagButtons, .sequencePosition").css("display", "none");

			$("#lightboxAjax").empty().css("display", "none");
		}

	//Ajax call for update
		function runAjax(Url) {
			$.ajax({
				type: 'GET',
				url: Url,
				success: function(data){

					if (infScroll === true) { //Destory ias before new load
							$container.infiniteScroll("destroy");
							infScroll = false;
					}

					$('#ajaxContent').append().html(data);

					$("main").css("visibility", "visible"); //Display main

					$(".contentWrap").imagesLoaded(function(){ //Lazy load images
						$(window).lazyLoadXT();
					});

					if (blanketEntry === true && ($("#displayFull").length <= 0)){ //If previous page was pseudo and new page is not
 						blanketEntry = false;
 						$(".sidebarWrapper").css("opacity", 1);
 					}

					if ($("#ajaxContent div").hasClass("gridWrapper")){
						if ($(".sectionContent a").hasClass("infPag")){ //Initiate ias if grid uses infinite pag
							infiniteGrid();
						}
					} else if ($("#ajaxContent div").hasClass("feeder")) { //Initiate ias if feed uses infinite pag
						if ($(".feeder a").hasClass("infPag")){
							infiniteFeed();
						}
					}  else if ($("#displayFull").length > 0) { //Check for pseudo-modal, ex. Writing section
						blanketEntry = true;
						$(".sidebarWrapper").css("opacity", 0);
					}
					$('main').fadeTo(fadeSpeed, 1);
					$(window).scrollTop(0);
					loadedPage();
				},
				error: function() {
					window.location.replace("http://desaturate.net/404.html");
				}
			});
		}

	//Feed using infinite ajax scroll
		function infiniteFeed(){
			infScroll = true;
			$container = $(".feeder");
			$container.infiniteScroll({
			  append: ".sectionContent",
			  path: ".infPag",
			  prefill: true,
			  hideNav: "#infPag",
			  history: 'disable', //Prevent ias from updating history
			  scrollThreshold: 400
			});
		}
	//Grid using infinite ajax scroll
		function infiniteGrid(){
			infScroll = true;
			$container = $(".gridWrapper");
			$('.gridWrapper').imagesLoaded( function(){
				$container.infiniteScroll({
				  append: ".grid-item",
				  path: ".infPag",
				  prefill: true,
				  hideNav: "#infPag",
				  history: 'disable',
				  scrollThreshold: 400
				});

				$container.on('append.infiniteScroll', function() {
				    hoverAdder();
				});
			});
		}

//Initial page load
	loadedPage();
	$(window).lazyLoadXT();

	//Add hover events to non-mobile
		if (($( window ).width()/16) > 32.5) {
			$("#ajaxLinks a").addClass("hoverNav");
		}

	//Check for pseudo-modal
		 if ($("#displayFull").length > 0) {
		 	blanketEntry = true;
		 }

	//Initialization of ias
		if ($(".sectionContent a").hasClass("infPag")){
			infiniteGrid();
		} else if ($(".feeder a").hasClass("infPag")) {
			infiniteFeed();
		}
	
// Navigation and grid listeners

	//Handle back/forward buttons
	  	window.onpopstate = function() {
	  		if (imageLightboxActive || textLightboxActive === true){ //Closes lightbox if active
		 		closeLightbox();
	  		}

		    var path = location.pathname;
		    runAjax(path);
		    loadedPage();
	  	};
	//Nav and breadcrumb listener
		$(document).on('click', ".navLink a, .mediaNavLink a, .pageHeader a, .lightboxPath a:not(#pathEntryTitle), #pathSection, .entryHeader a", function(e) {
			e.preventDefault();
			destinationUrl = this.href;
			 if (imageLightboxActive || textLightboxActive === true){ //Closes lightbox if active
		 		closeLightbox();
	  		}

	  		if (slidIn === true && (($( window ).width()/16) < 32.5 )) { //Mobile nav handler/animation
	  			$("body").css("overflow","auto");
				$(".sidebarMediaBackground").animate({"opacity" : "0"}, function(){
					$(".sidebarMediaBackground").animate({"left": "-100%"}, 225);
						$("#pageCover div").animate({"height": "4.5625rem"}, 375, function(){
						$("#pageCover").animate({"opacity" : "0"}, 750, function(){
							$("#pageCover").css("left", "-100%");
									history.pushState('', '', destinationUrl);
									runAjax(destinationUrl);
						});
					});
				});
				slidIn = false;
	  		} else {
				history.pushState('', '', destinationUrl);
				runAjax(destinationUrl);
			}
		});

	//Grid cell listener
		$(document).on('click', ".grid-item:not('.externalPage')", function(e) {
			e.preventDefault();
			destinationUrl = this.href;
			history.pushState('', '', destinationUrl);
			runAjax(destinationUrl);
		});

	//Pesuedo-modal close
		$(document).on("click", ".mediaTitle, .mediaTitle em, #displayFull, #displayFull .contentWrap", function(e){
			if (e.target == this) {
			pseudoModalUrl = window.location.href;
			shortUrl=pseudoModalUrl.substring(0,pseudoModalUrl.lastIndexOf("/")); //On off click gets the section url and returns to imitate closing of image modals
			history.replaceState('', '', shortUrl);
			runAjax(shortUrl);}
		});

//Lightboxes

	//Lyrics Lightbox
		$(document).on('click', ".trackListing a", function(e) {
			var pathSection = $(".navLink .active"); //Used to set section breadcrumb and href below
			e.preventDefault();
			destinationUrl = this.href;
			textLightboxActive = true;
			scrollPosition = $(document).scrollTop();
			sliderTracks = $(this).closest(".trackListing").find("a").map(function(){
	 			return $(this).attr("href"); //creates array of images in entry for lightbox
	 		});
	 		
	 		for (var i = 0, len = sliderTracks.length; i < len; i++) { //Finds tracks index position for display in modal
		    	matchFound = sliderTracks[i].substring(sliderTracks[i].lastIndexOf('/') + 1) == destinationUrl.substring(destinationUrl.lastIndexOf('/') + 1);
		    	if(matchFound){
			    	index = i;
			        break;
		    	}
			}
	 			
		//Display index of in modal
			$(".sequencePosition").css("display", "block");
		 	indexPosition(index, sliderTracks.length);

			$("#pathSection").html(pathSection.text()).attr("href", pathSection.attr("href")); //Breadcrumb handlder
	 		$("#pathEntryTitle").text($("#entryName").text());
	 		if ($("#entryName").attr("class") === "italicTitle") {
	 			$("#pathEntryTitle").addClass("entryItalicTitle");
	 	}

			$.ajax({
				type: 'GET',
				url: destinationUrl,
				success: function(data){
					$('#lightboxAjax').addClass("flexClass").append().html(data);
					$("body").css("overflow-y", "hidden");
					$("#lightbox").css("display", "block");
					hoverAdder();
				}
			});
		});

	//Lyrics Lightbox Pagination
		$(document).on('click', "#lightboxAjax .nav_button", function(e){
			e.preventDefault();
			nextTrack = this.href;
			 			if ($(this).hasClass("moveRight")) {
	 				index -= 1;
	 				if (index < 0) {index = sliderImages.length -1; }
	 			} else {
					index += 1;
					if (index > (sliderImages.length - 1)) {index = 0;} 
	 			}
			$('#lightboxAjax').animate({opacity: 0}, fadeSpeed, function(){
				console.log("fadeout");
				$.ajax({
					type: 'GET',
					url: nextTrack,
					success: function(data){
							indexPosition(index, sliderTracks.length);
							$('#lightboxAjax').append().html(data).animate({opacity: 1}, fadeSpeed);
					},
					error: function() {
						window.location.replace("http://104.131.162.65/404.html");
					}
				});
			});
		});

 	//Image Lightbox
		$(document).on('click', ".lightboxSlide", function(e){
		 	var image_href = this.src;
		 	scrollPosition = $(document).scrollTop();
		 	sliderImages = $(this).closest(".entryContent").find(".lightboxSlide").map(function(){
		 		if($(this).attr("data-src") != undefined) {
		 			return $(this).attr("data-src"); //creates array of images in entry for lightbox
		 		} else {
		 			return $(this).attr("src");

		 		}
		 		});
		 	var	matchFound = false;
		 	var pathSection = $(".navLink .active"); //Used to set section breadcrumb and href below
		 	imageLightboxActive = true;
		 	e.preventDefault();
		 	$("#pathSection").html(pathSection.text()).attr("href", pathSection.attr("href"));
		 	if ($("#entryName").attr("class") === "italicTitle") {
		 		$("#pathEntryTitle").addClass("italicTitle");
		 	}
		 	$("#pathEntryTitle").text($("#entryName").text());

		//Check which image initiated modal to set displayed index
			for (var i = 0, len = sliderImages.length; i < len; i++) {
			    matchFound = sliderImages[i].substring(sliderImages[i].lastIndexOf('/') + 1) == image_href.substring(image_href.lastIndexOf('/') + 1);
			    if(matchFound){
			    	index = i;
			        break;
			    }
			}

 			$(".sequencePosition").css("display", "block");
    	 	indexPosition(index, sliderImages.length);

			if ( sliderImages.length > 1) { //Only show pag if more than one image
				$(".pagButtons, .imageLeft, .imageRight").css("display", "block");
				imageBox = true;
			}

		//Display lightbox
			$("#lightbox").css("display", "block").fadeIn(fadeSpeed, function(){
				$("body").css("overflow-y","hidden");
				lightboxImageDisplay(index, sliderImages);		
			});
		});

	//Close lightbox with off click
		$("#lightbox, #pathEntryTitle, #lightboxAjax").off().on("click", function(e){
			if (e.target === this) {
		 		closeLightbox();
		 		window.scroll(0, scrollPosition);
	 		}
 		});

	//Key handlers for lightbox
 		$(document).keyup(function(e) {
 			var keyPressed = e.which;
 			if (imageLightboxActive === true) {
	 			
	        	if (keyPressed == 27) { // esc keycode
				 		closeLightbox();
				 		window.scroll(0, scrollPosition);
	        	} else if (keyPressed == 39) { //Right arrow
	        		$(".imageRight").click();
	        	} else if (keyPressed == 37) { //Left arrow
	        		$(".imageLeft").click();
	        	}
	        } else if (textLightboxActive === true) {
	        	if (keyPressed == 27) {
				 	closeLightbox();
				 	window.scroll(0, scrollPosition);
	        	} else if (keyPressed == 39) {
	        		$(".moveLeft").click();
	        	} else if (keyPressed == 37) { 
	        		$(".moveRight").click();
	        	}
	        } else if (blanketEntry === true) {
	        	if (keyPressed == 27) {
	        		pseudoModalUrl = window.location.href;
	        		shortUrl=pseudoModalUrl.substring(0,pseudoModalUrl.lastIndexOf("/"));
	        		runAjax(shortUrl);
	        	} else if (keyPressed == 39) {
	        		$(".nav_button_right").click();
	        	} else if (keyPressed == 37) {
	        		$(".nav_button_left").click();
	        	}
	        }
   		});
//Lightbox pag

	//Image Pagination
		$(".boxPag").on("click", function(){
 			if ($(this).hasClass("leftImagePag")) {
 				index -= 1;
 				if (index < 0) {index = sliderImages.length -1;}
 			} else {
				index += 1;
				if (index > (sliderImages.length - 1)) {index = 0;} 
 			}
    	 	indexPosition(index, sliderImages.length);
    		$("#imageWrapper").fadeTo(fadeSpeed, 0, function(){
				lightboxImageDisplay(index, sliderImages);
    		});
 		});

 	//Image lightbox pag
		$(document).on('click', "#ajaxContent .nav_button_left, #ajaxContent .nav_button_right", function(e) {
			e.preventDefault();
			destinationUrl = this.href;

			if (imageLightboxActive === true){ //Closes lightbox if active
		 		closeLightbox();
	  		}

			history.pushState('', '', destinationUrl);
			runAjax(destinationUrl);
		});

	//Swipe event
		document.addEventListener('touchstart', handleTouchStart, false);        
		document.addEventListener('touchmove', handleTouchMove, false);

		var xDown = null;                                                        
		var yDown = null;                                                        

		function handleTouchStart(evt) {                                         
		    xDown = evt.touches[0].clientX;                                      
		    yDown = evt.touches[0].clientY;                                      
		}                                                

		function handleTouchMove(evt) {
		    if ( ! xDown || ! yDown ) {
		        return;
		    }

		    var xUp = evt.touches[0].clientX;                                    
		    var yUp = evt.touches[0].clientY;

		    var xDiff = xDown - xUp;
		    var yDiff = yDown - yUp;

		    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
		        if ( xDiff > 0 && imageLightboxActive === true ) {
		            $(".imageRight").click();
		        } else if ( xDiff <= 0 && imageLightboxActive === true) {
		            $(".imageLeft").click();
		        } else if ( xDiff > 0 && textLightboxActive === true ) {
		            $(".moveLeft").click();
		        } else if ( xDiff <= 0 && textLightboxActive === true) {
		            $(".moveRight").click();
		        }                     
		    } 
		    /* reset values */
		    xDown = null;
		    yDown = null;                                             
		}

//@Media Nav Slider 
	$(document).on("click", ".navButton", function(){
		if (slidIn === false) {
			$(".navButton").unbind(); //Prevent button from being clicked again until animation complete
			scrollPosition = $(document).scrollTop();
			$("#pageCover").css("left", "0%");
				$("#pageCover").animate({"opacity" : "1"}, 550, function(){
					$("main").css("visibility", "hidden");
					$("#pageCover div").animate({"height": "6rem"}, 350, function(){
						$(".sidebarMediaBackground").animate({"left": "0%"}, 0, function(){
							$(".sidebarMediaBackground").animate({"opacity" : "1"}, function(){
								$(".navButton").bind();
							});
							$("body").css("overflow","hidden");
						});		
					});
				});
			slidIn = true;
		} else {
			$(".navButton").unbind();
			$("body").css("overflow","auto");
			$("main").css("visibility", "visible");
			window.scroll(0, scrollPosition);
			$(".sidebarMediaBackground").animate({"opacity" : "0"}, function(){
				$(".sidebarMediaBackground").animate({"left": "-100%"}, 0);
				$("#pageCover div").animate({"height": "4.5625rem"}, 355, function(){
					$("#pageCover").animate({"opacity" : "0"}, 550, function(){
						$("#pageCover").css("left", "-100%", function(){
							$(".navButton").bind();
						});
					});
				});
			});
			slidIn = false;
		}
	});

});