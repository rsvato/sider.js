(function($){
	var settings; 
	$.fn.slider = function(sliderSettings) {
		settings = $.extend({
			sliderClass: 'slider',
			wrapperClass: 's-content-wrapper',
			scrollableClass: 'scrollable',
			rows: 1,
			element: 'div'
		}, sliderSettings || {});
		
		var firstElement = function(elem) {
			var examine = elem || $content;
			var result = examine.find(settings.element).first();
			return result;
		};
		
		var lastElement = function(elem) {
			var examine = elem || $content;
			var result = examine.find(settings.element).last();
			return result;
		};
		
		var widthAndHeight = function(container) {
			var first = firstElement(container);
			var elementWidth = first.outerWidth(true);
			var elementHeight = first.outerHeight(true);
			var height = $content.outerHeight();
			var height = elementHeight * settings.rows;
			var hasGaps = 'inline-block' === first.css('display');
			var addition = 0;
			var fontSize = parseInt(first.css('font-size'));
			if (hasGaps && fontSize) {
				addition = fontSize;
			}
			var total = (elementWidth + addition) * $content.children().length;
			var dimensions = {width: total, height: height, itemWidth: elementWidth + addition};
			if (total > $(window).width()) {
				total = Math.floor(total / settings.rows);
				dimensions.width = total;
			}
			return dimensions;
		}
		
		var $content = $(this);
		var restore = false;
		var elem = $content;
		var restore = false;
		if ($content.is(":hidden")) {
			elem = $content.clone().attr('style', 'position: absolute !important; top: -1000 !important;').attr('id', 'slider_fix_clone');
			elem.css('display', 'block');
			elem.prependTo('body');
		}
		var dimensions = widthAndHeight(elem);
		if (restore) {
			$('#slider_fix_clone').remove();
		}
		$content.css('width', dimensions.width);
		$content.css('margin', '0 0');
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
			var rightmost = settings.rows == 1 ? lastElement() : function(list) {
				index = Math.ceil(list.length / settings.rows);
				return list[index - 1];
			}($content.children());
			var left = visibleCond($(rightmost), function(e) {
				var lft = e.offset().left;
				if (lft === 0 && $content.children().length > 0) {
					lft = dimensions.width;
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
			var link = $('<div rel="' + direction + '" class="scroll-' + direction + '"/>');
			link.css('height', dimensions.height);
			link.on('mouseenter', function(evt){
				evt.preventDefault();
				var content = $(target).children().first();
				var target = $(evt.target);
				var direction = target.attr('rel');
				animating = true;
				offset = dimensions.itemWidth;
				$content.animate({marginLeft: sign + '=' + offset}, 1000, function(){
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
				link.css('left', ($(window).width() - 70) + "px")
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