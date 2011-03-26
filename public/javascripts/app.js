var player = {
	manualSeek: false,
	currentTrackLi: function() {
		return $('.queue li.playing').first();
	},
	currentTrack: function() {
		return $('.queue li.playing audio').first().get(0);
	},
	currentTrackId: function() {
		return $('.queue li.playing').first().data('_id');
	},
	currentPosition: function() {
		return $('.queue li').index($('.queue li.playing').first());
	},
	startQueue: function() {
		$('.queue li').removeClass('playing');
		$('.queue li').first().addClass('playing');
		this.startNewTrack();
	},
	stopCurrentTrack: function() {
		if (this.currentTrack() && !this.currentTrack().paused) {
			//this should work... not sure wwhat is going on
			//works in chrome.. so obviously it's tied to ff not loading
			//the files.. there should be some way we can check
			this.currentTrack().currentTime = 0;
			this.currentTrack().pause();
		}
		this.currentTrackLi().removeClass('playing');
	},
	startNewTrack: function() {
		this.setupTrack();
		this.currentTrack().play();	
	},
	nextTrack: function() {
		var currentQueue = $('.queue li');
		var pos = this.currentPosition();
		if (currentQueue.length > 1) {
			this.stopCurrentTrack();
			if (pos >= (currentQueue.length - 1)) {
				//wrap around when we reach the end
				$(currentQueue[0]).addClass("playing");
			} else {
				//increment if we're not at the end
				$(currentQueue[pos + 1]).addClass("playing");
			}
			this.startNewTrack();
		}
	},
	setupEvents: function() {
		$('#playtoggle').bind('click', function(e) {
			e.preventDefault();
			var pos = player.currentPosition();
			var cur = player.currentTrack();
			if(cur && (pos >= 0)) {
				if(cur.paused) { cur.play(); } 
				else { cur.pause(); }
			} else {
				player.startQueue();
			}
		});
		$('#skip').bind('click', function(e) {
			e.preventDefault();
			player.nextTrack();
		});
	},
	setupTrack: function() {
		$('#gutter').slider({
			value: 0,
			step: 0.01,
			orientation: "horizontal",
			range: "min",
			max: player.currentTrack().duration,
			animate: false,
			slide: function() {
				player.manualSeek = true;
			},
			stop: function(e, ui) {
				player.currentTrack().currentTime = ui.value;
				player.manualSeek = false;
			}
		});
		$(this.currentTrack()).bind("ended", function () {
			player.nextTrack();
		}).bind('play',function() {
		  $("#playtoggle").addClass('playing');  
		}).bind('pause ended', function() {
			$("#playtoggle").removeClass('playing');   
		}).bind("timeupdate", function() {
			var rem = parseInt(this.duration - this.currentTime, 10),
			pos = (this.currentTime / this.duration) * 100,
			mins = Math.floor(rem/60,10),
			secs = rem - mins*60;
			$('#timeleft').text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
			var positionIndicator = $('#handle');
			if (!player.manualSeek) { positionIndicator.css({left: pos + '%'}); }
		});
	}
};


