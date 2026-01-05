/*
	Tools and scripts for Sharon Hargus' annotated websites.  Here BD/Belle Deacon files correspond to files with a single long audio, and Chapman files refer to files with a folder of short audio clips.
*/

function getFirstAlpha(str){
	for(var i=0;i<str.length;i++)
		if(isNaN(str[i]))
			return i;
	return false;
}

function BDPageSuper(){	// shared stuff for BDPage and BDAnnPage
	// AudioPage but for Belle Deacon (single audio file) pages
	AudioPage.call(this);
	this.loadAudioHolder();

	// add clickable listener for each textIGT
	// in this case, we don't try to load audio (TODO: unless there are timestamps associated!)
	for(var i=0;i<this.textIGTs.length;i++)
		this.textIGTs[i].addEventListener('click',function(ev){
			var id = ev.target.id;
			this.igtcurrent=parseInt(id.substring(1,id.length).match(/\d+/)[0]);
			console.log(this.current);
			if(this.annotation_mode) this.annotation_takes[this.igtcurrent]=0;
			this.showIGT(false,this.igtcurrent);
			// if there's a corresponding timestamp for this item, then
			// seek the audio to that point
			this.seekAudio(this.igtcurrent);
		 }.bind(this));

	this.load = function(){
		console.log("bd: ap.load");
		// make the audio element into the relevant one
		// load that audio
		this.audios[this.current].load();
		console.log(this);
	};

	this.seekAudio = function(idx){
		console.log("seekAudio");
		if(typeof(this.timestamps["sentence-starts"])!="undefined" &&
			 typeof(this.timestamps["sentence-starts"][idx] != "undefined"))
			this.audios[0].currentTime=this.timestamps["sentence-starts"][idx];
	}.bind(this);

	window.onkeydown = function(e) { 

		if (e.key == "Enter") {
			e.preventDefault();
			for(var i=0;i<window.ap.timestamps["sentence-starts"].length;i++){
				if(window.ap.timestamps["sentence-starts"][i]>window.ap.audios[0].currentTime){
					// sbng maybe here, too
					window.ap.audios[0].currentTime = window.ap.timestamps['sentence-starts'][i];
					break;
				} 
			}
			// more work needed 
		} else if (e.key == "ArrowLeft") {
			e.preventDefault();
			console.log("Left works, Sara");
			window.ap.audios[0].currentTime -= 2;
		} else if (e.key == "ArrowRight") {
			e.preventDefault();
			console.log("Right works, Sara");
			window.ap.audios[0].currentTime += 2;
		}; }

	// OVERRIDEs
	// update the current IGT showing in the window
	// update any highlighting the in the text scroll area
	this.showIGT = function(keepstamps,index){
		console.log("showIGT from BDPageSuper");
		// hidem all
		this.hideIGTs();

		var winigt = this.getWinIGT(index);
		if(this.annotation_mode){
			// in annotation mode, we make a copy of the relevant winIGT
			// and show that

			if(this.annotationIGT){
				this.annotationIGT.parentNode.removeChild(this.annotationIGT);
				this.annotationPop = null;
			}

			this.annotationIGT = this.cloneIGT(this.getWinIGT());

			// add the timestamp editors to this IGT
			this.addTSEditors(this.annotationIGT);
			this.annotationPop = Popcorn(this.audios[this.current]);


			// if keepstamps, need to addStamps as well
			if(keepstamps) this.addStamps();

			this.annotationIGT.style.display="table";

			// add column highlights
			this.addColHighlightsAndStyles(this.annotationIGT);

			winigt = this.annotationIGT;

		} else {
			// not annotation mode, so show the one we got back from getWinIGT
			winigt.style.display="table";
		}

		// in both modes, we can highlight the one in the text which we're on
		// but in annotation mode, we also show timestamp status by color
		for(var i=0;i<this.textIGTs.length;i++){
			var tss = "";
			if(this.annotation_mode){
				var tss = this.tsStatus(this.textIGTs[i]);
			}
			this.textIGTs[i].setAttribute('class', 'igt '+tss);
		}

		// in annotation_mode, we don't use "active"
		if(!this.annotation_mode)
			this.getTextIGT(index).setAttribute('class','active igt');


		// and this is a good time to do column reformatting if we overflow
		// let's only do this on non annotation mode (cos it might break things!!)
		if(!this.annotation_mode){
			if(winigt.clientWidth>this.win.clientWidth){
				console.log("IGT overflow!");

			}
		}
	}.bind(this);

}

