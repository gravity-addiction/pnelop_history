/*
 * PNelOP History
 * Javascript HTML5 History Implementation
 *
 * Author: Gary Taylor, gary@gmerc.com
 * Version: 1.2
 * Copyright 2008 - 2014 Gary Taylor <gary@gmerc.com>
 * Distributed under the MIT License.
 ******************************************************
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************
*/

// HTML 5 History Implementation
PNelOP_History = (function () {
  version = '1.2';
  
  var PNelOP_History
  ,__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }
  ,_historyPrevURL = ''
  , _historyCurURL = ''
  , _enabled = Boolean(window.history && window.history.pushState && window.history.replaceState && !(
    (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
    || (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
  ))
  , _pushLinkClass = '.pushLink'
  , _forceFetchPage = true
  , _initPop = false
  , _html5User = false
  , _debug = false,
  debug = function() {
    if (!_debug) return; // No Booter Debugging
    try { console.log(arguments); } catch (e) { if (arguments.length>0) { alert(arguments[0]); } }
  };
  
  PNelOP_History = (function() {
    function PNelOP_History() {
      this.init = __bind(this._init, this);
      this.loadPushLinks = __bind(this._loadPushLinks, this);
      this.pushURL = __bind(this._pushURL, this);
      this.fetchPage = __bind(this._fetchPage, this);
      this.addLink = __bind(this._addLink, this);
      this.popState = __bind(this._popState, this);
      this.getSearchParams = __bind(this._getSearchParams, this);
      this.getHashParams = __bind(this._getHashParams, this);
    };


    PNelOP_History.prototype._init = function() {
      debug('HTML5 History Enabled: ',_enabled);
      var cbFunc;
      var t = this;
      if (arguments.length>0 && typeof arguments[0] == 'function') cbFunc = arguments[0];
    
      try {
        if (_enabled) _html5User = true; else _html5User = false;
      } catch(err) {
        _html5User = false;
      }

      _historyCurURL = location.href;

      // Hook into State Changes
      window.onpopstate = function() {
        // Prepare Variables
        _initPop = true;
        
        //console.log('Pop State Change: ',_forceFetchPage,location.href,_historyCurURL);
        if (!_forceFetchPage && location.href == _historyCurURL) {
          debug("Identical Pop State. History Cannot Help You");
          return false;
        }

        debug("SEARCH: ",t._getSearchParams());
        debug("HASH: ",t._getHashParams());

        // Fetch Page
        setTimeout(function() { t._fetchPage(location.href, null, cbFunc); }, 2);
        _forceFetchPage = false;
        return true;
      }; // end onStateChange

      window.onhashchange = function() {
        debug('Hash Change: HTML5 User?',_html5User);
        if (!_html5User) t.popState();
        return true;
      }
    //}, this);

    // sometimes dynamic pages load automatically without the need of popstate
    // browsers without html5 history capabilities always need popstate triggered
    // UNREM to stop popstate on pageload for html5 browsers
    //if (!_html5User)  
      // Init Popstate when browser wont initilize itself
      setTimeout(function() { if (_initPop==false) t.popState(); }, 2);
    }; // end Init
    
    PNelOP_History.prototype._popState = function() {
      var event; // The custom event that will be created
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("popstate", true, true);
        event.eventName = "popstate";
        document.dispatchEvent(event);
      } else {
        event = document.createEventObject();
        event.eventType = "popstate";
        event.eventName = "popstate";
        document.fireEvent("on" + event.eventType, event);
      }
    };
    
    PNelOP_History.prototype._addLink = function(_url) {
      if (_enabled) history.pushState(null, null, _url);
      else window.location = _url;
    };
    
    PNelOP_History.prototype._loadPushLinks = function() {
      // Dbl Check HTML5
      if (!_enabled) {
        if (_html5User) _html5User = false;
        return false;
      }

      var linkClass;
      var childClass = null;
      if (arguments.length>0 && (typeof arguments[0])=='string') try { linkClass = document.querySelectorAll(arguments[0]); } catch(e) { }
      else if (arguments.length>0 && (typeof arguments[0])=='object') linkClass = arguments[0];
      else linkClass = document.querySelectorAll(_pushLinkClass);
      
      if (arguments.length>1 && (typeof arguments[1])=='string') try { childClass = document.querySelectorAll(arguments[1]); } catch(e) { }
      else if (arguments.length>1 && (typeof arguments[1])=='object') childClass = arguments[1];
      else childClass = null;
      
      // Wait for Document
      //$(function(){
        // internal links
        for (var i = 0, n = linkClass.length; i < n; i++) {
          //if(childClass==null || (childClass!=null && $(this).parents(childClass).length > 0)) {
          var lClone = linkClass[i].cloneNode(true);

          lClone.addEventListener('click',function(event){
            event.stopPropagation();
            event.preventDefault();
            // Continue as normal for cmd clicks etc
            if ( event.which == 2 || event.metaKey ) { return true; }

            var url = this.getAttribute('href');
            window.PNelOP_History.pushURL(url);

            return false;
          });
          linkClass[i].parentNode.replaceChild(lClone, linkClass[i]);
          //}
        };
      //}); // end onDomLoad
    }; // end closure

    PNelOP_History.prototype._pushURL = function(url) {
      
      // Check to see if PNelOP_History is enabled
      if (!_enabled) {
        location.href=url;
        return false;
      }

      // Check against current url
      history.replaceState(null,null,url);
      if (location.href != _historyCurURL) {
        history.replaceState(null,null,_historyCurURL);
        history.pushState(null,null,url);
      }

      // All Links Force Page Update
      _forceFetchPage = true;

      // PopState to fetchPage
      this._popState();
    };

    PNelOP_History.prototype._fetchPage = function() {
      var _nURL = location.href; // Refresh
      var _pURL = _historyCurURL;
      var _options = {};
      var _cbFunc = function() { }
      var t = this;

      if (arguments.length>0 && arguments[1]!=null) _nURL = arguments[0];
      if (arguments.length>1 && arguments[1]!=null) _pURL = arguments[1];
      if (arguments.length>2 && typeof arguments[2] == 'function') _cbFunc = arguments[2];

      _historyPrevURL = _pURL;
      _historyCurURL = _nURL;

      setTimeout(function() {
        _cbFunc.apply(t, [_nURL, _pURL]);
        //t._loadPushLinks(); // Load pushlink by default
      }, 2);
      return true;
    };

    PNelOP_History.prototype._getSearchParams = function() {
      var searchParams = {}, searchString = window.location.search.substring(1);
      if (arguments.length>0 && (typeof arguments[0]) == 'string' && arguments[0].trim() != '') searchString = arguments[0];

      var e,
          a = /\+/g,  // Regex for replacing addition symbol with a space
          r = /([^&;=]+)=?([^&;]*)/g,
          d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
          q = searchString;

      while (e = r.exec(q))
        searchParams[d(e[1])] = d(e[2]);

      return searchParams;
    };

    PNelOP_History.prototype._getHashParams = function() {
      var hashParams = {}, hashString = window.location.hash.substring(1);
      if (arguments.length>0 && (typeof arguments[0]) == 'string' && arguments[0].trim() != '') hashString = arguments[0];

      var e,
         a = /\+/g,  // Regex for replacing addition symbol with a space
          r = /([^&;=]+)=?([^&;]*)/g,
          d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
          q = hashString;

      while (e = r.exec(q))
        hashParams[d(e[1])] = d(e[2]);

      return hashParams;
    };
    
    return PNelOP_History;
  })();
  
  PHist = new PNelOP_History();  
  return PHist;
}).call(this);


// PNelOP HTML 5 History Startup
// takes one argument typeof function
// this function is called everytime the page updates.. argument[0] is the current url.. argument[1] is the previous url
/*PNelOP_History.init(
  function(curURL, prevURL) {
    console.log("Current",curURL);
    console.log("Previous",prevURL);
  }
);*/

// Push Specific page
//PNelOP_History.pushURL('yoururl.html');