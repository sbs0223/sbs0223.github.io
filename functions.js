/* Start Latest Updates section
needs to be manually sorted by date & clipped to 4 entries atm with the json raw...*/

	function getlatest() {

		fetch("json/latest")
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
				else window.location = "index.html";
			}
		)
		}
	}
	
	
	
	
// Start Get URL function for the reader
	
	function geturl() {
		fetch("json/map_links")
		.then(response => response.json())
		.then((mappingdata) => {
			var links = mappingdata.links;
			
			try {
				embedurl = links[series].url;
			}
			catch(err) {				
				window.location.replace("404.html");   // send wrong series names to 404
			}
			
			adult = links[series].adult;
			
			if ( number === "" || number === "null" ) {
				embedurl = links[series].url;
			} else {
				embedurl = links[series].num[number];
			};
						
			if (!embedurl) {
				window.location.replace("404.html");  //send wrong chapter numbers to 404
			} else if ( adult === "Y" ) {
				showUserAlerts();   // trigger swal if 18+ series
			} else { };  // no additional action if non-mature series with valid chapter
			
			embed = "<embed type=\"text/html\" src=\"" + embedurl + "\" width=\"100%\" height=\"100%\">";     
			document.getElementById("reader").innerHTML = embed;
		});
	};