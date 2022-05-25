// do some checks for the URL params - this isn't useful right now since we are only allowing project page comments, but I'm keeping it here in case in the future we won't need to embed the reader.

var checkn = getParamValue('n');
var checkseries = getParamValue('series');
var checknum = getParamValue('num');
var series = ""
var chnum = ""
var commentHeightLimit = "320";

// initialize markdown-it & define custom emojis
var md = window.markdownit('zero').enable(['strikethrough','emphasis','image','normalize'],false).use(window.markdownitRedditSpoiler.spoiler).use(window.markdownitEmoji,{
  defs: {
    bulbaowo: '<img src=\"https://cdn.discordapp.com/emojis/944377400119140352.png\">',
		catsip: '<img src=\"https://emoji.discord.st/emojis/87c9f78d-2cda-4696-a64f-7c605445b85c.jpg\">',
		catcute: '<img src=\"https://cdn.discordapp.com/emojis/944377400416960540.png\">',
		cat_paws: '<img src=\"https://cdn.discordapp.com/emojis/944377400211410964.png\">',
		aaaa: '<img src=\"https://cdn.discordapp.com/emojis/955833829237620756.png\">',
		PandaLove: '<img src=\"https://cdn.discordapp.com/emojis/944377400861540403.png\">',
		CatKnifeUwU: '<img src=\"https://cdn.discordapp.com/emojis/944377400408563732.png\">',
		blobaww: '<img src=\"https://cdn.discordapp.com/emojis/944377399917830205.png\">',
		angreydoggo: '<img src=\"https://cdn.discordapp.com/emojis/955833829078229044.png\">'
  },
  shortcuts: {
    bulbaowo: [ ':bulbaowo:', '|bulbaowo|' ],
    catsip: [ ':catsip:', '|catsip|' ],
    catcute: [ ':catcute:', '|catcute|' ],
    cat_paws: [ ':cat_paws:', '|cat_paws|' ],
    aaaa: [ ':aaaa:', '|aaaa|' ],
    PandaLove: [ ':PandaLove:', '|PandaLove|' ],
    CatKnifeUwU: [ ':CatKnifeUwU:', '|CatKnifeUwU|' ],
    blobaww: [ ':blobaww:', '|blobaww|' ],
    angreydoggo: [ ':angreydoggo:', '|angreydoggo|' ]
  }
});
md.renderer.rules.emoji = function(token, idx) {
  return '<span class="emoji emoji_' + token[idx].markup + '">'+token[idx].content+'</span>';
};

// sets series and chapter number (the num of the reader links) based on url parameters
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
	if(chnum !== '0') {
		$('#chapnumSpan').css('display','block');
		$('input#Number').attr({'value':chnum});
	}
} else {
	chnum = 0;
}


// start comments form send

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

// end comments form send


// Define function which grabs the url paramters

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


// display comments

function getcomments(){
	var chapquery = "";
	if(chnum === 0 || isNaN(chnum) || chnum == null || chnum === "" || chnum === "0"){
		chapquery = "";
	} else {
		chapquery = "and Number = " + chnum + " ";
	}
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQABY2QntPAjViT8mZnc4X0Cx7KLnDg8j2k1sxKZNg9LuTHq26dAwY3gn8QSdwIGFa68rXPKAHo2zoS/pub?output=csv';
  alasql.promise("SELECT * FROM CSV(?, {headers:true}) where Series = '" + series + "' " + chapquery + "order by Timestamp desc", [url]).then(function(results){
		
		$("#displaycomments").append("<div class=\"commentwrapper\">");
		
		for(var i = 0; i < results.length; i++) {
				var entry = ""
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
				const CleanComment = md.renderInline(obj.Comment).replace(/<img/g,"<img width=\"300\" height=\"196\" class=\"userimg\" loading=\"lazy\"");

				entry += "<div class=\"CommentEntry\">";
				entry += "<span class=\"CommentName\">" + CleanName + "</span>";
				entry += "<span class=\"CommentInfo\">" + formatDate(d) + " | " + series + num + "</span>";
				entry += "<div class=\"CommentContent collapseComments\" id=\"comment" + i + "\">";
				entry += CleanComment;
				entry += "<div id=\"bar"+i+"\" class=\"expandbar\" onclick=\"expand("+i+")\"><span class=\"downarrow\" id=\""+i+"\">&raquo;</span></div>";
				entry += "</div>";
				entry += "</div>";
				$("#displaycomments").append(entry);
				
				lazyload();
		}
		
		$("#displaycomments").append("</div>");		
	
	})
	.then(function(){
		$('.collapseComments').each(function(i, obj) {
			$(obj).imagesLoaded( function() {
				var height = $(obj).prop('scrollHeight');
				if (height <= commentHeightLimit) {
					$(obj).children(".expandbar").hide();
				}
			})
		});
	})
}
function expand(x){
	$("#comment"+x).removeClass("collapseComments");
	$("#bar"+x).hide();
}

