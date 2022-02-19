const scrollToFocus = (height) => {
	if (typeof document !== 'undefined')
	{
		if (!!window.chrome && !!window.chrome.webstore) {
	        document.addEventListener('keyup', (e) => {
	            document.activeElement !== document.body &&
	            e.keyCode === 9 &&
	            document.activeElement.getBoundingClientRect().y <= height
	                ? document.activeElement.scrollIntoView({ block: 'center' })
	                : null;
	        });
	    } else {
	        document.addEventListener('keyup', (e) => {
	            document.activeElement !== document.body &&
	            e.keyCode === 9 &&
	            document.activeElement.getBoundingClientRect().top <= height
	                ? document.activeElement.scrollIntoView(false)
	                : null;
	        });
	    }
	}
    
};

export default { scrollToFocus };