var ajax = {
    setupDefaults: function() {
        $.ajaxSetup({
			dataType: "json",
			timeout: 5000
		});
	},
    
    setupHandlers: function() {
		//show loading indicator
		var $loading = $('#loading');
		$('body').ajaxStart(function() {
			$loading.show();
		});
		$('body').ajaxStop( function() {
			$loading.fadeOut();
		});
	},
    
    loadArtists: function() {
		//Load up our artists
		$.ajax({
			url: 'list/artist.json',
			success: function(json, text, xhr) {
				var list = $('<ul/>').appendTo($('#browser').empty());
				$.each(json, function(key, value) {
					$('<li/>').append(
					$('<a/>', {
						"class": "browser-link artist",
						text: value,
						href: "list/album/for/artist/" + value
					})).appendTo(list);
				});
			}
		});
	},
    
    loadAlbumsTracks: function($curLink) {
        $.ajax({
			url: $curLink.attr('href') + '.json',
			beforeSend: function() {
				$curLink.parent().data('loaded', true);
			},
			success: function(json, text, xhr) {
                var newClass = '';
                var linkText = '';
                var href = '';
                var data = '';
				var newList = $('<ul/>');
				$.each(json, function(key, value) {
					if(value._id) { // if we get and id then we know it's a track
						newClass = "viewer-link track";
						linkText = value.track + ". " + value.title;
						href = "#";
						data = value;
					}	else {
						linkText = value;
						newClass = "browser-link album";
						href = "show/album/" + value.replace(/'/, "%27");
						data = {data: value};
					}
					$('<li/>').append(
						$('<a/>', {
							"class": newClass,
							text: linkText,
							href: href
						}).data(data)
					).appendTo(newList);
				});
				$curLink.parent().append(newList);
                $curLink.trigger('load');
			},
			error: function(json, text, xhr) {
				//in case we have a problem loading data set
				//the loaded flag to false to force reload
				$curLink.data('loaded', false);
			}
		});   
    }
};

var app = {
	setContentHeight: function() {
		//Set content height
		//Total height of window minus the height of the top two elements
		$('#browser').css('height', $(window).height());
		$('#player').css('height', $(window).height());
		$('#player .queue').css('height', $(window).height() - $('#controls').height()); 
	},

	setupClickHandlers: function() {
		this.setupBrowserLinks();
		this.setupViewerLinks();
		this.setupTrackControls();
	},
	
	setupTrackControls: function() {
		var currentQueue = $('.queue li');
		//handle removal of tracks from queue
		$('.actions .remove').live('click', function(e) {
			var $curLink = $(this);
			var currentLi = $curLink.parents('li');
			var pos = player.currentPosition();
			if (currentLi.hasClass('playing')) {
				if (currentQueue.length > 1) {
					player.nextTrack();
				} else {
					player.currentTrack().pause();
				}
				currentLi.remove();
			} else {
				currentLi.remove();
			}
		});
		$('.actions .playnow').live('click', function(e) {
			player.stopCurrentTrack();
			$(this).parents('li').addClass('playing');
			player.startNewTrack();
		});
	},

	setupViewerLinks: function() {
		//handle addition of tracks to queue
		$('li a.viewer-link').live('click', function(e) {
			e.preventDefault();
			var $curLink = $(this);
			if($curLink.data('ext') == 'mp3' || $curLink.data('ext') == 'ogg') {
				var newTrack = $('<li style="display: none"/>')
					.append($('<h4 class="title" />').text($curLink.data('title')))
					.append($('<p class="artist" />').text($curLink.data('artist')))
					.append($('<p class="album" />').text($curLink.data('album')))
					.append($('<p class="actions" />')
						.append($('<span class="remove" />'))
						.append($('<span class="playnow" />')))
					.append($('<div class="handle" />'))
					.append($('<audio/>', {
							src: 'download/' + $curLink.data('_id'),
							preload: 'metadata'
						})
					)
					.data('_id', $curLink.data('_id'));
				$('#player ol').append(newTrack);
				newTrack.show('highlight');
			}
		});
	},

	setupBrowserLinks: function() {
		$('li a.browser-link').live('click', function(e) {
			e.preventDefault();
			var $curLink = $(this);
			//is this section loaded?
			if(!$curLink.parent().data('loaded')) {
				ajax.loadAlbumsTracks($curLink);
			} else {
				//when the list is loaded just toggle the display
				$curLink.parent().find('ul').first().toggleClass('hidden');
			}
		});
        
        $('li a.add-album').live('click', function(e) {
            e.preventDefault();
            var $curLink = $(this);
            var $browserLink = $curLink.parent().find('a.browser-link');
            
            if(!$curLink.parent().data('loaded')) {
                ajax.loadAlbumsTracks($browserLink);
                $browserLink.one('load', function(e) {
                     $curLink.parent().find('ul li a').trigger('click');  
                });
			} else {
				//when the list is loaded just toggle the display
				$curLink.parent().find('ul li a').trigger('click');
			}
        });
	},
    
	makeQueueSortable: function() {
		$('.queue').sortable({
			placeholder: 'sort-placeholder',
			handle: '.handle'
		});
	}
};


$(function() {
	//Set up window height
	app.setContentHeight();
	
	//Make sure we preserve these heights on a resize
	$(window).resize(app.setContentHeight);
	
	//Set up global Ajax defaults
	ajax.setupDefaults();

	//Set up gloabal Ajax handlers
	ajax.setupHandlers();

	//Set up click handlers
	app.setupClickHandlers();

	//Set up content player
	player.setupEvents();

	//load our starting data
	ajax.loadArtists();

	//make queue sortable
	app.makeQueueSortable();
});
