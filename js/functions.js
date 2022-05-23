// Declare global params

const newdays = 14;   // set number of days chapters are considered new
const newdaysms = newdays*24*60*60*1000; // calc in milliseconds
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}
var curdate = Date.now();
const latestperpage = 18;


/* Start Latest Updates section
needs to be manually sorted by date & clipped to 4 entries atm with the json raw...*/

	function getlatest() {

		alasql.promise("SELECT top(4) series, max(timestamp) as time_stamp, max(projectname) as projectname, max(projectsmallthumb) as projectsmallthumb FROM json('/json/chapters') group by series order by max(timestamp) desc, series desc"
		).then(function(results){
			var latest = ""
			for(var i = 0; i < results.length; i++) {
			    var obj = results[i];
					var d = new Date(obj.time_stamp*1000);
					var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

					latest += "<div class=\"latestentrywrap\">";
					latest += "<a href=\"projects?n=" + obj.projectname + "\">";
					latest += "<img src=\"" + obj.projectsmallthumb + "\" class=\"latestimg\" width=\"300\" height=\"300\" loading=\"lazy\"><span class=\"chapter\">";
					latest += obj.series + "</span>";
					latest += "<span class=\"date\">" + chtime + "<span></a></div>";
			}

			document.getElementById("latestcontainer").innerHTML = latest;
		});	
	}

	
	
	

// Start Get URL function for the reader
	
	function geturl() {
	alasql.promise("SELECT distinct series, projectname, projectrating, projecturl, num FROM json('/json/chapters') where projectname = '" + series + "' and projecturl <> 0"
	).then(function(results){
		var embedurl = "";
		var embedtitle = "";
		proj = results[0];
		
		var maxCh = proj.num;
			
			try {
				embedurl = proj.projecturl;
			}
			catch(err) {				
				window.location.replace("/404");   // send wrong series names to 404
			}
			
			if ( number === "" || number === "null" ) {
				embedurl = proj.projecturl;
				embedtitle = proj.series;
			} else {
				embedurl = proj.projecturl + number;
				embedtitle = proj.series + " | " + number;
			};			
			
			var projectpagelink = "<a onclick=\"togglemenu("+maxCh+","+number+")\" id=\"menubtn\">&laquo; Menu &nbsp;</a>";
			
			projectpagelink += "<div id=\"menubar\" style=\"display:none\">";
			projectpagelink += "<a href=\"/projects?n="+series+"\" class=\"toggleMenu\" id=\"menubtn3\">Project</a>";
			projectpagelink += "<a href=\"/read?series="+series+"&num=" + (Number(number)-1) + "\" id=\"prevbtn\" class=\"toggleMenu\"> &laquo; </a>";

			projectpagelink += "<div class=\"menuDropdown\"><a class=\"dropdownToggle\" href=\"\" onclick=\"toggleDD()\">"+number+" | "+ proj.series + "</a>";
			projectpagelink += "<div id=\"menuDropdownItems\"><ul class=\"menuSelect\">";
			
			for(var i = 0; i < Number(maxCh); i++) {
				projectpagelink += "<li><a href=\"/read?series=" + series + "&num=" + (i+1) + "\" class=\"DDMenuItem\">" + (i+1) + " | " + proj.series + "</a></li>";
			}
			
			projectpagelink += "</ul></div></div>";			
			
			projectpagelink += "<a href=\"/read?series="+series+"&num=" + (Number(number)+1) + "\" id=\"nextbtn\" class=\"toggleMenu\"> &raquo; </a>";
			projectpagelink += "<a onclick=\"togglemenu()\" id=\"menubtn2\" class=\"toggleMenu\">Hide &raquo;</a>";
			projectpagelink += "</div>";
			 // the 2nd set, will be hidden initially
			var projectpagelink2 = "";
			
	    var receiveMessage = function (checklocal) {  // check if 3rd party localstorage works
				
				function showreader() {    // start defining the actual function that grabs the reader
					if (checklocal.data === "N") {		// START check if need to redirect
						window.location = embedurl;			// redirect
					} else {													// embed if not redirect
						document.getElementById("reader").innerHTML = "<embed type=\"text/html\" src=\"" + embedurl + "\" width=\"100%\" height=\"100%\">";
						document.getElementById("pageheader").innerHTML = projectpagelink;
						document.title = embedtitle + " | Sunshine Butterfly";
						$('#menuframe').attr('src','/comment?series='+series+'&num='+number+'&proj='+proj.series);
					};																// END end embed
				}   // end the showreader function def
				
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
									showreader()
								} else { 														// if not verified then go back to project page
									window.location = "/projects?n=" + proj.projectname;
								}
							});  																	// end result handling
						} else { 																// if there's already a cookie
							showreader()
						};
					}
					catch(err) {
						document.getElementById("reader").innerHTML = "Please report the following error message to us: " + err.message;
					}
				} else { 																		// if it's all ages just show reader
					showreader()
				};				

	    };  // end the checklocal function

	    window.addEventListener("message", receiveMessage, false);
			
		});
	};
	
	
	
	
	
