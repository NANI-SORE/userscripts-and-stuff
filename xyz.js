// ==UserScript==
// @name         Rule34.xyz link replacer
// @version      0.1
// @author       Nonon
// @include      *://*rule34.xyz*
// @require      https://code.jquery.com/jquery-latest.min.js
// @grant        GM_xmlhttpRequest
// @noframes
// ==/UserScript==

//Переписать чтобы всегда работало само и перезаменяло ссылки при появлении новых элементов
//Найти способ отменить переход после клика
(function() {
	'use strict';
	function init() {

		window.openInNewTab=function(event){
			//console.log(event);
			//event.preventDefault();
			//alert(event.defaultPrevented);
			//event.stopPropagation();
			//event.stopImmediatePropagation();
			//event.returnValue = false;
			if(!event.target.href) return false;

			//alert('clicked');
			var win = window.open(event.target.href, '_blank');
			win.focus();

			window.history.back();
			return false;
		}

		var allPosts = document.querySelectorAll('.post-icon, .post-icon-large');
		//console.log(allPosts);
		var infos = []; //[number in allPosts array, post type, array of link elements, numbers to recreate link]
		//var infoCount = 0;
		var wrong = ['volume_up','volume_off'];
		for(var i=0;i<allPosts.length;i++) { var e=allPosts[i];
											//allPosts.forEach(function(e,i){
											if(wrong.indexOf(e.innerText) < 0) {
												var parent = e.parentNode.parentNode.parentNode;
												var links = parent.querySelectorAll('a');
												var numbers = parent.querySelector('img:not(.headerBox-item)').src.match(/thumbnail\/(\d+\/\d+)\.\w+$/i)[1];
												var isParsed = false;
												//console.log(numbers)
												for(var k=0;k<links.length;k++) { var l=links[k];
																				 //links.forEach(function(l){
																				 if(l.getAttribute('data-parsed')) {
																					 isParsed=true;
																					 return;
																				 }
																				 l.setAttribute('onclick', 'return window.openInNewTab(event)');
																				}//})
												if(isParsed) return;
												infos.push([i, e.innerText, links, numbers]);//infoCount])
												//infoCount++;
											}
										   }//})
		//console.log(infos);
		alert('test1');
		for(var n=0;n<infos.length;n++) { var c=infos[n];
										 //infos.forEach(function(e,i){
										 setTimeout(function(){checkExt(c)}, 200*n);
										}//})
	}
	var start = false;
	var int=setInterval(function(){
		if(start) clearInterval(int);
		else if(document.querySelectorAll('.post-icon, .post-icon-large').length>0) {
			start = true;
			init();
		}
	},200);

	window.BM_MODE=true;
	function checkExt(info) {
		var parsedLinks = parseExt(info[3], info[1]);
		//console.log('links: ',parsedLinks);
		//return;
		for(var m=0;m<parsedLinks.length;m++) { var l=parsedLinks[m];
											   //parsedLinks.forEach(function(l){
											   var callback = function(xhr) { editLink(xhr, info); }
											   var errorCall = function(xhr) { errorHandle(xhr); }
											   if(window.BM_MODE) {
												   var xhr = new XMLHttpRequest();
												   xhr.open("GET", l, true);
												   xhr.onload = function(){callback(xhr);};
												   xhr.onerror = function(){errorCall(xhr);};
												   xhr.send();
											   }
											   else {
												   GM_xmlhttpRequest({
													   "method"    : 'GET',
													   "url"       : l,
													   "onerror"   : errorCall,
													   "onload"    : callback
												   });
											   }
											  }//})
	}

	function errorHandle(data) {
		console.log('ERROR:\n', data);
	}

	function parseExt(nums, type) {
		//https://rule34.xyz/files/3004/3004747.jpeg
		var exts, a = [];
		switch(type){
			case 'image':
				exts = ['png', 'jpg', 'jpeg'];
				break;
			case 'gif':
				exts = ['gif'];
				alert('test2');
				break;
			case 'videocam':
				exts = ['webm', 'mp4'];
				break;
			default:
				exts = ['png', 'jpg', 'jpeg', 'gif', 'webm', 'mp4'];
				break;
		}
		exts.forEach(function(ext){
			a.push('https://rule34.xyz/files/'+nums+'.'+ext);
		})
		return a;
	}

	function editLink(data, info) {
		//console.log(data)
		//console.log(data.responseURL||data.finalUrl);
		if(data.responseText[0]!=='<') {
			alert('test3');
			for(var j=0;j<info[2].length;j++) { var e=info[2][j];
											   //info[2].forEach(function(e){
											   e.href=data.responseURL||data.finalUrl;
											   //e.setAttribute('onclick', 'return openInNewTab(event)');
											   e.setAttribute('data-parsed', true);
											   e.style.backgroundColor = '#D9360033';
											   //e.style.opacity = 0.33;
											  }//})
		}
	}

	function createBtn() {
		var refreshBtn = document.createElement("a");
		refreshBtn.setAttribute( "style", "cursor:pointer; position: fixed; top: 2vh; right: 1px; padding: 2px 0 0; width: 50px; height: 50px; display: block; overflow: hidden; background: #777; color: #fff; font-size: 14pt; text-decoration: none; font-weight: bold; text-align: center; line-height: 15pt; z-index: 1000000; " );
		refreshBtn.onclick = function() { init(); }
		refreshBtn.innerHTML = "R";
		var body_ref = document.getElementsByTagName("body")[0];
		body_ref.appendChild(refreshBtn);
	}
	createBtn();
})();
