// Declare global params

const newdays = 7;   // set number of days chapters are considered new
const newdaysms = newdays*24*60*60*1000; // calc in milliseconds
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}
var curdate = Date.now();
const latestperpage = 18;
var togglenum = 0;


/* Start Latest Updates section
needs to be manually sorted by date & clipped to 4 entries atm with the json raw...*/

	function getlatest() {

		alasql.promise("SELECT top(4) series, max(timestamp) as time_stamp, max(projectname) as projectname, max(projectsmallthumb) as projectsmallthumb FROM json('/json/chapters') group by series order by max(timestamp) desc, series desc"
		).then(function(results){
			var latest = ""
			for(var i = 0; i < results.length; i++) {
			    var obj = results[i];
					var d = new Date(obj.time_stamp*1000);
					//var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

					latest += "<div class=\"latestentrywrap\">";
					latest += "<a href=\"projects?n=" + obj.projectname + "\">";
					latest += "<img src=\"" + obj.projectsmallthumb + "\" class=\"latestimg\" width=\"300\" height=\"300\" loading=\"lazy\"><span class=\"chapter\">";
					latest += obj.series + "</span>";
					latest += "<span class=\"date\" title=\"" + formatDate(d) + "\">" + timeSinceProj(obj.time_stamp*1000) + "<span></a></div>";
			}

			document.getElementById("latestcontainer").innerHTML = latest;
		});	
	}

	
	
	


	
	
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
							seriesindex += "<img src=\"" + obj.projectthumb + "\" class=\"projectthumb\" width=\"300\" height=\"169\" loading=\"lazy\">";
							seriesindex += "<h1>" + "<span class=\"" + adult + "\">" + obj.series + "</h1></a>";
							seriesindex += "</div>";
							changedheader = "Current & Complete";
						}
					} else if (!(type == "all") && !(type == "current") && !(type == "dropped") && !(type == "licensed") && !(type == "complete")) {window.location.replace("/404");}; // send to 404 if not one of the valid statuses
				
					if (type == "all") {
						seriesindex += "<div class=\"projectwrap\">";
						seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
						seriesindex += "<img data-src=\"" + obj.projectthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"169\" loading=\"lazy\">";
						seriesindex += "<h1>" + "<span class=\"" + adult + "\">" + obj.series + "</h1></a>";
						seriesindex += "</div>";
						changedheader = "All Projects";
					} else {
						if ( obj.projectstatus == type ) {
							seriesindex += "<div class=\"projectwrap\">";
							seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
							seriesindex += "<img data-src=\"" + obj.projectthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"169\" loading=\"lazy\">";
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
// Ordering by chapter number in descending order, so only the record with highest chapter number of each series holds certain project data in the data file for efficiency

	function getchapters() {
		alasql.promise("SELECT series, projectname, projectdesc, projectauthor, projectartist, projectmu, projecturl, projectrating, projectthumb, projectstatus, timestamp, num, chname, chthumb, Role FROM json('/json/chapters') where projectname = '" + series + "' order by num desc"
		).then(function(results){
			var projectdetail = "";
			var proj = results[0];
			try {
				document.title = proj.series + " | Projects | Sunshine Butterfly";
			
				if (proj.projectrating == "Y") {
					var adult = "<img src=\"/images/assets/adult.png\" class=\"smallicons\" width=\"15\" height=\"15\">";
				} else { var adult = "<img src=\"/images/assets/15r.png\" class=\"smallicons\" width=\"15\" height=\"15\">";};
				var descrjs = "<i>Author: " + proj.projectauthor + " | Artist: " + proj.projectartist + "</i>\n" + proj.projectdesc;
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
						//var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
					
						if( curdate - d < newdaysms + 1) {
							var dateclass = "newupdate";
						} else {
							var dateclass = "normalupdate";
						};
						
						var lockCh = "";
						if(!(obj.Role === "")){
							lockCh = "<span class=\"chLockClass\">";
							lockCh += "<svg class=\"lockIcon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" width=\"100%\" height=\"100%\">";
							lockCh += "<path d=\"M296 224h-8v-96c0-52.935-43.065-96-96-96h-64c-52.935 0-96 43.065-96 96v96h-8c-13.2 0-24 10.8-24 24v240c0 13.2 10.8 24 24 24h272c13.2 0 24-10.8 24-24v-240c0-13.2-10.8-24-24-24zM96 128c0-17.645 14.355-32 32-32h64c17.645 0 32 14.355 32 32v96h-128v-96z\"></path>";
							lockCh += "</path></svg></span>";
						}
			
						projectdetail += "<div class=\"projectwrap\">";
						projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
						projectdetail += "<img data-src=\"" + obj.chthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"169\" loading=\"lazy\">";
						
						projectdetail += lockCh;

							// start comment bubble
							projectdetail += "<div class=\"commentBtn\" id=\"cmtDiv" + obj.projectname + (results.length - i) + "\"><svg class=\"commentIcon\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\" width=\"100%\" height=\"100%\">";
							projectdetail += "<path d=\"M240 64c-25.333 0-49.791 3.975-72.693 11.814-21.462 7.347-40.557 17.718-56.751 30.823-30.022 24.295-46.556 55.401-46.556 87.587 0 17.995 5.033 35.474 14.96 51.949 10.343 17.17 25.949 32.897 45.13 45.479 15.22 9.984 25.468 25.976 28.181 43.975 0.451 2.995 0.815 6.003 1.090 9.016 1.361-1.26 2.712-2.557 4.057-3.897 12.069-12.020 28.344-18.656 45.161-18.656 2.674 0 5.359 0.168 8.047 0.509 9.68 1.226 19.562 1.848 29.374 1.848 25.333 0 49.79-3.974 72.692-11.814 21.463-7.346 40.558-17.717 56.752-30.822 30.023-24.295 46.556-55.401 46.556-87.587s-16.533-63.291-46.556-87.587c-16.194-13.106-35.289-23.476-56.752-30.823-22.902-7.839-47.359-11.814-72.692-11.814zM240 0v0c132.548 0 240 86.957 240 194.224s-107.452 194.224-240 194.224c-12.729 0-25.223-0.81-37.417-2.355-51.553 51.347-111.086 60.554-170.583 61.907v-12.567c32.126-15.677 58-44.233 58-76.867 0-4.553-0.356-9.024-1.015-13.397-54.279-35.607-88.985-89.994-88.985-150.945 0-107.267 107.452-194.224 240-194.224zM498 435.343c0 27.971 18.157 52.449 46 65.886v10.771c-51.563-1.159-98.893-9.051-143.571-53.063-10.57 1.325-21.397 2.020-32.429 2.020-47.735 0-91.704-12.879-126.807-34.52 72.337-0.253 140.63-23.427 192.417-65.336 26.104-21.126 46.697-45.913 61.207-73.674 15.383-29.433 23.183-60.791 23.183-93.203 0-5.224-0.225-10.418-0.629-15.584 36.285 29.967 58.629 70.811 58.629 115.838 0 52.244-30.079 98.861-77.12 129.382-0.571 3.748-0.88 7.58-0.88 11.483z\">";
							projectdetail += "</path></svg> ";
							projectdetail += "<span class=\"cmtcntClass\" id=\"cmtcnt" + obj.projectname + (results.length - i) + "\"></span>";
							projectdetail += "</div>";
							
						projectdetail += "<h1>" + "<span class=\"" + dateclass + "\" title=\"" + formatDate(d) + "\">" + timeSinceProj(obj.timestamp*1000) + "</span>" + obj.chname + "</h1></a>";
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
						window.scrollTo(window.scrollX, $("#projectheader").offset().top-10);
						var contentHeight = document.getElementById('container').clientHeight;
						var descriptionbutton = document.getElementById('read-more');
						if ( contentHeight >= 120 ) {
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
				
				const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQABY2QntPAjViT8mZnc4X0Cx7KLnDg8j2k1sxKZNg9LuTHq26dAwY3gn8QSdwIGFa68rXPKAHo2zoS/pub?output=csv';
				alasql.promise("SELECT Number, count(*) as cnt FROM CSV(?, {headers:true}) where Series = '" + series + "' group by Number", [url]
				).then(function(resultsCmt){
					for(var i = 0; i < resultsCmt.length; i++) {
						var CommentChapter = resultsCmt[i].Number;
						var CommentNumber = resultsCmt[i].cnt;
						var $GetCommentSpan = $('#cmtcnt'+ proj.projectname + CommentChapter);
						var $GetCommentDiv = $('#cmtDiv'+ proj.projectname + CommentChapter);
						$GetCommentSpan.text(CommentNumber);
						$GetCommentDiv.show();
					}
				});
				
				//START LEASH CH1 EXTERNAL LINK OVERRIDE
				
				var leashchone = "<div class=\"projectwrap\"><a href=\"https://mangadex.org/chapter/7dac8f11-954d-4520-b018-1532a002a211\" target=\"_blank\">";
				leashchone += "<img src=\"https://cdn.discordapp.com/attachments/850001666442788864/1020816453244555264/unknown.png\" class=\"projectthumb lazyload\" width=\"300\" height=\"169\" loading=\"lazy\">";
				leashchone += "<h1>Chapter 1 on Mangadex</h1></a></div>";
				
				if (series === 'leash'){
					$('.parentproject').append(leashchone);
				}
				
				//END CUSTOM OVERRIDE
				
				//Start reverser
				
				if (results.length > 1){
					$('h2').append('<span onclick="reverseOrder()">&#8645;</span>')
				}
				
				//End reverser
				
				
			} catch(err) {
				window.location.replace("/404");
			}

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
						//var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
						
						if( curdate - d < newdaysms + 1) {
							var dateclass = "newupdate";
						} else {
							var dateclass = "normalupdate";
						};
						
						if (obj.projectrating == "Y") {var adult = "adultclass";} else {var adult = "normal";}
			
						projectdetail += "<div class=\"projectwrap\">";
						projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
						projectdetail += "<img data-src=\"" + obj.chthumb + "\" class=\"projectthumb lazyload\" width=\"300\" height=\"169\" loading=\"lazy\">";
						projectdetail += "<h1><span class=\"" + dateclass + "\ title=\"" + formatDate(d) + "\">" + timeSinceProj(obj.timestamp*1000) + "&nbsp;&nbsp;&nbsp;";
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
	
	

	function reverseOrder(){
		var list = $('.parentproject');
		var listItems = list.children('div');
		list.append(listItems.get().reverse());
	}
	
	
	
// Date functions

	function padTo2Digits(num) {
	  return num.toString().padStart(2, '0');
	}
	function formatDate(date) {
	  return (
	    [
	      date.getFullYear(),
	      padTo2Digits(date.getMonth() + 1),
	      padTo2Digits(date.getDate()),
	    ].join('-') +
	    ' ' +
	    [
	      padTo2Digits(date.getHours()),
	      padTo2Digits(date.getMinutes()),
	      padTo2Digits(date.getSeconds()),
	    ].join(':')
	  );
	}
	function timeSinceProj(timeStamp) {
	  var now = new Date(),
	    secondsPast = (now.getTime() - timeStamp) / 1000;
	  if (secondsPast < 60) {
	    return parseInt(secondsPast) + ' secs ago';
	  }
	  if (secondsPast < 3600) {
	    return parseInt(secondsPast / 60) + ' mins ago';
	  }
	  if (secondsPast <= 86400) {
	    return parseInt(secondsPast / 3600) + ' hrs ago';
	  }
	  if (secondsPast <= 604800) {
	    return parseInt(secondsPast / 86400) + ' days ago';
	  }
	  if (secondsPast > 604800) {
		var d = new Date(timeStamp);
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	  }
	}