// start reader js

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const seriesinput = urlParams.get('series');
const numinput = urlParams.get('num');
var number = "" + numinput;     // this isn't the true chapter number if series has skipped chapters/previews/etc

var series = "" + seriesinput;

try { number = Number(number); } catch(err) {window.location.replace("/projects?n=" + series);}; // go to series page if num isn't a valid number

var togglenum = 0;
var preloadNum = 5;
var waiting = false;

var widthClass = "fixedwidth800" // set default
var widthName = "Small" // set default

if (localStorage.getItem("widthClass") === null || localStorage.getItem("widthName") === null) {
	// if either is null, use defaults
} else {
	widthClass = localStorage.getItem("widthClass");
	widthName = localStorage.getItem("widthName");
}

getimages(number);

// Start Get images function for the reader
	
function getimages(x) {
  return new Promise(resolve => {
	alasql.promise("SELECT series, projectname, projectrating, projectformat, chname, num, AlbumID FROM json('/json/chapters') where projectname = '" + series + "' and num = " + x
	).then(function(results){
		var albumID = "";
		var embedtitle = "";
		var proj = results[0];
		
		var imgclass = "";
		var projectFormat = "";
			
			try {
				var embedtitle = proj.chname.replace("Chapter ", "Ch") + " | " + proj.series + " | Sunshine Butterfly";
				document.title = embedtitle ;
				albumID = proj.AlbumID;
				var form = new FormData();
				var settings = {
				  "url": "https://api.imgur.com/3/album/" + albumID + "/images",
				  "method": "GET",
				  "timeout": 0,
				  "headers": {
				    "Authorization": "Client-ID 227a2add62d2c9c"
				  },
				  "processData": false,
				  "mimeType": "multipart/form-data",
				  "contentType": false,
				  "data": form
				};
				
				if (proj.projectformat === "long") {
					projectFormat = "Longstrip";
					formatclass = "defaultwidth" + " showimage ch" + x;
				} else {
					projectFormat = "By Page";
					formatclass = "applygap defaultwidth" + " showimage ch" + x;
				};
				
				
				if ( proj.projectrating === "Y" ) {  // if 18+ series
					try {
						if (!sessionStorage.returning) {  // if a session cookie isn't already stored
							Swal.fire({  // do adult verification
								title: '18+ Content',
								icon: 'error',
								text: 'You will be asked to re-verify your age every time you open a new browser tab.',
								showCancelButton: true,
								confirmButtonColor: '#3ca53c',
								cancelButtonColor: '#d33',
								confirmButtonText: 'I am 18+'
							}).then((result) => {
								if (result.isConfirmed) { 				  // if verified
									sessionStorage.returning = true; 	// set cookie
									showreader(x)
								} else { 														// if not verified then go back to project page
									window.location = "/projects?n=" + proj.projectname;
								}
							});  																	// end result handling
						} else { 																// if there's already a cookie
							showreader(x)
						};
					}
					catch(err) {
						document.getElementById("reader").innerHTML = "Please report the following error message to us: " + err.message;
					}
				} else { 																		// if it's all ages just show reader
					showreader(x)
				};		
				
				
			}
			catch(err) {				
				window.location.replace("/projects?n=" + series);   // send wrong series names to 404
			}
			
			

			
				
			function showreader(y) {    // start defining the actual function that grabs the reader
				$.ajax(settings).done(function (response) {
					var json = $.parseJSON(response);
					var imgData = json.data;
					var TotPages = imgData.length;
					var footernext = "Next Chapter :)";
					var footerpointer = "auto";
					var output = document.querySelector("#readerID");
					
					$.each(imgData, function(i, item) {
						var src = imgData[i].link;
				        output.innerHTML += "<img src=\"\" data-src=\"" + src + "\" width=\"" + imgData[i].width + "\" height=\"" + imgData[i].height + "\" class=\"" + formatclass + "\" id=\""+ y + "_" + i +"\">";
					});
					loadimages(y, 0, preloadNum);
					output.innerHTML += "<div id=\"pagefooter" + y + "\" onclick=\"goNext()\" class=\"pagefooterclass ch" + y + "\"></div>";
					
					alasql.promise("SELECT chname, num FROM json('/json/chapters') where projectname = '" + series + "'"
					).then(function(results){
						var shortchname = results[Number(y)-1].chname.replace("Chapter ", "Ch.");
						var maxCh = results.length;
						var projectpagelink = "";
						var prevBtnClass = "toggleMenu";
						var nextBtnClass = "toggleMenu";
						
						if( number === 1 ) {
							prevBtnClass += " disablemenu";
						} else if( number === Number(maxCh) ) {
							nextBtnClass += " disablemenu";
							footernext = "There's no more :(";
							footerpointer = "none";
						}
		
						
						projectpagelink += "<div class=\"firstrowmenu\" id=\"firstrowmenuID\">";
						projectpagelink += "<a href=\"/projects?n="+series+"\" class=\"toggleMenu\" id=\"menubtn3\">&lt; " + proj.series + "</a>";
						projectpagelink += "<a href=\"\" id=\"prevbtn\" class=\"" + prevBtnClass + "\" onclick=\"goToChapter(" + (y - 1) + ")\"> <span>&laquo;</span> </a>";

						projectpagelink += "<div class=\"menuDropdown\"><a class=\"dropdownToggle\" href=\"\" onclick=\"toggleDD()\">"+shortchname+"</a>";
						projectpagelink += "<div id=\"menuDropdownItems\"><ul class=\"menuSelect\">";
				
				
						for(var i = 0; i < maxCh; i++) {
							var obj = results[i].chname;
							var DDMenuItemClass = "";
							if (i === (Number(y)-1)) {
								DDMenuItemClass = " class=\"DDMenuItemSelected\"";
							};
							projectpagelink += "<li" + DDMenuItemClass + "><a href=\"\" class=\"DDMenuItem\" onclick=\"goToChapter(" + (i + 1) + ")\">" + obj.replace("Chapter ","Ch.") + "</a></li>";
						};
						
				
						projectpagelink += "</ul></div></div>";			
			
						projectpagelink += "<a href=\"\" id=\"nextbtn\" class=\" " + nextBtnClass + " \" onclick=\"goToChapter(" + (y + 1) + ")\"> <span>&raquo;</span> </a>";
						
						
						projectpagelink += "<a onclick=\"togglePin()\" id=\"menubtn2\" class=\"toggleMenu\">";
							projectpagelink += "<div class=\"pinbtn\"><svg id=\"pinicon\" class=\"unpinicon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 768 768\" width=\"100%\" height=\"100%\">";
							projectpagelink += "<path d=\"M535.328 136.672c-12.448-12.512-32.672-12.576-45.248-0.128-3.328 3.328-5.632 7.264-7.2 11.36-26.624 55.552-55.936 86.88-92.928 105.376-41.504 20.48-89.152 34.72-165.952 34.72-4.16 0-8.32 0.8-12.224 2.432-7.84 3.264-14.048 9.504-17.312 17.312-3.232 7.808-3.232 16.64 0 24.448 1.632 3.936 3.968 7.488 6.944 10.432l103.776 103.776-145.184 193.6 193.6-145.184 103.744 103.744c2.944 3.008 6.496 5.312 10.432 6.944 3.904 1.632 8.064 2.496 12.224 2.496s8.32-0.864 12.224-2.496c7.84-3.264 14.080-9.44 17.312-17.312 1.632-3.872 2.464-8.064 2.464-12.192 0-76.8 14.208-124.448 34.656-165.312 18.464-36.992 49.792-66.304 105.376-92.928 4.128-1.568 8.032-3.872 11.328-7.2 12.448-12.576 12.384-32.8-0.128-45.248l-127.904-128.64z\">";
							projectpagelink += "</path></svg></div>";
						projectpagelink += "</a>";

						projectpagelink += "</div>";
					
						projectpagelink += "<div class=\"secondrowmenu\" id=\"secondrowmenuID\">";
					
						projectpagelink += "<a href=\"\" class=\"menulink widthclass\" id=\"toggleWidth\" onclick=\"toggleWidth()\">Width</a>";
							projectpagelink += "<div id=\"WidthDropdown\"><ul class=\"menuSelect\">";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"originalwidth\">1:1</a></li>";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"limitwidth\">100W</a></li>";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"fixedwidthXS\">X-Small</a></li>";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"fixedwidth800\">Small</a></li>";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"fixedwidth1100\">Medium</a></li>";
							projectpagelink += "<li><a class=\"WidthDDItems\" data-item-class=\"fixedwidth1400\">Large</a></li>";
							projectpagelink += "</ul></div>";	

						/* DEVELOPMENT ITEM
						projectpagelink += "<a href=\"\" class=\"menulink modeclass\" id=\"toggleMode\" onclick=\"toggleMode()\">Longstrip</a>";
							projectpagelink += "<div id=\"ModeDropdown\"><ul class=\"menuSelect\">";
							projectpagelink += "<li><a class=\"ModeDDItems\" data-item-class=\"originalMode\">Webtoon</a></li>";
							projectpagelink += "<li><a class=\"ModeDDItems\" data-item-class=\"limitMode\">Long</a></li>";
							projectpagelink += "<li><a class=\"ModeDDItems\" data-item-class=\"fixedMode800\">1-Page</a></li>";
							projectpagelink += "<li><a class=\"ModeDDItems\" data-item-class=\"fixedMode1100\">2-Page</a></li>";
							projectpagelink += "</ul></div>";	*/
					
						projectpagelink += "<a href=\"\" class=\"menulink disablemenu\" style=\"pointer-events:none;\">" + projectFormat + "</a>";
					
						projectpagelink += "<a href=\"\" class=\"menulink pgnumclass\" id=\"pgnum\" onclick=\"togglePgDD()\"><span id=\"CurrPg\">1</span> / "+TotPages+"</a>";
					
						projectpagelink += "<div id=\"PgDropdown\"><ul class=\"menuSelect\">";
				
				
						for(var i = 0; i < TotPages; i++) {
							projectpagelink += "<li><a class=\"PgDDItems\" onclick=\"gotopage(" + y + "," + (i+1) + ")\">" + (i+1) + "</a></li>";
						};			
				
						projectpagelink += "</ul></div>";		
						projectpagelink += "<a href=\"\" class=\"menulink\" onclick=\"toggleComments()\">";
							projectpagelink += "<div class=\"svgbtn\"><svg id=\"icon\" class=\"icon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\" width=\"100%\" height=\"100%\">";
							projectpagelink += "<path d=\"M240 64c-25.333 0-49.791 3.975-72.693 11.814-21.462 7.347-40.557 17.718-56.751 30.823-30.022 24.295-46.556 55.401-46.556 87.587 0 17.995 5.033 35.474 14.96 51.949 10.343 17.17 25.949 32.897 45.13 45.479 15.22 9.984 25.468 25.976 28.181 43.975 0.451 2.995 0.815 6.003 1.090 9.016 1.361-1.26 2.712-2.557 4.057-3.897 12.069-12.020 28.344-18.656 45.161-18.656 2.674 0 5.359 0.168 8.047 0.509 9.68 1.226 19.562 1.848 29.374 1.848 25.333 0 49.79-3.974 72.692-11.814 21.463-7.346 40.558-17.717 56.752-30.822 30.023-24.295 46.556-55.401 46.556-87.587s-16.533-63.291-46.556-87.587c-16.194-13.106-35.289-23.476-56.752-30.823-22.902-7.839-47.359-11.814-72.692-11.814zM240 0v0c132.548 0 240 86.957 240 194.224s-107.452 194.224-240 194.224c-12.729 0-25.223-0.81-37.417-2.355-51.553 51.347-111.086 60.554-170.583 61.907v-12.567c32.126-15.677 58-44.233 58-76.867 0-4.553-0.356-9.024-1.015-13.397-54.279-35.607-88.985-89.994-88.985-150.945 0-107.267 107.452-194.224 240-194.224zM498 435.343c0 27.971 18.157 52.449 46 65.886v10.771c-51.563-1.159-98.893-9.051-143.571-53.063-10.57 1.325-21.397 2.020-32.429 2.020-47.735 0-91.704-12.879-126.807-34.52 72.337-0.253 140.63-23.427 192.417-65.336 26.104-21.126 46.697-45.913 61.207-73.674 15.383-29.433 23.183-60.791 23.183-93.203 0-5.224-0.225-10.418-0.629-15.584 36.285 29.967 58.629 70.811 58.629 115.838 0 52.244-30.079 98.861-77.12 129.382-0.571 3.748-0.88 7.58-0.88 11.483z\">";
							projectpagelink += "</path></svg> ";
							projectpagelink += "<span id=\"cmtcnt\">0</span>";
							projectpagelink += "</div>";
							projectpagelink += "</a>";
					
						projectpagelink += "<a href=\"\" class=\"menulinksmall\" id=\"toggleThemeBtn\" onclick=\"toggleTheme()\">";
							projectpagelink += "<div class=\"svgbtn\"><svg id=\"icon\" class=\"icon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 33 33\" width=\"100%\" height=\"100%\">";
							projectpagelink += "<path d=\"M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM4 16c0-6.627 5.373-12 12-12v24c-6.627 0-12-5.373-12-12z\">";
							projectpagelink += "</path></svg></div>";
						projectpagelink += "</a>";

						projectpagelink += "<a href=\"https://imgur.com/a/"+ albumID + "/zip\" class=\"menulinksmall\" id=\"dlalbum\">";
							projectpagelink += "<div class=\"svgbtn\"><svg id=\"icon\" class=\"icon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" width=\"100%\" height=\"100%\">";
							projectpagelink += "<path d=\"M256 288l128-128h-96v-128h-64v128h-96zM372.363 235.636l-35.87 35.871 130.040 48.493-210.533 78.509-210.533-78.509 130.040-48.493-35.871-35.871-139.636 52.364v128l256 96 256-96v-128z\">";
							projectpagelink += "</path></svg></div>";
						projectpagelink += "</span>";
						
						projectpagelink += "</a>";
				
				
						$('#pageheader').html(projectpagelink);
						$('#menuframe').attr('src','/comment?series='+series+'&num='+y);
						$('#pagefooter' + y).html(footernext).css('pointer-events',footerpointer);
						$('#loadingmsg').hide();
						resolve('resolved');
					
					// Assign from defaults & localstorage
					
						if ($(window).width() < 600) {
							$('.defaultwidth').each(function(i, obj) {
						    	$(this).removeClass('defaultwidth').addClass('limitwidth');
							});
							$('#toggleWidth').html('100W').removeAttr('onclick').addClass('disablemenu');
						} else{
							$('.defaultwidth').each(function(i, obj) {
						    	$(this).removeClass('defaultwidth').addClass(widthClass);
							});
							$('#toggleWidth').html(widthName);
						};
					
						var widthitems = document.querySelectorAll('[data-item-class]');
						[].forEach.call(widthitems, function(item) {
						    item.addEventListener('click', function(){
								let newWidthClass = item.getAttribute("data-item-class");
								let newWidthName = $(this).text();
								localStorage.setItem('widthClass', newWidthClass);
								localStorage.setItem('widthName', newWidthName);
								if ($('#' + y + '_1').hasClass('originalwidth')) {
									$('.originalwidth').each(function(i, obj) {
								    	$(this).removeClass('originalwidth').addClass(newWidthClass);
									});
								} else if ($('#' + y + '_1').hasClass('limitwidth')) {
									$('.limitwidth').each(function(i, obj) {
								    	$(this).removeClass('limitwidth').addClass(newWidthClass);
									});
								} else if ($('#' + y + '_1').hasClass('fixedwidth800')) {
									$('.fixedwidth800').each(function(i, obj) {
								    	$(this).removeClass('fixedwidth800').addClass(newWidthClass);
									});
								} else if ($('#' + y + '_1').hasClass('fixedwidth1100')) {
									$('.fixedwidth1100').each(function(i, obj) {
								    	$(this).removeClass('fixedwidth1100').addClass(newWidthClass);
									});
								} else if ($('#' + y + '_1').hasClass('fixedwidthXS')) {
									$('.fixedwidthXS').each(function(i, obj) {
								    	$(this).removeClass('fixedwidthXS').addClass(newWidthClass);
									});
								} else {
									$('.fixedwidth1400').each(function(i, obj) {
								    	$(this).removeClass('fixedwidth1400').addClass(newWidthClass);
									});
								};
								$('#toggleWidth').html(newWidthName);
								jumptopage(y, $('#CurrPg').html() );
						    });
						});
						
						if (localStorage.getItem("pinMenu") === 'pin') {
							$('#pinicon').removeClass('unpinicon').addClass('pinicon');
							$('#' + number + '_0').addClass('padtop');
						}
					  	//CALCULATE & REPLACE COMMENT COUNT
						const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQABY2QntPAjViT8mZnc4X0Cx7KLnDg8j2k1sxKZNg9LuTHq26dAwY3gn8QSdwIGFa68rXPKAHo2zoS/pub?output=csv';
						alasql.promise("SELECT count(*) as cnt FROM CSV(?, {headers:true}) where Series = '" + series + "' and Number = " + number, [url]
						).then(function(resultsCmt){
							$('#cmtcnt').html(resultsCmt[0].cnt);
						});
				
					});
					
				});
				
			}   // end the showreader function def	

			
	});
  });
};
	
	
/* Display an alert if imgur image doesn't process */

