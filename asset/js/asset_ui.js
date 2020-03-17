// UI generation code
// details panel
import jQuery from "jquery";
window.jQuery = jQuery;

function generateUI(){
	var x;
	jQuery('.outer-map-container').click(function() {
		jQuery('.overlay').removeClass('overlay').addClass('mappy');
	});
	jQuery('.outer-map-container').on('mouseenter', function() {
		if (x) {
			clearInterval(x);
		}
	}).on('mouseleave', function() {
		x = setInterval(function() {
			jQuery('.mappy').addClass('overlay');
		}, 3000);
	});


}

export default generateUI;