function BDPage(){
	BDPageSuper.call(this);
	this.currIGT = 0;

	this.loadTS("bd");

	this.sentenceChanger = function(){
		var cTime = this.audios[this.current].currentTime;
		// see which one we should be on according to timestamps
		var latest = 0;
		for(var i=0;i<this.timestamps["sentence-starts"].length;i++){
			if(this.timestamps["sentence-starts"][i]<cTime){
				// sbng maybe here, too
				latest = i;
			}
		}

		if(this.currIGT != latest) {
			this.currIGT = latest;
			console.log(latest," is current sentence");
			this.showIGT(false,latest);
		}

	}.bind(this);


	this.setUpTS = function() {
		// If we got any timestamps for 'sentence-starts', let's add a listener to use them
		if(typeof(this.timestamps["sentence-starts"]) != "undefined"){
			this.audios[this.current].addEventListener('timeupdate',this.sentenceChanger);
			this.showIGT();
			//sbng i think this is what needs changing
		} else {	// no annotations, so may as well hide the window
			this.winIGTs = undefined;
			document.getElementById("window").parentNode.removeChild(document.getElementById("window"));
			// replace the border on the top of the text area
			document.getElementById("text").style.border = "1px solid black";
		}
	}

}

function BDAnnPage() {
	// A lot like the chapman annotation page, but first level is the
	// division into igts, which at this level, means a lot fewer popcorns
	this.annotation_takes = { 0:0 };

	BDPageSuper.call(this);
	// initial load audio (only time we have to call it for BD pages)


	for(var i=0;i<this.textIGTs.length;i++){
		this.textIGTs[i].addEventListener('click',function(ev){
			var id = ev.target.id;
			this.current=parseInt(id.substring(1,id.length).match(/\d+/)[0]);
			this.annotation_takes[this.current]=0;
			this.showIGT();
		}.bind(this));
		var time = document.createElement("span");
		time.setAttribute("class","ss");
		this.textIGTs[i].appendChild(time);
	}

	// and we want to ajax in any timestamps which are existing
	this.loadTS("bd-ann");

	this.load = function(){
		console.log("bd: ap.load");
		// make the audio element into the relevant one
		this.showIGT()
		// load that audio
		this.audios[this.current].load();
	};


	this.annotation_keylistener = function(ev) {
		// attached to window, so we need to reference this instance
		var char = String.fromCharCode(ev.keyCode ? ev.keyCode : e.charCode);

		if(char == ' ') {
			console.log('stamp')
			this.stampS();
			return false;
		} else {
			console.log(char);
		}
	}.bind(this);

	this.stampS = function() {
		var cTime = this.audios[this.current].currentTime
		this.timestamps["sentence-starts"].push(cTime);
		var ss = this.textIGTs[this.timestamps["sentence-starts"].length-1].getElementsByClassName("ss")[0];
		ss.innerHTML = "";
		ss.appendChild(document.createTextNode(cTime));
	}


	this.sAnn = function(){
		// set up the annotations for sentence by sentence breaking
		console.log("annotation mode begin");

		// if sentence-starts key doesn't exist, create it
		if(typeof(this.timestamps["sentence-starts"]=="undefined"))
			this.timestamps["sentence-starts"] = [];

		// load the keylistener
		window.onkeydown = this.annotation_keylistener;
	}.bind(this);


	// add a menu for the annotations
	this.annmenu = document.createElement("div");
	this.level1 = document.createElement("input");
	this.level1.type="button";
	this.level1.value="Begin Sentence Level Annotations";
	this.level1.addEventListener('click',this.sAnn);
	this.annmenu.appendChild(this.level1);
	document.getElementById("controls-holder").appendChild(this.annmenu);

	// add some instructions
	var instr =
		'Sentence level annotations are added by pressing the spacebar while the '+
	'audio plays.	The goal is to segment the text into sentences.	Sentences '+
	'which already have a timestamp will be displayed witwh that timestamp '+
	'printed between the gloss line and the free translation line.	To begin, '+
	'choose where you\'d like to start.	Choose the starting point of the audio '+
	'using the audio contols, you can press "play" and listen until you\'re '+
	'ready. Or you can "seek" by dragging the slider forward and backwards.	'+
	'Choose where you\'d like to start in the text by clicking that item.	The '+
	'item currently selected will appear highlighted in the text box and its '+
	'IGT will be displayed in the window.'
	this.annInstr = document.createElement("p");
	this.annInstr.appendChild(document.createTextNode(instr));
	document.getElementById("controls-holder").appendChild(this.annInstr);



	this.end_annotate = function() {
		this.ab.removeEventListener('click',this.end_annotate);
		console.log('one')
		// make a save form
		this.f = document.createElement("form");
		console.log('two')
/* This should hae the format "//depts.washington.edu/<ACCOUNT NAME>/annsaver/index.cgi", where account name is the text account for the website.  For example, the kwadacha website looks like
	"//depts.washington.edu/kwatexts/annsaver/index.cgi"
	Make sure to include the quotes. 
*/
		this.f.action=window.location.protocol+"//depts.washington.edu/wittexts/annsaver/index.cgi";
		console.log('three')
		this.f.method="POST";
		var i = document.createElement("input");
		i.setAttribute("name","pathname");
		i.setAttribute("value",window.location.pathname);
		this.f.appendChild(i);
		for(var item in this.timestamps){
			if(typeof(this.timestamps[item])=="undefined") continue;
			i = document.createElement("input");
			i.setAttribute("name",item);
			i.setAttribute("value",JSON.stringify(this.timestamps[item]));
			this.f.appendChild(i);
		}

		console.log("submit form");
		document.body.appendChild(this.f);
		this.f.submit();

	}.bind(this);

	// make the button
	this.ab = document.createElement("input");
	this.ab.type="button";
	this.ab.style.float="right";
	this.ab.value="save annotation";
	this.ab.addEventListener('click', this.end_annotate);
	document.body.insertBefore(this.ab, document.body.children[0]);

}