function DisplayImgAlert() {
	$( "#AlertContainer" ).show();
	$( ".imgurchecker" ).hide();
}


function togglemenu() {
	var frame = $('#pageheader');
	
	if (localStorage.getItem("pinMenu") === 'pin') {
		return;
	} else {
		if(frame.is(":visible")) {
			frame.hide();
		} else {
			frame.show();
		}
	}
	
}

function toggleDD() {
	event.preventDefault(); 
	var DDmenu = $('#menuDropdownItems');
 	var selected = $('.DDMenuItemSelected');
	$('#menuDropdownItems').toggle();
	$(function(){
		selected.parent().scrollTop(selected[0].offsetTop);
	});
}	
function togglePgDD() {
	event.preventDefault(); 
	var DDmenu = $('#PgDropdown');
	$('#PgDropdown').toggle();
}	
function toggleWidth() {
	event.preventDefault(); 
	var DDmenu = $('#WidthDropdown');
	$('#WidthDropdown').toggle();
}	
function toggleMode() {
	event.preventDefault(); 
	var DDmenu = $('#ModeDropdown');
	$('#ModeDropdown').toggle();
}	

function toggleComments(){
	event.preventDefault(); 
	var frame = $('#menuframe')
	if(frame.is(":visible")) {
		frame.hide();
		
		if(window.innerWidth <= 700) {
			$('#readerID').show();
			$(document).scrollTop(savehistory);
		}
		$('#closeComments').hide();
		if(window.innerWidth > 1200) {
			$('#readerID').css('width','100%');
		}
	} else {
		frame.show();
		$('#closeComments').show();
		if(window.innerWidth > 1200) {
			$('#readerID').css('width','calc(100% - 700px)');
		} 
		if(window.innerWidth <= 700) {
			savehistory = $(document).scrollTop();
			$('#readerID').hide();
		}
	}
	if (togglenum === 0){
		document.getElementById('menuframe').src += '';
		togglenum = togglenum + 1;
	};
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
	
	var frame = $('#pageheader');
	var commentframe = $('#menuframe');
	var closebtn = $('#closeComments');
	
	if ( !frame[0].contains(event.target) && !commentframe[0].contains(event.target) && !closebtn[0].contains(event.target) && !event.target.matches('.pagefooterclass')) {
		togglemenu();
		if(commentframe.is(":visible")) {
			toggleComments();
		};
	};
	
	if (!event.target.matches('.dropdownToggle')) {
		var DDmenu = $('#menuDropdownItems');
		if(DDmenu.is(":visible")){
			DDmenu.hide();
	  }
	};
	if (!event.target.matches('.pgnumclass')) {
		var Pgmenu = $('#PgDropdown');
		if(Pgmenu.is(":visible")){
			Pgmenu.hide();
		}
	}
	if (!event.target.matches('.widthclass')) {
		var Widthmenu = $('#WidthDropdown');
		if(Widthmenu.is(":visible")){
			Widthmenu.hide();
		}
	}
	if (!event.target.matches('.modeclass')) {
		var Modemenu = $('#ModeDropdown');
		if(Modemenu.is(":visible")){
			Modemenu.hide();
		}
	}
} 

