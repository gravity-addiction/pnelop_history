pnelop_history
==============

PNelOP History

Implementation of the HTML5 History.

Gives you an easy ability to dynamically update the page url without ever refreshing the page. Process each new url instance client side, updating as little or as much of the page you'd like to.
This allows the user to have the ability to bookmark and or refresh pages that are dynamically generated.

When developing these types of sites please take care that you'll be responsible for page dom cleanup.


Basic implementation
```
<script src="pnelop_history.js"></script>
<script>
function bootProcess() {
  alert('Current URL: '+arguments[0]);
}
PNelOP_History.init(bootProcess);
</script>
```

Calling PNelOP_History.init();
argument sent to init needs to be a function prepared to receive the current URL as first argument.

Typically processing the incoming url can be done two ways

1. load the url into a javascript &lt;a&gt; tag and let the browser parse your url into parts, http://www.w3schools.com/jsref/obj_location.asp
```
var urlParsed = document.createElement("a");
urlParsed.href = arguments[0];
```

2. use the PNelOP History defined functions
```
var searchParams = PNelOP_History.getSearchParams(arguments[0]);
var hashParams = PNelOP_History.getHashParams(arguments[0]);
```

Basic booter process with url parsing
```
function bootProcess() {
  var tURL, tParsed = document.createElement("a"), pURL, pParsed = document.createElement("a");
  
  // parse argument[0] .. typically current url passed
  if (arguments.length>0 && (typeof arguments[0]) == 'string') { tURL = arguments[0]; } else { return; }
  if (!!tURL) tParsed.href = tURL;

  // parse argument[1] .. typically historical previous url passed
  if (arguments.length>1 && (typeof arguments[1]) == 'string') { pURL = arguments[1]; }
  if (!!pURL) pParsed.href = pURL;
  
  // use PNelOP_History defined functions to get search and hash parameters
  // also possible to use tURL.search tURL.hash  pURL.search pURL.hash for the data
  var searchParams={}; try { searchParams = PNelOP_History.getSearchParams(); } catch(e) { }
  var hashParams={}; try { hashParams = PNelOP_History.getHashParams(); } catch(e) { }
        
  // Where the user defined stuff comes in, this statements checks for ?linkQuery passed and alerts its value. as a demo
  if (typeof searchParams == 'object' && typeof searchParams.linkQuery == 'string') alert("Link Query: "+searchParams.linkQuery);

  // Attempt to reload PNelOP_History pushLink abilities
  // add class="pushLink" href="myurl.html" to any clickable tag to implement html5 abilities automatically
  try { PNelOP_History.loadPushLinks(); } catch(e) { }
return true;	  
}
```

By default any clickable tag with class="pushLink" will have its click event rewritten from loading the url to processing the url with the PNelOP History module.

```
<a href="index.html" class="pushLink">Homepage</a>
```

Callable functions within PNelop_History
PNelOP_History.init(booterFunction);
* booterFunction: function routine to deal with url parsing and building each page


PNelOP_History.loadPushLinks(querySelect); // resets object
* querySelect: document.querySelectorAll query for objects


PNelOP_History.pushURL(url);
// url to push to browser url bar and fires popstate for page
* url: parseable url


PNelOP_History.fetchPage(url);
// fetchs the url without updating browser url
* url: parseable url

PNelOP_History.addLink();
// interface directly to pushState or window.location depending on if html5 history is enabled
* url: parseable url

PNelOP_History.getSearchParams([url]);
PNelOP_History.getHashParams([url]);
* url: parseable url, optional: uses window.location when omitted
// Parses url or window.location for either search or hash parameters and returns them in an object


PNelOP_History.popState();
// Fires the window popstate, which is the main event html5 history runs off of