// end display of comments


// click to append for comment
var items = document.querySelectorAll('[data-item]');
[].forEach.call(items, function(item) {
    item.addEventListener('click', function(){
			event.preventDefault(); 
			var curPos = $("#Comment")[0].selectionStart;
			let x = $("#Comment").val();
			let insertmarkdown = item.getAttribute("data-item").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	    $("#Comment").val(
				x.slice(0, curPos) + insertmarkdown + x.slice(curPos)).trigger('input');
    });
});
// click to wrap tags around selection
var items = document.querySelectorAll('[data-before]');
[].forEach.call(items, function(item) {
    item.addEventListener('click', function(){
			event.preventDefault(); 
  		const beforesel = $("#Comment").val().substring(0, $("#Comment")[0].selectionStart);
  		const thesel = $("#Comment").val().substring($("#Comment")[0].selectionStart, $("#Comment")[0].selectionEnd);
  		const aftersel = $("#Comment").val().substring($("#Comment")[0].selectionEnd);
			let insertmarkdown = item.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			if(`${thesel}` === "") {
				$("#Comment").val(
					`${beforesel}` + insertmarkdown + `${aftersel}`
				).trigger('input');
			} else{
				$("#Comment").val(
					`${beforesel}` + item.getAttribute("data-before") + `${thesel}` + item.getAttribute("data-after") + `${aftersel}`
				).trigger('input');
			}
    });
});
// click to add GIF tags
window.addEventListener('message', function (gifurl) {
  if (gifurl.data.source === 'findgif') {
		var curPos = $("#Comment")[0].selectionStart;
		let x = $("#Comment").val();
    $("#Comment").val(
			x.slice(0, curPos) + "![](" + gifurl.data.url + ")" + x.slice(curPos)).trigger('input'); 
		$("#framefindgif").slideToggle();
  } else{
		return;
	}
});


// functions for the date of comments
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

// calculate characters remaining for the comment box
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

// toggle gif iframe & comment preview
$(document).ready(function(){
	getcomments();
  $("#buttonfindgif").click(function(){
		event.preventDefault(); 
    $("#framefindgif").slideToggle();
  });
  $("#previewcomment").click(function(){
		event.preventDefault(); 
    $("#previewcommentwrapper").slideToggle();
  });
});

// toggle more emojis
function showMoreEmo() {
	event.preventDefault(); 
	var emoSpan = $('#spanMoreEmo');
	if(emoSpan.is(":visible")) {
		$('.moreEmo').each(function(i, obj) {
			emoSpan[0].style.display="none";
			$(obj).css("display","none");
			$('#aMoreEmo').html('&raquo;');
		})
	} else 
	$('.moreEmo').each(function(i, obj) {
		emoSpan[0].style.display="inline";
		$(obj).css("display","inline-block");
		$('#aMoreEmo').html('&laquo;');
	})
}

// preview comments

$("textarea#Comment").bind('input', function() {
    $("div#previewcomment").html(md.renderInline($(this).val()).replace(/<img/g,"<img width=\"300\" height=\"196\" class=\"userimg\""));
});