$(function(){	
	
	if (localStorage.getItem("pinMenu") === 'pin') {
		$('#pageheader').show();
	};

  $(window).scroll(function(){
	  if (waiting) {
	          return;
	  }
	  waiting = true;
	  getPgNum();
	  
	  setTimeout(function () {
	          waiting = false;
	      }, 100);
	  endScrollHandle = setTimeout(function () {
	          getPgNum();
	      }, 200);
  });
  
});


function getPgNum() {
	var IsInViewport = function(el) {
	    if (typeof jQuery === "function" && el instanceof jQuery) el = el[0];
	    var rect = el.getBoundingClientRect();
	    return (
	        rect.top >= -0.5 * (window.innerHeight || document.documentElement.clientHeight) &&
		  rect.top < 0.5 * (window.innerHeight || document.documentElement.clientHeight)
	    );
	};
  $("img.showimage").each(function(i,obj){  
       if( IsInViewport($(this)) ){
		   try{
			    let x = $(this).attr('id');
				var currentimg = Number(x.substring((x.indexOf("_") + 1))) + 1;
				$('#CurrPg').html(currentimg);
				loadimages(number,currentimg - preloadNum, currentimg + preloadNum);
			} catch(err) {
				//
			};
       }
  });
}

function gotopage(chapter,page) {
  return new Promise(resolve => {
	var $container = $([document.documentElement, document.body]);
	var abc = $("#" + chapter + "_" + (page - 1)).offset().top;
	loadimages(chapter, page - 1, page + 1);
    $container.animate({
		scrollTop:  abc
	}, 400);
	setTimeout(() => resolve('Done scrolling'), 1000);
  });
};
function jumptopage(chapter,page) {
  return new Promise(resolve => {
	var $container = $([document.documentElement, document.body]);
	var abc = $("#" + chapter + "_" + (page - 1)).offset().top;
    //$container.animate({
	//	scrollTop:  abc
	//},);
	$container.scrollTop(abc);
	setTimeout(() => resolve('Done scrolling'), 1000);
  });
};

