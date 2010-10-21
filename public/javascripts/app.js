var ajax = {
	loadComments: function(dealNumber, $commentDiv) {
	}
};

var app = {
	//Set content height
	//Total height of window minus the height of the top two elements
	setContentHeight: function() {
		$('#content').css('height', $(window).height());
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

	loadArtists: function() {
		//Load up our ideas
		$.ajax({
			url: 'list/artist.json',
			success: function(json, text, xhr) {
				var list = $('<ul/>').appendTo($('#browser').empty());
				$.each(json, function(key, value) {
					$('<li/>').append(
					$('<a/>', {
						text: value,
						href: "list/album/for/artist/" + value,
					}).click(function(e) {
						e.preventDefault();
						var $curLink = $(this);
						$.ajax({
							url: $curLink.attr('href') + '.json',
							success: function(json, text, xhr) {
								var albumList = $('<ul/>');
								$.each(json, function(key, value) {
									$('<li/>').append(
										$('<a/>', {
											text: value,
											href: "show/album/" + value
										}).click(function(e) {
											e.preventDefault();
											var $curLink = $(this);
											$.ajax({
												url: $curLink.attr('href') + '.json',
												success: function(json, text, xhr) {
													var trackList = $('<ul/>');
													$.each(json, function(key, value) {
														$('<li/>').text(value.track + ": " + value.title).appendTo(trackList);
													});
													$curLink.parent().append(trackList);
												}
											});
										})).appendTo(albumList);
								});
								$curLink.parent().append(albumList);
							}
						});
					})).appendTo(list);
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

	//load our starting data
	app.loadArtists();
	
	//If there is a hash
	//Load that
	//Also set hash on navigation

});
