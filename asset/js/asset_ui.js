// UI generation code
// details panel

jQuery(document).ready(function($){
	$('.overlay').click(function(){
		$(this).removeClass('overlay').addClass('mappy'); 
	// I need to creatre a mappy class so that the next function has something to target
	});
	$('.map-container').mouseleave(function() {
		$(".mappy").removeClass('mappy').addClass('overlay');
	});
});
