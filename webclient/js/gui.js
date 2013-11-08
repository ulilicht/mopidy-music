/* gui interactions here
* set- functions only set/update the gui elements
* do- functions interact with the server
* show- functions do both
*/
/********************
 * Song Info Sreen
 ********************/
function resetSong() {
    if (!posChanging) {
        pauseTimer();

        setPlayState(false);
        setPosition(0);
        var data = new Object;
        data.name = '';
        data.artists = '';
        data.length = 0;
        data.uri = '';
        setSongInfo(data);
    }
}
console.log('test');

function resizeMb() {
    $("#infoname").html(songdata.name);
    $("#infoartist").html(artiststext);
//    //bug in truncate?
//    var spanwidth = $("#infoartist").width() - 38;
//    $("#infoname").truncate({
//        width : spanwidth,
//        token : '&hellip;',
//        center : true,
//        multiline : false
//    });
//    $("#infoartist").truncate({
//        width : spanwidth,
//        token : '&hellip;',
//        center : true,
//        multiline : false
//    });


//    //initialize iScroll if MobileWebkit and large window
//    if (isMobileWebkit) {
//        if ($(window).width() > 480) {
//            if (!playlistslistScroll) {
//                playlistslistScroll = new iScroll('playlistslistdiv');
//                playlisttracksScroll = new iScroll('playlisttracksdiv');
//            }
//        } else {
//            if (playlistslistScroll) {
//                playlistslistScroll.destroy();
//                playlistslistScroll = null;
//                playlisttracksScroll.destroy();
//                playlisttracksScroll = null;
//            }
//        }
//    }
//
//    //set height of playlist scrollers
//
//    if ($(window).width() > 480) {
//        $('.scroll').height($(window).height() - 111);
//        //jqm added something which it shouldnt (at least in this case) I guess
//        //        $('#playlistspane').removeClass('height').height($(window).height() - 110);
//        $('.scroll').removeClass('height').removeClass('width');
//        $('#playlistspane').removeClass('height').removeClass('width');
//    } else {
//        $('.scroll').addClass('height', '100%').addClass('width', '100%');
//        $('#playlistspane').addClass('height', '100%').addClass('width', '100%');
//    }
//
//    if (isMobileWebkit && ($(window).width() > 480)) {
//        playlistslistScroll.refresh();
//        playlisttracksScroll.refresh();
//    }
}

function setSongInfo(data) {
    if (!data) { return; }
    if (data.name == '') {
        return;
    };

    //update styles of listviews
    $('#currenttable li').each(function() {
        $(this).removeClass("currenttrack");
        if (this.id == 'currenttable-' + data.uri) {
            $(this).addClass('currenttrack');
        }
    });

    $('#playlisttracks li').each(function() {
        $(this).removeClass("currenttrack2");
        if (this.id == 'playlisttracks-' + data.uri) {
            $(this).addClass('currenttrack2');
        }
    });
    $('#trackresulttable li').each(function() {
        $(this).removeClass("currenttrack2");
        if (this.id == 'trackresulttable-' + data.uri) {
            $(this).addClass('currenttrack2');
        }
    });

    $('#artiststable li').each(function() {
        $(this).removeClass("currenttrack2");
        if (this.id == 'artiststable-' + data.uri) {
            $(this).addClass('currenttrack2');
        }
    });1
    $('#albumstable li').each(function() {
        $(this).removeClass("currenttrack2");
        if (this.id == 'albumstable-' + data.uri) {
            $(this).addClass('currenttrack2');
        }
    });
    
    
    if (data.name && (songdata.name == data.name)) {
	return;
    }
    if (data) {
        songdata = data;
    } else {
        data = songdata;
    }
    artistshtml = '';
    artiststext = '';

    if (validUri(data.name)) {
        for (var key in radioStations) {
	rs = radioStations[key];
	if (rs && rs[1] == data.name) {
	  data.name = (rs[0] || rs[1]);
	}
    };
    }
    
    $("#modalname").html(data.name);

    if (!data.length || data.length == 0) {
        songlength = 0;
	$("#songlength").html('');
	pauseTimer();
	$('#trackslider').slider('disable');
    } else {
        songlength = data.length;
	$("#songlength").html(timeFromSeconds(data.length / 1000));
        $('#trackslider').slider('enable');
    }

    var arttmp = '';
    
    if(data.artists) {
	for (var j = 0; j < data.artists.length; j++) {
    	    artistshtml += '<a href="#" onclick="return showArtist(\'' + data.artists[j].uri + '\');">' + data.artists[j].name + '</a>';
    	    artiststext += data.artists[j].name;
    	    if (j != data.artists.length - 1) {
	        artistshtml += ', ';
        	artiststext += ', ';
	    }
	}
        arttmp = artistshtml;
    }

    if (data.album) {
        $("#modalalbum").html('<a href="#" onclick="return showAlbum(\'' + data.album.uri + '\');">' + data.album.name + '</a>');
        getCover(artiststext, data.album.name, '#infocover, #controlspopupimage', 'extralarge');
    } else {
	$("#modalalbum").html('');
	$("#infocover").attr('src', './images/default_cover.png');
    $("#controlspopupimage").attr('src', '../images/default_cover.png');
    }

        $("#modalartist").html(arttmp);

    $("#trackslider").attr("min", 0);
    $("#trackslider").attr("max", data.length);
    
    resizeMb();
}