function AnnotationPage(){
	// this the version of AudioPage which is for doing the timestamp annotations
	var iTip = "Press C to check any existing work.	Press P to reannotate.";
	var aTip = "Press the spacebar to add annotations!";
	var mTip = "Press P to try again, C to check, N for next item (or select one with the mouse).";

	AudioPage.call(this);

	// add clickable listener for each textIGT
	for(var i=0;i<this.textIGTs.length;i++)
		this.textIGTs[i].addEventListener('click',function(ev){
			var id = ev.target.id;
			this.current=parseInt(id.substring(1,id.length).match(/\d+/)[0]);
			console.log(this.current);
			this.annotation_takes[this.current]=0;
			this.load();
		 }.bind(this));
	this.loadTS("chapman-ann");

	this.an_instr_html = "<p>This is audio annotation mode.	The goal is to record timestamps for words breaks in each audio file.</p><p>The scrolling area in the center of the page contains the sentences from the story.	The box above that (just below this one) contains the item currently being worked on.	In the scrolling area, items shaded \"green\" have saved timestamps; you can edit the timestamps for this item by clicking on it (which will load it into the window).	Items shaded \"yellow\" have timestamps recorded on this page, but the main copy in /timestamps/"+window.location.pathname+".json hasn't been updated (you need to commit your changes).	Items in \"pink\" don't have any existing information about them.</p><p>Once an item is loaded into the window, press 'p' (play), and the that track will play. As it plays, press the spacebar at the wordbreaks.	At the end of the track, pres 'c' (check) to see your annotations in action: each word should be colored green as the speaker says that word.</p><p>If you are satisfied with your work, press 'n' (next), to go to the next sentence in the story.	Or, click on another item in the window. If you are not satisfied, press 'p' (play) to try again.</p><p>When you are done annotating, press the \"end annotation\" button to listen to the story while observing the annotations.</p><p>Don't forget to commit your annotations by pressing the button!</p><p>Remember: the controls in annotation mode are: 'p' (play), 'c' (check) and 'n' (next).	Enjoy!</p>";

	this.tsStatus = function(igt) {
		if(igt["status"]) return igt["status"];
		else	if(this.timestamps[igt.id.substring(1)]) return "existstamps";
		else return "nostamps";
	}

	this.annotate_audio = function() {
		this.annotation_mode=true;
		this.annotation_takes = { 0:0 };

		console.log("annotation mode begin");
		// load the keylistener
		window.onkeydown = this.annotation_keylistener;

		// stop any playing audio
		this.audios[this.current].pause();

		// set current to the first track
		this.current = 0;
		this.load();

		// change the button to an end button
		// this.ab.addEventListener('click', this.end_annotate);

		// add a tip
		this.td.innerHTML = "";
		this.td.appendChild(document.createTextNode(iTip));

	}.bind(this);

	this.end_annotate = function() {
		this.ab.removeEventListener('click',this.end_annotate);

		// make a save form
		this.f = document.createElement("form");
/* This should hae the format "//depts.washington.edu/<ACCOUNT NAME>/annsaver/index.cgi", where account name is the text account for the website.  For example, the kwadacha website looks like
	"//depts.washington.edu/kwatexts/annsaver/index.cgi"
	Make sure to include the quotes. 
*/
		this.f.action=window.location.protocol+"//depts.washington.edu/wittexts/annsaver/index.cgi";
		this.f.method="POST";
		var i = document.createElement("input");
		i.setAttribute("name","pathname");
		i.setAttribute("value",window.location.pathname);
		this.f.appendChild(i);
		for(var item in this.timestamps){
			if(typeof(this.timestamps[item])=="undefined") continue;
			i = document.createElement("input");
			i.setAttribute("name",item);
			i.setAttribute("value",JSON.stringify(this.timestamps[item]));
			this.f.appendChild(i);
		}

		console.log("submit form");
		document.body.appendChild(this.f)
		this.f.submit();

	}.bind(this);

	// make the button
	this.ab = document.createElement("input");
	this.ab.type="button";
	this.ab.style.float="right";
	this.ab.value="save annotation";
	this.ab.addEventListener('click', this.end_annotate);
	document.body.insertBefore(this.ab, document.body.children[0]);


	// create the instructions div
	this.id = document.createElement("div");
	this.id.style.display="none"; // starts off hidden
	this.id.innerHTML=this.an_instr_html;
	var mc = document.getElementById("main-container");
	mc.insertBefore(this.id, mc.children[2]);

	// show/hide the instructions button
	this.shib = document.createElement("input");
	this.shib.type="button";
	this.shib.value="show instructions";
	this.shib.addEventListener('click',function(e){
		if(this.id.style.display=="none"){
			this.id.style.display="block";
			e.target.value="hide instructions";
		} else {
			this.id.style.display="none";
			e.target.value="show instructions";
		}
	}.bind(this));
	mc.insertBefore(this.shib, mc.children[2]);

	// create the tips div
	this.td = document.createElement("div");
	this.td.style.display="block"; // starts off showing
	mc.insertBefore(this.td,mc.children[3]);


	this.stamp = function() {
		this.timestamps[this.current].push(this.audios[this.current].currentTime);
	}

	this.annotate = function() {
		// play the current track and record spacebar hits
		// when it finishes, we should do.load to call addStamps

		this.getTextIGT().status="newstamps";
		this.showIGT();
		// this.updateTSEditors(this.annotationIGT,this.timestamps[this.current]);

		this.audios[this.current].addEventListener('ended',this.addStamps);
		this.audios[this.current].play();
		this.td.innerHTML = "";
		this.td.appendChild(document.createTextNode(aTip));
		this.audios[this.current].addEventListener('ended',function(){
			this.td.innerHTML = "";
			this.td.appendChild(document.createTextNode(mTip)); }.bind(this));
	}


	this.annotation_keylistener = function(ev) {
		// attached to window, so we need to reference this instance
		var char = String.fromCharCode(ev.keyCode ? ev.keyCode : e.charCode);

		if(char == 'N'){
			console.log('next')
			// add stamps to main
			this.addStamps(true);
			this.current+=1;
			this.annotation_takes[this.current]=0;
			this.load();
		} else if(char == 'P'){
			this.timestamps[this.current] = [];
			this.annotation_takes[this.current]+=1;
			console.log('play')
			this.annotate();
		} else if(char == 'C'){
			this.audios[this.current].play();
			console.log('check');
		} else if(char == ' ') {
			console.log('stamp')
			this.stamp();
			return false;
		} else {
			console.log(char);
		}
	}.bind(this);

	// wait just a short time to make sure
	// the xhr could have returned on a reasonable connection
	// it's not important that it finish, but we can give it a short
	// moment to make the first item prettier
	window.setTimeout(this.annotate_audio,200);
}

