(function($){
	var settings; 
	$.fn.slider = function(sliderSettings) {
		settings = $.extend({
			sliderClass: 'slider',
			wrapperClass: 's-content-wrapper',
			scrollableClass: 'scrollable',
		}, sliderSettings || {});
		
		var firstElement = function() {
			var result = $content.children().first();
			return result;
		};
		
		var lastElement = function() {
			var result = $content.children().last();
			return result;
		};
		
		var $content = $(this);
		var itemWeight = firstElement().outerWidth() * $content.children().length;
		$content.css('width', itemWeight);
		var $slider = $('<div class="slider"/>');
		var $wrapper = $('<div class="s-content-wrapper"/>');
		var $scrollable = $('<div class="scrollable"/>');
		$wrapper.append($scrollable);
		$scrollable.append($content);
		var animating = false;
		
		var visibleCond = function(elem, f) {
			return f(elem);
		};
		
		var checkScrollVisibility = function() {
			var left = visibleCond(lastElement(), function(e) {
				var lft = e.offset().left;
				if (lft === 0 && $content.children().length > 0) {
					lft = itemWeight;
				}
				var rightEdge = $(window).width() - (lft + e.outerWidth());
				return rightEdge > 0;
			});
			var right = visibleCond(firstElement(), function(e) {
				return e.offset().left > 0;
			});
			return {left: !left, right: !right};
		};
		
		var makeScroll = function(direction, target) {
			var sign = '+', symbol = '>'
			if (direction === 'left') {
				sign = '-';
				symbol = '<'
			}
			var link = $('<div rel="' + direction + '" class="scroll-' + direction + '"><span>' + symbol + '</span></div>');
			
			link.on('mouseenter', function(evt){
				evt.preventDefault();
				var content = $(target).children().first();
				var target = $(evt.target);
				var direction = target.attr('rel');
				animating = true;
				$content.animate({marginLeft: sign + '=184'}, 1000, function(){
					var visibility = checkScrollVisibility();
					$slider.find('.scroll-left').toggle(showOrHide = visibility.left);
					$slider.find('.scroll-right').toggle(showOrHide = visibility.right);
					if (animating && direction === 'right' && visibility.right) {
						target.trigger('mouseenter');
					}
					if (animating && direction === 'left' && visibility.left) {
						target.trigger('mouseenter');
					}
				});
				
			});
			
			link.on('mouseout', function(evt) {
				animating = false;
			});
			
			if (direction === 'right') {
				link.css('left', ($(window).width() - 50) + "px")
			}
			return link;
		}
		
		$slider.append(makeScroll('left', $wrapper));
		$slider.append($wrapper);
		$slider.append(makeScroll('right', $wrapper));
		var visibility = checkScrollVisibility();
		if (!visibility.left) {
			$slider.find('.scroll-left').css('display', 'none');
		}
		return $slider;
	};
})(jQuery);