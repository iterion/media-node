var ajax = {
	loadComments: function(dealNumber, $commentDiv) {
	}
};

var app = {
	//Set content height
	//Total height of window minus the height of the top two elements
	setContentHeight: function() {
		$('#browser').css('height', $(window).height());
		$('#player').css('height', $(window).height());
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
			e.preventDefault();
			var $curLink = $(this);
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

	//load our starting data
	app.loadArtists();
	
	//If there is a hash
	//Load that
	//Also set hash on navigation

});