/***************
 * display popups
 */
function closePopups() {
    $('#popupTracks').popup('close');
    $('#artistpopup').popup('close');
    $('#coverpopup').popup('close');
    $('#popupQueue').popup('close');
    $('#controlspopup').popup('close');
}


function popupTracks(e, listuri, trackuri) {
    if (!e)
        var e = window.event;
    $('.popupTrackName').html(popupData[trackuri].name);
    $('.popupAlbumName').html(popupData[trackuri].album.name);
    var child = "";
    if (popupData[trackuri].artists.length == 1) {
        child = '<a href="#" onclick="showArtist(\'' + popupData[trackuri].artists[0].uri + '\');">Show Artist</a>'; 
        $('.popupArtistName').html(popupData[trackuri].artists[0].name);
        $('.popupArtistHref').attr('onclick', 'showArtist("' + popupData[trackuri].artists[0].uri + '");' );
        $('.popupArtistsDiv').hide();
        $('.popupArtistsLi').show();
    } else {
        for (var j = 0; j < popupData[trackuri].artists.length; j++) {
            child += '<li><a href="#" onclick="showArtist(\'' + popupData[trackuri].artists[j].uri + '\');"><span class="popupArtistName">' + popupData[trackuri].artists[j].name + '</span></a></li>';
        }
        $('.popupArtistsLi').hide();
        $('.popupArtistsLv').html(child).show();
        $('.popupArtistsDiv').show();
        //  this makes the viewport of the window resize somehow
        $('.popupArtistsLv').listview("refresh");
    }

    var hash = document.location.hash.split('?');
    var divid = hash[0].substr(1);
    if (divid == 'current') {
        $(".addqueue").hide();
	var popupName = '#popupQueue';
    } else {
        $(".addqueue").show();
	var popupName = '#popupTracks';
    }

    $(popupName).data("list", listuri).data("track", trackuri).popup("open", {
        x : e.pageX,
        y : e.pageY
    });
    return false;
}

function showAlbumPopup() {
    uri = $('#popupTracks').data("track");
    showAlbum(popupData[uri].album.uri);
}

/*********************
 * initialize sockets
 *********************/

function initSocketevents() {
    mopidy.on("state:online", function() {
        showOffline(false);
        getCurrentPlaylist();
        updateStatusOfAll();
        getPlaylists();
        showLoading(false);
        $(window).hashchange();
    });

    mopidy.on("state:offline", function() {
        resetSong();
        showOffline(true);
    });

    mopidy.on("event:trackPlaybackStarted", function(data) {
        mopidy.playback.getTimePosition().then(processCurrentposition, console.error);
        setPlayState(true);
        setSongInfo(data.tl_track.track);
        initTimer();
    });

    mopidy.on("event:trackPlaybackPaused", function(data) {
        //setSongInfo(data.tl_track.track);
        pauseTimer();
        setPlayState(false);
    });

    mopidy.on("event:playlistsLoaded", function(data) {
        showLoading(true);
        getPlaylists();
    });

    mopidy.on("event:volumeChanged", function(data) {
        if (!volumeChanging) {
            setVolume(data["volume"]);
        }
    });

    mopidy.on("event:playbackStateChanged", function(data) {
        switch (data["new_state"]) {
            case "stopped":
                resetSong();
                break;
            case "playing":
                mopidy.playback.getTimePosition().then(processCurrentposition, console.error);
                resumeTimer();
                setPlayState(true);
                break;
        }
    });

    mopidy.on("event:tracklistChanged", function(data) {
        getCurrentPlaylist();
    });

    mopidy.on("event:seeked", function(data) {
        setPosition(parseInt(data["time_position"]));
    });
}

/**********************
 * initialize software
 **********************/
$(document).ready(function() {
    //check for websockets
    if (!window.WebSocket) {
        switchContent("playlists");
        $('#playlistspane').html('<h2>Old Browser</h2><p>Sorry. Your browser isn\'t modern enough for this webapp. Modern versions of Chrome, Firefox, Safari all will do. Maybe Opera and Internet Explorer 10 also work, but it\'s not tested.</p>');
        exit;
    }
    //workaround for a bug in jQuery Mobile, without that the panel doesn't close on mobile devices...
    $('.ui-panel-dismiss').on( "tap", function() { $("#panel").panel("close"); } );
    //end of workaround





    $(window).hashchange();

    // Connect to server
    mopidy = new Mopidy();
    //mopidy.on(console.log.bind(console));  // Log all events

    //initialize events
    initSocketevents();

    resetSong();

    if (location.hash.length < 2) {
        switchContent("playlists");
    }

    initgui = false;
    window.onhashchange = locationHashChanged;
    // Log all events
    //mopidy.on(function() {
    //});

    //update gui status every x seconds from mopdidy
    setInterval(updateTimer, STATUS_TIMER);
    //only show backbutton if in UIWebview
    if (window.navigator.standalone) {
        $("#btback").show();
    } else {
        $("#btback").hide();
    }

    $(window).resize(function() {
        resizeMb();
    });


    //navigation temporary, rewrite this!
    $('#songinfo').click(function(){return switchContent('nowPlaying')});
    $('#navEnterFullscreen').click(function(){
        enterFullscreen();
    });
    $('#navExitFullscreen').click(function(){
        exitFullscreen();
    });



    //navigation stuff

    $(document).keypress( function (event) {
	//console.log('kp:    '+event);
	if (event.target.tagName != 'INPUT') { 
	    event.preventDefault();
	    switch(event.which) {
	        case 32:
    		    doPlay();
		    break;
		case '>':
    		    doNext();
		    break;
		case '<':
    		    doPrevious();
		    break;
	    }
	    return true;
	}
    });
    initRadio();
    if ($(window).width() < 560) {
        $("#panel").panel("close");
    }else{
        $("#panel").panel("open");
    }
    
});

