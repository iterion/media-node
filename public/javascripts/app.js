var player = {
	currentTrack: null,
	currentTrackId: null,
	currentPosition: 0,
	controls: $('#controls'),
	setupEvents: function() {
		$('#player').bind("queueChanged", function(e, state, item) {
			$queue = $(this).find('.queue li');
			if((($queue.length-1) < player.currentPosition) && $queue.length > 0) {
				player.currentPosition = $queue.length - 1;
			}
			if((state == "new" && $queue.length <= 1) || state == undefined) {
				var newTrack = $($queue[player.currentPosition]).data('_id');
				if(newTrack) {
					player.currentTrackId = newTrack;
					player.currentTrack = new Audio('download/' + player.currentTrackId);
					player.setupTrack();
					player.currentTrack.play();
				} else {
					player.currentTrackId = null;
					player.currentTrack.pause();
				}
			} else if (state == "removed") {
				if (item == player.currentPosition) {
					player.currentTrack.pause();
					player.currentTrackId = newTrack;
					player.currentTrack = new Audio('download/' + player.currentTrackId);
					player.setupTrack();
					player.currentTrack.play();
				} else if (item < player.currentPosition) {
					player.currentPosition--;
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
			$(currentQueue[player.currentPosition]).removeClass("playing");
			if (currentQueue.length > 1) {
				if ((currentQueue.length - 1) <= player.currentPosition) {
					//wrap around when we reach the end
					player.currentPosition = 0;
				} else {
					//increment if we're not at the end
					player.currentPosition++;
				}
				player.currentTrack.pause();
				$('#player').trigger('queueChanged');
			}
		});
	},
	setupTrack: function() {
		$(player.currentTrack).bind("ended", function () {
			$queue = $('.queue li');
			$($queue[player.currentPosition]).removeClass("playing");
			player.currentPosition++;
			$('#player').trigger('queueChanged');
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

	setupAjaxDefaults: function() {
		$.ajaxSetup({
			dataType: "json",
			timeout: 5000
		});
	},

	setupAjaxHandlers: function() {
		//show loading indicator
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
		this.setupRemoveTrack();
	},
	
	setupRemoveTrack: function() {
		//handle removal of tracks from queue
		$('.actions .remove').live('click', function(e) {
			var $curLink = $(this);
			var currentLi = $curLink.parents('li');
			currentLi.remove();
			$('#player').trigger('queueChanged', ['remove', $('.queue li').index(currentLi)]);
		});
	},

	setupViewerLinks: function() {
		//handle addition of tracks to queue
		$('li a.viewer-link').live('click', function(e) {
			var $curLink = $(this);
			if($curLink.data('ext') == 'mp3' || $curLink.data('ext') == 'ogg') {
				$('#player ol').append($('<li/>')
					.append($('<h4 class="title" />').text($curLink.data('title')))
					.append($('<p class="artist" />').text($curLink.data('artist')))
					.append($('<p class="album" />').text($curLink.data('album')))
					.append($('<p class="actions" />')
						.append($('<span class="remove" />')))
					.data('_id', $curLink.data('_id'))
				);
				$('#player').trigger('queueChanged', 'new');
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
				//don't currently need to
			}
			//is this section loaded?
			if(!$curLink.data('loaded')) {
				$.ajax({
					url: $curLink.attr('href') + '.json',
					beforeSend: function() {
						$curLink.data('loaded', true);
					},
					success: function(json, text, xhr) {
						var newList = $('<ul/>');
						$.each(json, function(key, value) {
							//TODO make this shit more DRY
							if (newClass == "track") {
								$('<li/>').append(
									$('<a/>', {
										"class": "viewer-link " + newClass,
										text: value.track + ". " + value.title,
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
						//in case we have a problem loading data set
						//the loaded flag to false to force reload
						$curLink.data('loaded', false);
					}
				});
			} else {
				//when the list is loaded just toggle the display
				$curLink.parent().find('ul').first().toggleClass('hidden');
			}
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
	}
};


$(function() {
	//Set up window height
	app.setContentHeight();
	
	//Make sure we preserve these heights on a resize
	$(window).resize(app.setContentHeight);
	
	//Set up global Ajax defaults
	app.setupAjaxDefaults();

	//Set up gloabal Ajax handlers
	app.setupAjaxHandlers();

	//Set up click handlers
	app.setupClickHandlers();

	//Set up content player
	player.setupEvents();

	//load our starting data
	app.loadArtists();
});