function ChapmanPage(){
	// this the version of AudioPage which is for publishing the stories
	AudioPage.call(this);

	window.onkeydown = function(e) { 
		if (e.key == "Enter") {
			e.preventDefault();
			document.getElementsByTagName('audio')[0].currentTime = 
			document.getElementsByTagName('audio')[0].duration; }
		if (e.key == "ArrowLeft") {
			e.preventDefault();
			document.getElementsByTagName('audio')[0].currentTime -= 2;
		};
		if (e.key == "ArrowRight") {
			e.preventDefault();
			document.getElementsByTagName('audio')[0].currentTime += 2;

		};
	}
	// add clickable listeners to the text IGTs
	for(var i=0;i<this.textIGTs.length;i++)
		this.textIGTs[i].addEventListener('click',function(ev){
			var id = ev.target.id;
			this.current=parseInt(id.substring(1,id.length).match(/\d+/)[0]);
			console.log(this.current);
			this.load();
			this.storyLoop();
		 }.bind(this));

	// load any timestamps
	this.loadTS("chapman");

	this.storyLoop = function() {
		console.log("storyLoop fired");
		if(this.story_mode)
			//this.audios[this.current].addEventListener('')
			this.audios[this.current].addEventListener('ended',this.nextTrack);
		this.audios[this.current].play();
	}.bind(this);

	this.nextTrack = function() {
		console.log("ap.nextTrack; ap.current:",this.current);
		if(this.current<this.audios.length){
			this.current++;
			this.load();
			this.audios[this.current]
				.addEventListener("loadedmetadata", this.storyLoop);
		}	else this.audios[this.current]
							.removeEventListener('ended',this.nextTrack);
	}.bind(this);

	// function remove any listeners from story mode
	this.clearStoryListeners = function() {
		for (var i=0;i<this.audios.length;i++){
			this.audios[i].removeEventListener('ended',this.nextTrack);
			this.audios[i].removeEventListener('loadedmetadata',this.storyLoop);
		}
	}

	// add a checkbox for story mode
	this.scbdiv = document.createElement("div");
	this.scbdiv.style.float="right";
	this.scbdiv.style.display="block";
	this.scb = document.createElement("input");
	this.scblab = document.createElement("span");
	this.scblab.appendChild(document.createTextNode("Play the whole story"));
	this.scb.addEventListener('click', function(e) {
		this.story_mode = e.target.checked;
		// also need to remove other listeners on other audios
		// cos it's possible to skip around
		if(this.story_mode == false)
			this.clearStoryListeners();
		else
			this.audios[this.current].addEventListener('ended',this.nextTrack);
	 }.bind(this));
	this.scb.type="checkbox";
	//this.scb.checked=false;

	this.scb.checked = true;
	this.story_mode = true;
	this.audios[this.current].addEventListener('ended',this.nextTrack);
	console.log('!!!', this.scb.checked);

	var ch = document.getElementById("controls-holder");
	ch.appendChild(this.scbdiv);
	this.scbdiv.appendChild(this.scb);
	this.scbdiv.appendChild(this.scblab);

	// play the story, one track at a time
	this.story = function() {
		// add the first listener
		this.audios[this.current].addEventListener('ended',this.nextTrack);
		// start the loop
		this.load();
		this.audios[this.current].play();
	}

	// addTitleClicker
	this.ta = document.createElement("audio");
	var src = document.createElement("source");

	var lastslash = window.location.pathname.lastIndexOf("/");
	var mediapath = window.location.pathname.substring(10,lastslash);

/* The first <CHANGE-ME> should be a pointer to the media account for the website.  For example, the kwadacha path is
	"//depts.washington.edu/kwamedia/"
	Make sure to include quotes and the final slash.
The second <CHANGE-ME> should have the form "/<FILE TYPE>/0.<FILE TYPE>", where file type is the kind of audio files.  For example, the kwadacha path is
	"/wav/0.wav"
	Make sure to include quotes and the initial slash.
*/
	src.setAttribute('src', "//depts.washington.edu/witmedia/"+mediapath+"/wav/0.wav");
	this.ta.appendChild(src);
	this.ta.load();
	var t = document.getElementById("main-container").children[0];
	t.addEventListener('click',function() {
		console.log(this.ta);
		this.ta.play();
	}.bind(this));
}

