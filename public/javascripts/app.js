var player = {
	currentTrack: null,
	currentTrackId: null,
	currentPosition: 0,
	controls: $('#controls'),
	setupEvents: function() {
		player = this;
		$('#player').bind("queueChanged", function() {
			$queue = $(this).find('.queue li');
			
			var newTrack = $queue.first().data('_id');
			if(newTrack) {
				if(newTrack != player.currentTrackId) {
					player.currentTrackId = newTrack;
					player.currentTrack = new Audio('download/' + player.currentTrackId);
					player.setupTrack();
					player.currentTrack.play();
				}
			}
		});
		$('#playtoggle').bind('click', function(e) {
			e.preventDefault();
			var cur = player.currentTrack;
			if(cur) {
				if(cur.paused) {
					cur.play();
				} else {
					cur.pause();
				}
			}
		});
		$('#skip').bind('click', function(e) {
			e.preventDefault();
			var currentQueue = $('.queue li');
			console.log(currentQueue);
			if (currentQueue.length > 1) {
				currentQueue.first().remove();
				player.currentTrackId = "";
				player.currentTrack.pause();
				$('#player').trigger('queueChanged');
			}
		});
	},
	setupTrack: function() {
		$(player.currentTrack).bind("ended", function () {
			$queue = $('.queue li');
			$queue.first().remove();
			player.currentTrackId = "";
			$('#player').trigger('queueChanged');
		}).bind('play',function() {
		  $("#playtoggle").addClass('playing');  
		}).bind('pause ended', function() {
			$("#playtoggle").removeClass('playing');   
		});
		$(player.currentTrack).bind("timeupdate", function() {
			var rem = parseInt(this.duration - this.currentTime, 10),
			pos = (this.currentTime / this.duration) * 100,
			mins = Math.floor(rem/60,10),
			secs = rem - mins*60;

			$('#timeleft').text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
		});
	}

};

var app = {
	//Set content height
	//Total height of window minus the height of the top two elements
	setContentHeight: function() {
		$('#browser').css('height', $(window).height());
		$('#player').css('height', $(window).height());
		$('#player .queue').css('height', $(window).height() - $('#controls').height()); 
	},

	setupAjaxDefaults: function() {
		$.ajaxSetup({
			dataType: "json",
			timeout: 5000
		});
	},

	setupAjaxHandlers: function() {
		var $loading = $('#loading');
		$('body').ajaxStart(function() {
			$loading.show();
		});
		$('body').ajaxStop( function() {
			$loading.fadeOut();
		});
	},

	setupClickHandlers: function() {
		this.setupBrowserLinks();
		this.setupViewerLinks();
	},
	
	setupViewerLinks: function() {
		$('li a.viewer-link').live('click', function(e) {
			var $curLink = $(this);
			if($curLink.data('ext') == 'mp3' || $curLink.data('ext') == 'ogg') {
				$('#player ol').append($('<li/>')
					.append($('<h4 class="title" />').text($curLink.data('title')))
					.append($('<p class="artist" />').text($curLink.data('artist')))
					.append($('<p class="album" />').text($curLink.data('album')))
					.data('_id', $curLink.data('_id'))
				);
				$('#player').trigger('queueChanged');
			}
			return false;
		});
	},

	setupBrowserLinks: function() {
		$('li a.browser-link').live('click', function(e) {
			e.preventDefault();
			var $curLink = $(this);
			var newHref = "";
			var newClass = "";
			if ($curLink.hasClass('artist')) {
				//we're getting albums
				newHref = "show/album/";
				newClass = "album";
			} else if ($curLink.hasClass('album')) {
				newHref = "";
				newClass = "track"
			} else {
				//dunno how to handle this
			}
			if(!$curLink.data('loaded')) {
				$.ajax({
					url: $curLink.attr('href') + '.json',
					beforeSend: function() {
						$curLink.data('loaded', true);
					},
					success: function(json, text, xhr) {
						var newList = $('<ul/>');
						$.each(json, function(key, value) {
							if (newClass == "track") {
								$('<li/>').append(
									$('<a/>', {
										"class": "viewer-link " + newClass,
										text: value.track + ": " + value.title,
										href: "#"
									}).data(value)
								).appendTo(newList);
							} else {
								$('<li/>').append(
									$('<a/>', {
										"class": "browser-link " + newClass,
										text: value,
										href: newHref + value
									})
								).appendTo(newList);
							}
						});
						$curLink.parent().append(newList);
					},
					error: function(json, text, xhr) {
						$curLink.data('loaded', false);
					}
				});
			} else {
				//var childList = i
				$curLink.parent().find('ul').first().toggleClass('hidden');
				//childList.toggleClass('hidden');
			}
		});
	},

	loadArtists: function() {
		//Load up our ideas
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
					//$('<li/>').text(value.track + ": " + value.title).appendTo(trackList);
				});
			}
		});
	}
};


$(function() {
	//Setup for window height
	app.setContentHeight();
	
	$(window).resize(app.setContentHeight);
	
	//Set up global Ajax defaults
	app.setupAjaxDefaults();

	//Set up gloabal Ajax handlers
	app.setupAjaxHandlers();
	app.setupClickHandlers();

	//setup content player
	player.setupEvents();

	//load our starting data
	app.loadArtists();
	
	//If there is a hash
	//Load that
	//Also set hash on navigation

});
