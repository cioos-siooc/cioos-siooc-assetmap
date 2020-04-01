// UI generation code
// details panel

jQuery(document).ready(function($) {
	var x;
	$('.outer-map-container').click(function() {
		$('.overlay').removeClass('overlay').addClass('mappy');
	});
	$('.outer-map-container').on('mouseenter', function() {
		if (x) {
			clearInterval(x);
		}
	}).on('mouseleave', function() {
		x = setInterval(function() {
			$('.mappy').addClass('overlay');
		}, 3000);
	});
});