function AudioPage() {
	// a class for an audio page which has
	//	* a window for displaying the current audio
	//	* the ability to store footnotes for each track
	//	* annotation mode

	// we use different settings for Chapman vs Bell Deacon
	// this.chapman = window.location.pathname.indexOf("Chapman") == -1 ? false : true;


	this.win = document.getElementById("window");
	this.audioHolder = document.getElementById("audio-holder");
	this.audioHolder.style.display="inline";
	this.current = 0;
	this.timestamps = {};

	var adjustId = function(el){
		if(this.annotation_mode)
			el.id=el.id+"-ann-"+this.annotation_takes[this.current];
		else el.id=el.id+"-win";
	}.bind(this);

	this.cloneIGT = function(igt){
		var clone = igt.cloneNode(true);
		adjustId(clone);
		var childs = clone.getElementsByTagName("span");
		for(var j=0;j<childs.length;j++)
			adjustId(childs[j]);
		this.win.appendChild(clone);
		return clone;
	}.bind(this);

	// get all the track hrefs and create audios
	// note, in one file, it's actually a video
	this.audios = Array.prototype.slice.call(
									document.getElementsByClassName('audio'))
										.map(function(el){
											var a;
											if(el.attributes.href.value.indexOf("mp4")>-1){
												a = document.createElement("video");
												document.getElementById("controls-holder").setAttribute("class","video");
											} else
												a = document.createElement("audio");

											a.setAttribute("preload","none");
											a.setAttribute("controls","controls");
											var src = document.createElement("source");
											src.setAttribute('src', el.attributes.href.value);
											a.appendChild(src);
											return a; }.bind(this));

	this.popcorns = this.audios.map(function(a) { return Popcorn(a); });

	this.hlcol = function(e){
	 var el = e.target;
	 var wg = el.attributes['class'].value.indexOf("g") == 0 ? "g" : "w";
	 if(wg=='w'){
		 var o = document.getElementById(el.id.replace('w','g'));
		 el.setAttribute('class', "word activecol");
		 o.setAttribute('class', "gloss activecol");
	 } else {
		 var o = document.getElementById(el.id.replace('g','w'));
		 el.setAttribute('class', "gloss activecol");
		 o.setAttribute('class', "word activecol");
	 }
	};

	this.unhlcol = function(e){
		var el = e.target;
		var wg = el.attributes['class'].value.indexOf("g") == 0 ? "g" : "w";
		if(wg=='w'){
			var o = document.getElementById(el.id.replace('w','g'));
			el.setAttribute('class', "word");
			o.setAttribute('class', "gloss");
		} else {
			var o = document.getElementById(el.id.replace('g','w'));
			el.setAttribute('class', "gloss");
			o.setAttribute('class', "word");
		}
	};

	this.addColHighlightsAndStyles = function(igt){
		var wds = igt.getElementsByClassName('word');
		var gls = igt.getElementsByClassName('gloss');
		try {
		// put some nice column listeners for col highlighting
			if(gls.length != wds.length) {
				console.log("unequal gls wds lengths");
			}
			else if(gls.length==0) {
				console.log("empty gls list");
			}
			else {
				for(var i=0;i<gls.length;i++){
					//var s = window.getComputedStyle(wds[i]);
					// console.log(wds[i].textContent);
					wds[i].setAttribute('title',wds[i].textContent);
					wds[i].addEventListener('mouseover', this.hlcol);
					wds[i].addEventListener('mouseout', this.unhlcol);
					gls[i].addEventListener('mouseover', this.hlcol);
					gls[i].addEventListener('mouseout', this.unhlcol);
				}
			}
		} catch(e) { console.log(e); };
	};


	this.textIGTs = Array.prototype.slice.call(
									 document.getElementsByClassName('igt')).map(function(el){
										 this.addColHighlightsAndStyles(el);
										 return el;
									 }.bind(this));


	this.stampX = function(e) {
		// this is an audio element, get it's index to do the stamping
		var x	= window.ap.audios.indexOf(e.target);
		// need to remove this listner so it doesn't fire again!
		this.audios[x].removeEventListener('loadedmetadata',this.stampX);

		this.stampItem(this.winIGTs[x], this.timestamps[x], this.audios[x],
			this.popcorns[x]);

	}.bind(this);

	// clone all the IGTs into the window collection
	this.winIGTs = this.textIGTs.map(function(igt){
									 var wigt = this.cloneIGT(igt);
									 this.addColHighlightsAndStyles(wigt);
									 return wigt
								 }.bind(this));

	// try to load any timestamps for this file
	this.loadTS = function(pagetype) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", window.location.protocol+"//"+

/*  This should be the path to the timestamps folder, which is stored in the text account for the website.  For example, the kwadacha path is
	"/kwatexts/timestamps/"
	Make sure to include the quotes and slashes.
*/
										window.location.hostname+"/wittexts/timestamps/"+
										window.location.pathname.substring(
										window.location.pathname.lastIndexOf('/')+1)+".json",
							true);
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4){
				if (xhr.status==200){
					console.log(xhr.responseText);
					this.timestamps = JSON.parse(xhr.responseText);
					for(var idx in this.timestamps){
						if(this.timestamps[idx].length>0) {
							if(pagetype=="chapman" || pagetype == "chapman-ann")
								this.audios[idx].addEventListener('loadedmetadata', this.stampX);
							if(pagetype=="chapman-ann") this.textIGTs[idx].setAttribute("class","igt existstamps");
							else if(pagetype =="bd-ann") {
							//else if(pagetype=="bd-ann" || pagetype == "bd") { // then idx can be sentence-starts
								if(idx=="sentence-starts"){
									for(var j=0;j<this.timestamps[idx].length;j++){
										var t = this.textIGTs[j].getElementsByClassName("ss")[0];
										t.appendChild(document.createTextNode(this.timestamps[idx][j]));
									}
								}
								else 
									this.audios[idx].addEventListener('loadedmetadata', this.stampX);
							}
						} else {
							console.log("naughty empty "+idx);
							// no need to keep empty keys in here
							this.timestamps[idx] = undefined;
						}
					}
				} else console.log(xhr.status);
				// readyState is 4, setUpTS cleans up when there are no timestamps
				// so it gets called even if we got status 404
				if(pagetype=="bd") this.setUpTS();
			}
		}.bind(this);
		xhr.send();
	}

	this.load = function(){
		console.log("ap.load");
		this.showIGT(true);
		this.audios[this.current].load();
	}

	this.stampItem = function(item,stamps,audio,pop,flag){
		if(flag) console.log("callbc");
		var wds = item.getElementsByClassName("word");
		if(typeof(stamps)=="undefined") {
			console.log("can't stamp what's not there!");
			return;
		}
		for(var i=0;i<wds.length;i++){
			var fstart = stamps[i];
			var fend = stamps[i+1] ?
								 stamps[i+1] : audio.duration;

			if(isNaN(audio.duration)){
				console.log("why is audio.duration NaN?!");
				// should we loop here til it's not anymore?!
			}

			/*if(i==34){
				console.log("skipping evil no 34");
				return;
			}*/
			console.log("adding footnote to ",wds[i].id,fstart, fend);

			if(typeof(fend)=="undefined")	 {
				console.log("why is fend undefined?!");
				return;
			}

			if(typeof(fstart)=="undefined"){
				console.log("why is fstart undefined?!");
				return;
			}

			pop.footnote(
				{ start:fstart, end:fend, text:'', target:wds[i].id,
					effect:"applyclass", applyclass:"c-word" });
		}
	}

	this.updateTSEditors = function(item,stamps) {
		var tseds = item.getElementsByClassName("tseditor");
		for(var i=0;i<tseds.length;i++) {
			tseds[i].innerHTML="";
			tseds[i].appendChild(document.createTextNode(stamps[i]));
		}
	};

	this.addStamps = function(reify){
		// reify is sometimes an event (from callback on 'ended' listener)
		// it means to add the stamps to the existing getWinIGT();
		// using the existing popcorn
		var annIgt;
		var pop;
		if(reify == true){
			annIgt = this.getWinIGT();	pop = this.popcorns[this.current];
		} else {
			annIgt = this.annotationIGT; pop = this.annotationPop;
		}

		console.log('adding stamps');

		// remove listener from annotation mode
		// no loops!
		this.audios[this.current].removeEventListener('ended',this.addStamps);


		// if there's no stamps for this item
		if(typeof(this.timestamps[this.current])=="undefined")
			return;

		this.stampItem(annIgt,this.timestamps[this.current],
			this.audios[this.current],pop);

		this.updateTSEditors(annIgt,this.timestamps[this.current]);

	}.bind(this);


	//
	this.addTSEditors = function(igt){
		var wds = igt.getElementsByClassName("word");
		var tr = document.createElement("tr");
		tr.setAttribute("class","tseditors");
		for(var i=0;i<wds.length;i++){
			var td = document.createElement("td");
			td.setAttribute("class","tseditor");
			var idx = wds[i].id.substring(1,1+getFirstAlpha(wds[i].id.substring(1)));
			if(this.timestamps[idx])
				td.appendChild(document.createTextNode(this.timestamps[idx][i]));
			else td.appendChild(document.createTextNode("Ã¢Ë†â€¦"));
			tr.appendChild(td);
		}
		igt.appendChild(tr);
	}

	this.loadAudioHolder = function(){
		// make the audio element into the relevant one
		this.audioHolder.innerHTML = '';
		this.audioHolder.appendChild(this.audios[this.current]);
	}.bind(this);

	// update the current IGT showing in the window
	// update any highlighting the in the text scroll area
	this.showIGT = function(keepstamps){
		// hidem all
		this.hideIGTs();
		// make the audio element into the relevant one
		this.loadAudioHolder();


		var winigt = this.getWinIGT();
		if(this.annotation_mode){
			// in annotation mode, we make a copy of the relevant winIGT
			// and show that

			if(this.annotationIGT){
				this.annotationIGT.parentNode.removeChild(this.annotationIGT);
				this.annotationPop = null;
			}

			this.annotationIGT = this.cloneIGT(this.getWinIGT());

			// add the timestamp editors to this IGT
			this.addTSEditors(this.annotationIGT);
			this.annotationPop = Popcorn(this.audios[this.current]);


			// if keepstamps, need to addStamps as well
			if(keepstamps) this.addStamps();

			this.annotationIGT.style.display="table";

			// add column highlights
			this.addColHighlightsAndStyles(this.annotationIGT);

			winigt = this.annotationIGT;

		} else {
			// first hide any other window IGTs
			winigt.style.display="table";
		}

		// in both modes, we can highlight the one in the text which we're on
		// but in annotation mode, we also show timestamp status by color
		for(var i=0;i<this.textIGTs.length;i++){
			var tss = "";
			if(this.annotation_mode){
				var tss = this.tsStatus(this.textIGTs[i]);
			}
			this.textIGTs[i].setAttribute('class', 'igt '+tss);
		}

		// in annotation_mode, we don't use "active"
		if(!this.annotation_mode)
			this.getTextIGT().setAttribute('class','active igt');


		// and this is a good time to do column reformatting if we overflow
		// let's only do this on non annotation mode (cos it might break things!!)
		if(!this.annotation_mode){
			if(winigt.clientWidth>this.win.clientWidth){
				console.log("IGT overflow!");

			}
		}
	}.bind(this);


	// hide all IGTs in the window
	this.hideIGTs = function() {
		for(var i=0;i<this.winIGTs.length;i++){
			this.winIGTs[i].style.display="none";
		}
	}

	// return the current IGT from the text div
	this.getTextIGT = function(index){
		console.log("getTextIGT with 'index':",index);
		if(!index) index=this.current;
		return document.getElementById("i"+index);
	}

	// return the current IGT from the win div
	this.getWinIGT = function(index){
		console.log("getWinIGT with 'index':",index);
		if(!index) index=this.current;
		return document.getElementById("i"+index+"-win");
	}
}

