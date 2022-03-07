// start reader js

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const seriesinput = urlParams.get('series');
	const numinput = urlParams.get('num');
	var num = "" + numinput;     // this isn't the true chapter number if series has skipped chapters/previews/etc
	var series = "" + seriesinput;
	var embedurl = "";
	var embed = "";

	geturl();