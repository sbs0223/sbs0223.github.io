// do some checks for the URL params - this isn't useful right now since we are only allowing project page comments, but I'm keeping it here in case in the future we won't need to embed the reader.

checkn = getParamValue('n');
checkseries = getParamValue('series');
checknum = getParamValue('num');

var md = window.markdownit('zero').enable(['strikethrough','emphasis','image','normalize'],false).use(window.markdownitRedditSpoiler.spoiler);

if(checkn){
	series = sanitizeHtml(checkn);
} else {
	if(checkseries){
		series = sanitizeHtml(checkseries);
	} else {
		series = "";
	}
}

if(checknum){
	chnum = checknum;
} else {
	chnum = 0;
}

(function() {
  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if(elements[k].name !== undefined) {
        return elements[k].name;
      // special case for Edge's html collection
      }else if(elements[k].length > 0){
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name){
      var element = elements[name];
    
      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });


		formData['Timestamp'] = Date.now();
		formData['Series'] = series;
		formData['Number'] = chnum;
		
    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name

    return {data: formData, honeypot: honeypot};
  }

  function handleFormSubmit(event) {  // handles form submit without any jquery
    event.preventDefault();           // we are submitting via xhr below
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;

    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    disableAllButtons(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          form.reset();
					document.getElementById("sentmessage").innerHTML = "<center><b>Your comment has been sent! It might take a few minutes for it to appear so please do not resend it.</b></center>";
					setTimeout(function() {
					    location.reload();
					}, 5000);
        }
    };
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
    xhr.send(encoded);
  }

  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  };
  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }
})();

function getParamValue(paramName)
{
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++) 
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName) 
            return pArr[1]; //return value
    }
}

function getcomments(){
	
	var chapquery = "";
	if(chnum === 0 || isNaN(chnum) || chnum == null || chnum === "" || chnum === "0"){
		chapquery = "";
	} else {
		chapquery = "and Number = " + chnum + " ";
	}

  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQABY2QntPAjViT8mZnc4X0Cx7KLnDg8j2k1sxKZNg9LuTHq26dAwY3gn8QSdwIGFa68rXPKAHo2zoS/pub?output=csv';
  alasql.promise("SELECT * FROM CSV(?, {headers:true}) where Series = '" + series + "' " + chapquery + "order by Timestamp desc", [url]).then(function(results){
		var entry = ""
		
		entry += "<div class=\"commentwrapper\">";
		
		for(var i = 0; i < results.length; i++) {
		    var obj = results[i];
				var d = new Date(obj.Timestamp);
				if(obj.Number == 0){
					var num = "";
				} else {
					var num = " | " + obj.Number + "";
				}
				
				const CleanName = sanitizeHtml(obj.Name, {
					allowedTags: [],
					allowedAttributes: {}
				});
				const CleanComment = md.renderInline(obj.Comment);

				entry += "<div class=\"CommentEntry\">";
				entry += "<span class=\"CommentName\">" + CleanName + "</span>";
				entry += "<span class=\"CommentInfo\">" + formatDate(d) + " | " + series + num + "</span>";
				entry += "<div class=\"CommentContent\">" + CleanComment + "</div>";
				entry += "</div>";
		}
		
		entry += "</div>";
		
		document.getElementById("displaycomments").innerHTML = entry;
		
	});
	
}

// click to append for comment
var items = document.querySelectorAll('[data-item]');
[].forEach.call(items, function(item) {
    item.addEventListener('click', function(){
			event.preventDefault(); 
			var curPos = $("#Comment")[0].selectionStart;
			let x = $("#Comment").val();
			let insertmarkdown = item.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	    $("#Comment").val(
				x.slice(0, curPos) + insertmarkdown + x.slice(curPos));
    });
});

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

function textCounter(field,field2,maxlimit)
{
 var countfield = document.getElementById(field2);
 if ( field.value.length > maxlimit ) {
  field.value = field.value.substring( 0, maxlimit );
  return false;
 } else {
  countfield.value = field.value.length;
 }
}