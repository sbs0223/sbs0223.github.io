/* Start Latest Updates section
needs to be manually sorted by date & clipped to 4 entries atm with the json raw...*/

	function getlatest() {

		alasql.promise("SELECT top(4) series, projectname, projectsmallthumb, max(timestamp) as time_stamp FROM json('/json/chapters') group by series, projectname, projectsmallthumb order by max(timestamp) desc, series desc"
		).then(function(results){
			var latest = ""
			for(var i = 0; i < results.length; i++) {
			    var obj = results[i];
					var d = new Date(obj.time_stamp*1000);
					var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

					latest += "<div class=\"latestentrywrap\">";
					latest += "<a href=\"projects?n=" + obj.projectname + "\">";
					latest += "<img src=\"" + obj.projectsmallthumb + "\" class=\"latestimg\"></a><span class=\"chapter\">";
					latest += obj.series + "</span><br>";
					latest += "<span class=\"date\">" + chtime + "<span></div>";
			}

			document.getElementById("latestcontainer").innerHTML = latest;
		});	
	}


	
	
	
// Start Adult Warning popup for the reader
	
	function showUserAlerts() {	
		if (!sessionStorage.returning) {
			Swal.fire({
				title: '18+ Content',
				icon: 'error',
				showCancelButton: true,
				confirmButtonColor: '#3ca53c',
				cancelButtonColor: '#d33',
				confirmButtonText: 'I am 18+'
			}).then((result) => {
				if (result.isConfirmed) {
					sessionStorage.returning = true; // set cookie
				}
				else window.location = "/";
			}
		)
		}
	}
	
	
	

// Start Get URL function for the reader
	
	function geturl() {
	alasql.promise("SELECT distinct series, projectname, projectrating, projecturl FROM json('/json/chapters') where projectname = '" + series + "'"
	).then(function(results){
		var embedurl = "";
		proj = results[0];
			
			try {
				embedurl = proj.projecturl;
			}
			catch(err) {				
				window.location.replace("/404");   // send wrong series names to 404
			}
			
			if ( number === "" || number === "null" ) {
				embedurl = proj.projecturl;
			} else {
				embedurl = proj.projecturl + number;
			};
						
			if ( proj.projectrating === "Y" ) {
				showUserAlerts();   // trigger swal if 18+ series
			} else { };  // no additional action if non-mature series
			
			var projectpagelink = "<a href=\"/projects?n=" + proj.projectname + "\"> Project Page &gt;</a>";
			
			embed = "<embed type=\"text/html\" src=\"" + embedurl + "\" width=\"100%\" height=\"100%\">";     
			document.getElementById("reader").innerHTML = embed;
			document.getElementById("pageheader").innerHTML = projectpagelink;
			
		});
	};
	
	
	
	
	
// Start Get index function for project page
	
	function getindex() {

		alasql.promise("SELECT distinct series, projectname, projectrating, projectthumb, projectstatus FROM json('/json/chapters') order by series asc"
		).then(function(results){
			var latest = ""
			var seriesindex = "";
			var changedheader = "";
			for(var i = 0; i < results.length; i++) {
			    var obj = results[i];

					if (obj.projectrating == "Y") {
						var adult = "18+";
					} else { var adult = "";};
				
					if (type == "" || type == "null") {
						if ( obj.projectstatus == "current" || obj.projectstatus == "complete" ) {  // show current & complete if default projects page
							seriesindex += "<div class=\"projectwrap\">";
							seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
							seriesindex += "<img src=\"" + obj.projectthumb + "\" class=\"projectthumb\">";
							seriesindex += "<h1>" + "<span>" + adult + "</span>" + obj.series + "</h1></a>";
							seriesindex += "</div>";
							changedheader = "Current & Complete";
						}
					} else if (!(type == "all") && !(type == "current") && !(type == "dropped") && !(type == "licensed") && !(type == "complete")) {window.location.replace("/404");}; // send to 404 if not one of the valid statuses
				
					if (type == "all") {
						seriesindex += "<div class=\"projectwrap\">";
						seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
						seriesindex += "<img src=\"" + obj.projectthumb + "\" class=\"projectthumb\">";
						seriesindex += "<h1>" + "<span>" + adult + "</span>" + obj.series + "</h1></a>";
						seriesindex += "</div>";
						changedheader = "All Projects";
					} else {
						if ( obj.projectstatus == type ) {
							seriesindex += "<div class=\"projectwrap\">";
							seriesindex += "<a href=\"?n=" + obj.projectname + "\">";
							seriesindex += "<img src=\"" + obj.projectthumb + "\" class=\"projectthumb\">";
							seriesindex += "<h1>" + "<span>" + adult + "</span>" + obj.series + "</h1></a>";
							seriesindex += "</div>";
							changedheader = type;
						}
					}
			}
			document.getElementById("seriescontainer").innerHTML = seriesindex;
			document.getElementById("projectheader").innerHTML = changedheader;
		});	
	}
	



