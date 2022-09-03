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