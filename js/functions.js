/* Start Latest Updates section
needs to be manually sorted by date & clipped to 4 entries atm with the json raw...*/

	function getlatest() {

		fetch("/json/latest")
		.then(response => response.json())
		.then((latestdata) => {
			var latest = "";
			updates = latestdata.updates;
			
			for (var entry in updates) {
				title = updates[entry].title;
				url = updates[entry].url;
				thumb = updates[entry].thumb;
				chapter = updates[entry].chapter;
				d = new Date(updates[entry].date*1000);
				updatedate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
			
				latest += "<div class=\"latestentrywrap\">";
				latest += "<a href=\"" + url + "\">";
				latest += "<img src=\"" + thumb + "\" class=\"latestimg\"></a><span class=\"chapter\">";
				latest += title + " Ch. " + chapter + "</span><br>";
				latest += "<span class=\"date\">" + updatedate + "<span></div>";

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
		fetch("/json/mapping.json")
		.then(response => response.json())
		.then((mappingdata) => {
			var links = mappingdata.projects;
			
			try {
				embedurl = links[series].url;
			}
			catch(err) {				
				window.location.replace("/404");   // send wrong series names to 404
			}
			
			adult = links[series].adult;
			
			if ( number === "" || number === "null" ) {
				embedurl = links[series].url;
			} else {
				embedurl = links[series].url + number;
			};
						
			if (!embedurl) {
				window.location.replace("/404");  //send wrong chapter numbers to 404
			} else if ( adult === "Y" ) {
				showUserAlerts();   // trigger swal if 18+ series
			} else { };  // no additional action if non-mature series with valid chapter
			
			var projectpagelink = "<a href=\"/projects?n=" + series + "\"> Project Page &gt;</a>";
			
			embed = "<embed type=\"text/html\" src=\"" + embedurl + "\" width=\"100%\" height=\"100%\">";     
			document.getElementById("reader").innerHTML = embed;
			document.getElementById("pageheader").innerHTML = projectpagelink;
			
		});
	};
	
	
	
	
	
	
	
	
// Start Get index function for project page
	
	function getindex() {
		fetch("/json/mapping.json")
		.then(response => response.json())
		.then((mappingdata) => {
			var seriesindex = "";
			var changedheader = "";
			var projects = mappingdata.projects;
			
			for (var entry in projects) {
			
				if (projects[entry].adult == "Y") {
					var adult = "18+";
				} else { var adult = "";};
				var fullname = projects[entry].fullname;
				var thumb = projects[entry].thumb;
				var statustype = projects[entry].status;
				
				if (type == "" || type == "null" || type == "all") {
					seriesindex += "<div class=\"projectwrap\">";
					seriesindex += "<a href=\"?n=" + entry + "\">";
					seriesindex += "<img src=\"" + thumb + "\" class=\"projectthumb\">";
					seriesindex += "<h1>" + "<span>" + adult + "</span>" + fullname + "</h1></a>";
					seriesindex += "</div>";
					changedheader = "All Projects";
				} else {
					if ( statustype == type ) {
						seriesindex += "<div class=\"projectwrap\">";
						seriesindex += "<a href=\"?n=" + entry + "\">";
						seriesindex += "<img src=\"" + thumb + "\" class=\"projectthumb\">";
						seriesindex += "<h1>" + "<span>" + adult + "</span>" + fullname + "</h1></a>";
						seriesindex += "</div>";
						changedheader = type;
					}
				}
				
			};			
			
			document.getElementById("seriescontainer").innerHTML = seriesindex;
			document.getElementById("projectheader").innerHTML = changedheader;
			
			});
		};
	
	// Start Get chapters function for individual project page
	
		function getchapters() {
			fetch("/json/mapping.json")
			.then(response => response.json())
			.then((mappingdata) => {
				var projectdetail = "";
				var projects = mappingdata.projects;	
				
				var url = projects[series].url;
				if (projects[series].adult == "Y") {
					var adult = "<img src=\"/images/assets/adult.png\" class=\"smallicons\">";
				} else { var adult = "<img src=\"/images/assets/15r.png\" class=\"smallicons\">";};
				var fullname = projects[series].fullname;
				var descrjs = projects[series].description;
				var description = descrjs.replace(/\n/g,"<br>");
				var mulink = projects[series].mulink;
				var thumb = projects[series].thumb;
				var chapnum = projects[series].num;
				var type = projects[series].status;
				
				projectdetail += "<div class=\"projecttopwrap\" align=center>";
				projectdetail += "<div class=\"projectpagecover\"><img src=\"" + thumb + "\"></div>";
				projectdetail += "<div class=\"projectpageinfo\"><div id=\"container\">";
				projectdetail += "<span>" + adult + "</i> <a href=\"" + mulink + "\"><img src=\"/images/assets/muicon.svg\" class=\"smallicons\"></a> ";
				if (type == "licensed") {
					projectdetail += "<a href=\"" + url + "\"><img src=\"/images/assets/licensed.png\" class=\"smallicons\"></a>";
				} else {
					projectdetail += "<a href=\"" + url + "\"><img src=\"/images/assets/cubari.png\" class=\"smallicons\"></a> <a href=\"/read?series=" + series + "\"><img src=\"/images/android-chrome-192x192.png\" class=\"smallicons\"></a>";
				}
				projectdetail += "</span>";
				projectdetail += description + "<button class=\"read-more\">more/less</button>";
				projectdetail += "</div></div></div><div class=\"subcontentcontainer\"><h2>Chapters</h2>";
				projectdetail += "<div class=\"projectouterwrap\" align=center><div class=\"parentproject\">";
				
				for (var entry in chapnum) {
					var d = new Date(chapnum[entry].timestamp*1000);
					var chtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
					var chtitle = chapnum[entry].chtitle;
					var previewimg = chapnum[entry].previewimg;
					
					projectdetail += "<div class=\"projectwrap\">";
					projectdetail += "<a href=\"/read?series=" + series + "&num=" + entry + "\">";
					projectdetail += "<img src=\"" + previewimg + "\" class=\"projectthumb\">";
					projectdetail += "<h1>" + "<span>" + chtime + "</span>" + chtitle + "</h1></a>";
					projectdetail += "</div>";
					
				};
				projectdetail += "</div></div>";
				
				document.getElementById("projectheader").innerHTML = fullname;
				document.getElementById("seriescontainer").innerHTML = projectdetail;
				document.getElementById("projectsnavwrapper").innerHTML = ""
				
				$( document ).ready(function() {
				    $('.read-more').click(function(){
				        $(this).parent().toggleClass('expanded');
				    });
				});

				});
			}	