async function goNext() {
	window.history.pushState(number, '', '?series='+series+'&num='+ (number+1));
	var rmChClass = ".ch" + number;
	number = number + 1;
	const result = await getimages(number);	
	
	const result2 = await gotopage(number,1);
	rmImage();

	function rmImage() {
		const rmCh = document.querySelectorAll(rmChClass);
		rmCh.forEach(img => {
	  	  img.remove();
		});
		jumptopage(number,1);
	}
}

async function goToChapter(chapterNumber) {
	event.preventDefault(); 
	window.history.pushState(number, '', '?series='+series+'&num='+ chapterNumber);
	var rmChClass = ".ch" + number;
	number = chapterNumber;
	const rmCh = document.querySelectorAll(rmChClass);
	rmCh.forEach(img => {
  	  img.remove();
	});
	getimages(chapterNumber);	
}

function toggleTheme(r) {//this function is executed when switching from the current theme to the other
	event.preventDefault(); 
	const dataTheme = document.documentElement.getAttribute("data-theme");
	let theme_switch;
	if(dataTheme === "light" || dataTheme == null) {theme_switch = 1} else {theme_switch = 0}
	if(r){theme_switch = !theme_switch}//so the oppisite of the theme stored is used when calling this function 
	if (theme_switch) {
		document.documentElement.setAttribute('data-theme', 'dark');
		localStorage.setItem('data-theme', 'dark');
	} else {
		document.documentElement.setAttribute('data-theme', 'light');
		localStorage.setItem('data-theme', 'light');
	}
}

function togglePin(r) {
	event.preventDefault(); 
	if (localStorage.getItem("pinMenu") === null) {
		localStorage.setItem('pinMenu', 'pin');
		$('#pinicon').removeClass('unpinicon').addClass('pinicon');
	} else if (localStorage.getItem("pinMenu") === 'pin') {
		localStorage.setItem('pinMenu', 'unpin');
		$('#pinicon').removeClass('pinicon').addClass('unpinicon');
	} else {
		localStorage.setItem('pinMenu', 'pin');
		$('#pinicon').removeClass('unpinicon').addClass('pinicon');
	}
}

window.addEventListener("popstate", function(e){
  location.reload();
});

function loadimages(chapter,frompage,topage){
	for (var i = frompage; i < topage + 1; i++) {
		var ImgElement = $('img#' + chapter + "_" + i);
		if(ImgElement.length){
			if (!ImgElement.attr('src')) {
				ImgElement.attr('src', ImgElement.attr('data-src'));
			};
		};
	}
}