// Start Get index function for project page
	
	function getindex() {

		alasql.promise("SELECT distinct series, projectname, projectrating, projectthumb, projectstatus FROM json('/json/chapters') where projectstatus <> 0 order by series asc"
		).then(function(results){
			var seriesindex = "";
			var changedheader = "";
			for(var i = 0; i < results.length; i++) {
			    var obj = results[i];

					if (obj.projectrating == "Y") {var adult = "adultclass";} else {var adult = "normal";}
				
					if (type == "" || type == "null") {
						if ( obj.projectstatus == "current" || obj.projectstatus == "complete" ) {  // show current & complete if default projects page
							seriesindex += "<div class=\"projectwrap\">";
							seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
							seriesindex += "<img src=\"" + obj.projectthumb + "\" class=\"projectthumb\" width=\"300\" height=\"196\" loading=\"lazy\">";
							seriesindex += "<h1>" + "<span class=\"" + adult + "\">" + obj.series + "</h1></a>";
							seriesindex += "</div>";
							changedheader = "Current & Complete";
						}
					} else if (!(type == "all") && !(type == "current") && !(type == "dropped") && !(type == "licensed") && !(type == "complete")) {window.location.replace("/404");}; // send to 404 if not one of the valid statuses
				
					if (type == "all") {
						seriesindex += "<div class=\"projectwrap\">";
						seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
						seriesindex += "<img data-src=\"" + obj.projectthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"196\" loading=\"lazy\">";
						seriesindex += "<h1>" + "<span class=\"" + adult + "\">" + obj.series + "</h1></a>";
						seriesindex += "</div>";
						changedheader = "All Projects";
					} else {
						if ( obj.projectstatus == type ) {
							seriesindex += "<div class=\"projectwrap\">";
							seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
							seriesindex += "<img data-src=\"" + obj.projectthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"196\" loading=\"lazy\">";
							seriesindex += "<h1>" + "<span class=\"" + adult + "\">" + obj.series + "</h1></a>";
							seriesindex += "</div>";
							changedheader = type;
						}
					}
			}
			document.getElementById("seriescontainer").innerHTML = seriesindex;
			document.getElementById("projectheader").innerHTML = changedheader;
			lazyload();
		});	
	}
	