// Start Get chapters function for individual project page

	function getchapters() {
		alasql.promise("SELECT series, projectname, projectdesc, projectmu, projecturl, projectrating, projectthumb, projectstatus, timestamp, num, chname, chthumb FROM json('/json/chapters') where projectname = '" + series + "' order by num desc"
		).then(function(results){
			var projectdetail = "";
			var proj = results[0];
			
			if (proj.projectrating == "Y") {
				var adult = "<img src=\"/images/assets/adult.png\" class=\"smallicons\">";
			} else { var adult = "<img src=\"/images/assets/15r.png\" class=\"smallicons\">";};
			var descrjs = proj.projectdesc;
			var description = descrjs.replace(/\n/g,"<br>");
			
			projectdetail += "<div class=\"projecttopwrap\" align=center>";
			projectdetail += "<div class=\"projectpagecover\"><img src=\"" + proj.projectthumb + "\"></div>";
			projectdetail += "<div class=\"projectpageinfo\"><div id=\"container\">";
			projectdetail += "<span>" + adult + "</i> <a href=\"" + proj.projectmu + "\"><img src=\"/images/assets/muicon.svg\" class=\"smallicons\"></a> ";
			if (proj.projectstatus == "licensed") {
				projectdetail += "<a href=\"" + proj.projecturl + "\"><img src=\"/images/assets/licensed.png\" class=\"smallicons\"></a>";
			} else {
				projectdetail += "<a href=\"" + proj.projecturl + "\"><img src=\"/images/assets/cubari.png\" class=\"smallicons\"></a> <a href=\"/read?series=" + proj.projectname + "\"><img src=\"/images/android-chrome-192x192.png\" class=\"smallicons\"></a>";
			}
			projectdetail += "</span>";
			projectdetail += description + "<button class=\"read-more\">more/less</button>";
			projectdetail += "</div></div></div><div class=\"subcontentcontainer\"><h2>Chapters</h2>";
			projectdetail += "<div class=\"projectouterwrap\" align=center><div class=\"parentproject\">";
			
			if (!(proj.projectstatus == "licensed")) {
				for(var i = 0; i < results.length; i++) {
					var obj = results[i];
					var d = new Date(obj.timestamp*1000);
					var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
			
					projectdetail += "<div class=\"projectwrap\">";
					projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
					projectdetail += "<img src=\"" + obj.chthumb + "\" class=\"projectthumb\">";
					projectdetail += "<h1>" + "<span>" + chtime + "</span>" + obj.chname + "</h1></a>";
					projectdetail += "</div>";
				}
			} else {
					projectdetail += "<center>Licensed. Please support the author by <a href=\"" + proj.projecturl + "\" target=\"_blank\">purchasing the official releases</a>!<br><br></center>";
			};
			projectdetail += "</div></div>"; 
			
			document.getElementById("projectheader").innerHTML = proj.series;
			document.getElementById("seriescontainer").innerHTML = projectdetail;
			
			$( document ).ready(function() {
			    $('.read-more').click(function(){
			        $(this).parent().toggleClass('expanded');
			    });
			});

			});
		}	


// Start updates page

		function gettopupdates() {
			
			alasql.promise("SELECT top(30) series, num, chthumb, chname, adult, timestamp, projectname, projectrating FROM json('/json/chapters') order by timestamp desc, series desc, num desc"
			).then(function(results){
				var projectdetail = ""
				for(var i = 0; i < results.length; i++) {
				    var obj = results[i];
						var d = new Date(obj.timestamp*1000);
						var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
						if (obj.projectrating == "Y") {var adult = "18+";} else {var adult = "15+";}
			
						projectdetail += "<div class=\"projectwrap\">";
						projectdetail += "<a href=\"/read?series=" + obj.projectname + "&num=" + obj.num + "\">";
						projectdetail += "<img src=\"" + obj.chthumb + "\" class=\"projectthumb\">";
						projectdetail += "<h1>" + "<span>" + chtime + "</span>";
						projectdetail += "<i>" + obj.chname + "</i><br>";
						projectdetail += obj.series + " <span>(" + adult + ")</span></h1></a>";
						projectdetail += "</div>";
				}
	
				document.getElementById("seriescontainer").innerHTML = projectdetail;
			})
			
		}