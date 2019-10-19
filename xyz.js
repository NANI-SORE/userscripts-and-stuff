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

function init() {

	window.openInNewTab=function(event){
		console.log(event);
		//event.preventDefault();
		//alert(event.defaultPrevented);
		//event.stopPropagation();
		//event.stopImmediatePropagation();
		//event.returnValue = false;
		if(!event.target.href) return false;

		alert('clicked');
		var win = window.open(event.target.href, '_blank');
		win.focus();

		window.history.back();
		return false;
	}

	let allPosts = document.querySelectorAll('.post-icon, .post-icon-large');
	//console.log(allPosts);
	let infos = []; //[number in allPosts array, post type, array of link elements, numbers to recreate link]
	//let infoCount = 0;
	let wrong = ['volume_up','volume_off'];
	allPosts.forEach((e,i)=>{
		if(wrong.indexOf(e.innerText) < 0) {
			let parent = e.parentNode.parentNode.parentNode;
			let links = parent.querySelectorAll('a');
			let numbers = parent.querySelector('img:not(.headerBox-item)').src.match(/thumbnail\/(\d+\/\d+)\.\w+$/i)[1];
			let isParsed = false;
			//console.log(numbers)
			links.forEach(l=>{
				if(l.getAttribute('data-parsed')) {
					isParsed=true;
					return;
				}
				l.setAttribute('onclick', 'return window.openInNewTab(event)');
			})
			if(isParsed) return;
			infos.push([i, e.innerText, links, numbers]);//infoCount])
			//infoCount++;
		}
	})
	//console.log(infos);
	infos.forEach((e,i)=>{
		setTimeout(function(){checkExt(e)}, 200*i);
	})
}
let start = false;
let int=setInterval(function(){
	if(start) clearInterval(int);
	else if(document.querySelectorAll('.post-icon, .post-icon-large').length>0) {
		start = true;
		init();
	}
},200);

//BM_MODE=true;
function checkExt(info) {
	let parsedLinks = parseExt(info[3], info[1]);
	//console.log('links: ',parsedLinks);
	//return;
	parsedLinks.forEach(l=>{
		var callback = function(xhr) { editLink(xhr, info); }
		var errorCall = function(xhr) { errorHandle(xhr); }
		if(BM_MODE) {
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
	})
}

function errorHandle(data) {
	console.log('ERROR:\n', data);
}

function parseExt(nums, type) {
	//https://rule34.xyz/files/3004/3004747.jpeg
	let exts, a = [];
	switch(type){
		case 'image':
			exts = ['png', 'jpg', 'jpeg'];
			break;
		case 'gif':
			exts = ['gif'];
			break;
		case 'videocam':
			exts = ['webm', 'mp4'];
			break;
		default:
			exts = ['png', 'jpg', 'jpeg', 'gif', 'webm', 'mp4'];
			break;
	}
	exts.forEach(ext=>{
		a.push('https://rule34.xyz/files/'+nums+'.'+ext);
	})
	return a;
}

function editLink(data, info) {
	//console.log(data)
	//console.log(data.responseURL||data.finalUrl);
	if(data.responseText[0]!=='<') {
		info[2].forEach(e=>{
			e.href=data.responseURL||data.finalUrl;
			//e.setAttribute('onclick', 'return openInNewTab(event)');
			e.setAttribute('data-parsed', true);
			e.style.backgroundColor = '#D9360033';
			//e.style.opacity = 0.33;
		})
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