$(document).bind("pageinit", function() {
    resizeMb();

});

/************************
 * diverse
 ************************/
function enterFullscreen() {
    var elem = document.querySelector("#page");
    elem.onwebkitfullscreenchange = onFullScreenEnter;
    elem.onmozfullscreenchange = onFullScreenEnter;
    elem.onfullscreenchange = onFullScreenEnter;
    if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else {
        if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else {
            elem.requestFullscreen();
        }
    }


}
function exitFullscreen() {
    document.webkitExitFullscreen();
    document.mozCancelFullscreen();
    document.exitFullscreen();

}

function onFullScreenEnter() {
    var elem = document.querySelector("#page");
    $('#navExitFullscreen').show();
    $('#navEnterFullscreen').hide();
    elem.onwebkitfullscreenchange = onFullScreenExit;
    elem.onmozfullscreenchange = onFullScreenExit;
};

// Called whenever the browser exits fullscreen.
function onFullScreenExit() {
    $('#navExitFullscreen').hide();
    $('#navEnterFullscreen').show();
};

function switchContent(divid, uri) {
    var hash = divid;
    if (uri) {
        hash += "?" + uri;
    }
    //    $.mobile.changePage("#" + hash);
    location.hash = "#" + hash;
}

function setHeadline(site){
    site = site.trim();
    str = $('.mainNav').find('a[href$='+site+']').text();
    if(str==""){
        str=site;
    }
    $('#contentHeadline').text(str);
}

//update timer
function updateTimer() {
    mopidy.playback.getCurrentTrack().then(processCurrenttrack, console.error);
    mopidy.playback.getTimePosition().then(processCurrentposition, console.error);
    //TODO check offline?
}

//update everything as if reloaded
function updateStatusOfAll() {
    mopidy.playback.getCurrentTrack().then(processCurrenttrack, console.error);
    mopidy.playback.getTimePosition().then(processCurrentposition, console.error);
    mopidy.playback.getState().then(processPlaystate, console.error);

    mopidy.tracklist.getRepeat().then(processRepeat, console.error);
    mopidy.tracklist.getRandom().then(processRandom, console.error);

    mopidy.playback.getVolume().then(processVolume, console.error);
}

function locationHashChanged() {
    var hash = document.location.hash.split('?');
    //remove #
    var divid = hash[0].substr(1);
    setHeadline(divid);


    var uri = hash[1];
    $('.mainNav a').removeClass('ui-state-active ui-state-persist ui-btn-active');
    //i don't know why some li elements have those classes, but they do, so we need to remove them
    $('.mainNav li').removeClass('ui-state-active ui-state-persist ui-btn-active');
    if ($(window).width() < 560) {
        $("#panel").panel("close");
    }
    $('.pane').hide();

    $('#' + divid + 'pane').show();

    switch(divid) {
        case 'nowPlaying':
            $('#navnowPlaying a').addClass('ui-state-active ui-state-persist ui-btn-active');
            break;
        case 'current':
            $('#navcurrent a').addClass('ui-state-active ui-state-persist ui-btn-active');
            break;
        case 'playlists':
            $('#navplaylists a').addClass('ui-state-active ui-state-persist ui-btn-active');
            break;
        case 'search':
            $('#navsearch a').addClass($.mobile.activeBtnClass);
            $("#searchinput").focus();
            if (customTracklists['allresultscache'] == '') {
                initSearch($('#searchinput').val());
            }
            break;
        case 'radio':
            $('#navradio a').addClass('ui-state-active ui-state-persist ui-btn-active');
            break;
        case 'artists':
            if (uri != '') {
                showArtist(uri);
            }
            break;
        case 'albums':
            if (uri != '') {
                showAlbum(uri);
            }
            break;
    }


    //switch the footer
    switch(divid) {
        case 'nowPlaying':
            $('#normalFooter').hide();
            $('#nowPlayingFooter').show();
            break;
        default:
            $('#normalFooter').show();
            $('#nowPlayingFooter').hide();
    }
    // Set the page title based on the hash.
    document.title = PROGRAM_NAME;
    return false;
}