function showHoverNote(e){
	var note = document.getElementById(e.target.getAttribute("href").substring(1));
	noteHoverDiv.appendChild(note.cloneNode(true));
	noteHoverDiv.style.left=e.clientX+"px";
	noteHoverDiv.style.top=e.clientY+"px";
	noteHoverDiv.style.display="block";
}

function hideHoverNote(e){
	noteHoverDiv.innerHTML = "";
	noteHoverDiv.style.display="none";
}

function init(){

	var pn = window.location.pathname;
	//if(pn.indexOf("Chapman") > -1){ // if we're at Chapman
	if (((document.body.innerHTML).match(/class=["']audio["']/g) || []).length > 1){

		if(window.location.pathname.indexOf("ann") == 10){
		// if we're at the annotation locations
			window.ap = new AnnotationPage();
		} else {
			window.ap = new ChapmanPage();
		}
	}	else { // we're at the BD
		if(window.location.pathname.indexOf("ann") == 10)
			window.ap = new BDAnnPage();
		else
			window.ap = new BDPage();
	}

	// load the first track
	ap.load();

	// let's put some nice hover stuff for the notes
	noteHoverDiv = document.createElement("div");
	noteHoverDiv.style.position="fixed";
	noteHoverDiv.style.background="lightblue";
	noteHoverDiv.style.border="1px solid black";
	noteHoverDiv.style.padding="5px";
	document.body.appendChild(noteHoverDiv);
	var notelinks = document.getElementsByClassName("notelink");
	for(var i=0;i<notelinks.length;i++){
		notelinks[i].addEventListener('mouseover',showHoverNote);
		notelinks[i].addEventListener('mouseout',hideHoverNote);
	}

}

window.onload = init;