// Start Get chapters function for individual project page
// Ordering by chapter number in descending order, so only the record with highest chapter number of each series holds certain project data in the data file to save space

	function getchapters() {
		alasql.promise("SELECT series, projectname, projectdesc, projectmu, projecturl, projectrating, projectthumb, projectstatus, timestamp, num, chname, chthumb FROM json('/json/chapters') where projectname = '" + series + "' order by num desc"
		).then(function(results){
			var projectdetail = "";
			var proj = results[0];
			document.title = proj.series + " | Projects | Sunshine Butterfly";
			
			if (proj.projectrating == "Y") {
				var adult = "<img src=\"/images/assets/adult.png\" class=\"smallicons\" width=\"15\" height=\"15\">";
			} else { var adult = "<img src=\"/images/assets/15r.png\" class=\"smallicons\" width=\"15\" height=\"15\">";};
			var descrjs = proj.projectdesc;
			var description = descrjs.replace(/\n/g,"<br>");
			
			projectdetail += "<div class=\"projecttopwrap\" align=center>";
			projectdetail += "<div class=\"projectpagecover\"><img src=\"" + proj.projectthumb + "\" width=\"800\" height=\"450\"></div>";
			projectdetail += "<div class=\"projectpageinfo\"><div id=\"container\">";
			projectdetail += "<span>" + adult + "</i> <a href=\"" + proj.projectmu + "\"><img src=\"/images/assets/muicon.svg\" class=\"smallicons\" width=\"15\" height=\"15\"></a> ";
			if (proj.projectstatus == "licensed") {
				projectdetail += "<a href=\"" + proj.projecturl + "\"><img src=\"/images/assets/licensed.png\" class=\"smallicons\" width=\"15\" height=\"15\"></a>";
			} else {
				projectdetail += "<a href=\"" + proj.projecturl + "\"><img src=\"/images/assets/cubari.png\" class=\"smallicons\" width=\"15\" height=\"15\"></a> <a href=\"/read?series=" + proj.projectname + "\"><img src=\"/images/android-chrome-192x192.png\" class=\"smallicons\" width=\"15\" height=\"15\"></a>";
			}
			projectdetail += "</span>";
			projectdetail += description + "";
			projectdetail += "<button id =\"read-more\" class=\"read-more\">Expand</button></div></div></div><div class=\"subcontentcontainer\"><h2>Chapters</h2>";
			projectdetail += "<div class=\"projectouterwrap\" align=\"center\"><div class=\"parentproject\">";
			
			if (!(proj.projectstatus == "licensed")) {
				for(var i = 0; i < results.length; i++) {
					var obj = results[i];
					var d = new Date(obj.timestamp*1000);
					var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
					
					if( curdate - d < newdaysms + 1) {
						var dateclass = "newupdate";
					} else {
						var dateclass = "normalupdate";
					};
			
					projectdetail += "<div class=\"projectwrap\">";
					projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
					projectdetail += "<img data-src=\"" + obj.chthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"196\" loading=\"lazy\">";
					projectdetail += "<h1>" + "<span class=\"" + dateclass + "\">" + chtime + "</span>" + obj.chname + "</h1></a>";
					projectdetail += "</div>";
				}
			} else {
					projectdetail += "<center>Licensed. Please support the author by <a href=\"" + proj.projecturl + "\" target=\"_blank\">purchasing the official releases</a>!</center>";
			};
			projectdetail += "</div></div>";
			projectdetail += ""; 
			
			document.getElementById("projectheader").innerHTML = proj.series;
			document.getElementById("seriescontainer").innerHTML = projectdetail;
			document.getElementById("commentscontainer").style.display = "block";
			lazyload();
			
			$( document ).ready(function() {
					var contentHeight = document.getElementById('container').clientHeight;
					var descriptionbutton = document.getElementById('read-more');
					if ( contentHeight >= 100 ) {
						descriptionbutton.style.display = "block";
						document.getElementById('container').innerHTML += "<div class=\"addpadding\"></div>";
				    $('.read-more').click(function(){
				        $(this).parent().toggleClass('expanded');
							  if (document.getElementById('read-more').innerHTML === "Expand") {
							    document.getElementById('read-more').innerHTML = "Collapse";
							  } else {
							    document.getElementById('read-more').innerHTML = "Expand";
							  }
				    });
					} else {
						descriptionbutton.style.display = "none";
					};
					
			});

			});
		}	


// Start updates page

		function gettopupdates() {
			
			alasql.promise("SELECT series, num, chthumb, chname, adult, timestamp, projectname, projectrating FROM json('/json/chapters') where projectstatus <> 'licensed' order by timestamp desc, series desc, num desc LIMIT " + latestperpage + " OFFSET " + offset
			).then(function(results){
				var projectdetail = ""
				for(var i = 0; i < results.length; i++) {
				    var obj = results[i];
						var d = new Date(obj.timestamp*1000);
						var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
						
						if( curdate - d < newdaysms + 1) {
							var dateclass = "newupdate";
						} else {
							var dateclass = "normalupdate";
						};
						
						if (obj.projectrating == "Y") {var adult = "adultclass";} else {var adult = "normal";}
			
						projectdetail += "<div class=\"projectwrap\">";
						projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
						projectdetail += "<img data-src=\"" + obj.chthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"196\" loading=\"lazy\">";
						projectdetail += "<h1><span class=\"" + dateclass + "\">" + chtime + "&nbsp;&nbsp;&nbsp;";
						projectdetail += obj.chname + "</span></a><br>";
						projectdetail += "<span class=\"" + adult + "\"><a href=\"/projects?n=" + obj.projectname + "\">" + obj.series + "</a></span></h1>";
						projectdetail += "</div>";
				}
	
				document.getElementById("seriescontainer").innerHTML = projectdetail;
				lazyload();
			})
			
		}



// Get updates page pagination & call updates function
		
	function getupdatepagination() {
		alasql.promise("SELECT count(projectstatus) as countrec FROM json('/json/chapters') where projectstatus <> 'licensed'"
		).then(function(rresults){
			recordcount=rresults[0].countrec;
			maxpage = Math.ceil(recordcount/latestperpage);
		
			if (isNaN(pagenum)){
				pagenum = 1;
				offset = 0;
				window.history.pushState('', '', '/updates');
			} else if(pagenum < 1){
				pagenum = 1;
				offset = 0;
				window.history.pushState('', '', '/updates');
			} else if(pagenum > maxpage) {
				pagenum = maxpage;
				offset = (maxpage-1)*latestperpage;
				window.history.pushState('', '', '/updates?page='+maxpage);
			}	else {
				pagenum = Math.floor(pagenum);
				offset = (pagenum-1)*latestperpage;
				window.history.pushState('', '', '/updates?page='+pagenum);
			};
			
			gettopupdates();
			
			var paginate = "";
			var checkpage = "";
			
			paginate += "Page: ";
			
			for(var j = 1; j < maxpage + 1; j++) {
				
				if(pagenum === j + "" || pagenum === j) {
					checkpage = "inactive";
				} else {
					checkpage = "active";
				};
				
				paginate += "<a href=\"/updates?page="+ j + "\" class=\"" + checkpage + "\">" + j + " </a>";
			};
			
			document.getElementById("updatestext").innerHTML = "<span>" + (offset+1) + " to " + Math.min(recordcount,offset+latestperpage) + " of " + recordcount + "</span>";
			document.getElementById("updatesnav").innerHTML = paginate;
			
		});
			
	}	
		
		
/* Display an alert if imgur image doesn't process */

	function DisplayImgAlert() {
		$( "#AlertContainer" ).show();
		$( ".imgurchecker" ).hide();
	}
	
	
	function togglemenu(max,num) {
		var frame = $('#menuframe');
		if(frame.is(":visible")) {
			frame.hide();
			$('#menubtn').show();
			$('#menubar').hide();
			$('#pageheader').css({ 'display':'inline-block', 'maxWidth':'auto', width:'auto' });
		} else {
			frame.show();
			$('#menubtn').hide();
			$('#menubar').show();
			if( Number(num) === 1 ) {
				$('#prevbtn').addClass('disablemenu')
			}
			if( Number(num) === Number(max) ) {
				$('#nextbtn').addClass('disablemenu')
			}
			$('#pageheader').css({ 'display':'block', 'max-width':100+'%', width:800+'px' });
		}
		
	}
	
	function toggleDD() {
		event.preventDefault(); 
		var DDmenu = $('#menuDropdownItems');
		$('#menuDropdownItems').toggle();
	}