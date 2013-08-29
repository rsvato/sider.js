(function($){
  var settings;
  $.widget('ui.slider', {
    options: {
      sliderClass: 'slider',
      wrapperClass: 's-content-wrapper',
      scrollableClass: 'scrollable',
      rows: 1,
      element: 'div',
      widthToWindow: true
    },
    animating: 0,
    fxWidth: function() {},
    width: 0,
    _create: function() {
      settings = $.extend({}, this.options || {});
      var _self = this;
      var $parent = this.element;
      var resizeTimer;
      this.width = $parent.outerWidth(true);
      if (settings.widthToWindow) {
        this.width = $(window).width();
      }
      var koeff = this.width / $(window).width();
      this.fxWidth = function() {
        return $(window).width() * koeff;
      } ;
      $parent.css('overflow', 'hidden');
      $parent.css('width', this.width + "px");
      var $content = $parent.children().first().detach();
      this.$content = $content;
      $content.find('style').remove();
      var elem = $content;
      var restore = false;
      if ($content.is(":hidden")) {
        elem = $content.clone().attr('style', 'position: absolute !important; top: -1000 !important;').attr('id', 'slider_fix_clone');
        elem.css('display', 'block');
        elem.prependTo('body');
        restore = true;
      }
      var dimensions = this.widthAndHeight(elem);
      if (restore) {
        $('#slider_fix_clone').remove();
      }
      $content.css('width', dimensions.width);
      $content.css('margin', '0 0');
      var $slider = $('<div class="slider"/>');
      var $wrapper = $('<div class="s-content-wrapper"/>');
      $wrapper.append($content);

      $slider.append(this.makeScroll('left', dimensions.height))
        .append($wrapper)
        .append(this.makeScroll('right', dimensions.height));

      $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(_self.adjustWidthAndPosition(), 100);
      });

      this.element.on('change-scroller', function(event, data) {
        var leftScroll = $slider.find('.scroll-left');
        leftScroll.toggle(data.left);
        var rightScroll = $slider.find('.scroll-right');
        rightScroll.toggle(data.right);
        if (_self.animating != 0) {
          if ((_self.animating < 0 && !data.right) || (_self.animating > 0 && !data.left)) {
            _self.stopAnimation();
          } else {
            _self.animate(_self.animating);
          }
        }
      });

      $content.on('slide', function(event, direction){
        $content.animate({marginLeft: '+=' + direction * dimensions.itemWidth}, 1000, function(){
          _self.checkScrollVisibility(_self.element, _self.$content, dimensions);
        })
      });

      this.checkScrollVisibility($parent, $content, dimensions);
      $slider.appendTo($parent);
      return $parent;
    },

    firstElement: function(elem) {
      var examine = elem || this.$content;
      return examine.find(this.options.element).first();
    },

    elementCount: function(elem) {
      var examine = elem || this.$content;
      return examine.children(this.options.element).length;
    },

    widthAndHeight: function(container) {
      var first = this.firstElement(container);
      var elementWidth = first.outerWidth(true);
      var elementHeight = first.outerHeight(true);
      var hasGaps = true;
      var addition = 0;
      var fontSize = parseInt(first.css('font-size'));
      if (hasGaps && fontSize) {
        addition = fontSize;
      }
      elementWidth = elementWidth + addition;
      var total = (elementWidth + addition) * this.elementCount(container);
      var dimensions = {width: total, height: elementHeight, itemWidth: elementWidth};
      if (total > $(window).width()) {
        var longestRow = Math.floor(this.elementCount(container) / settings.rows);
        total = elementWidth * longestRow;
        while (total < ($(window).width() - elementWidth)) {
          longestRow += 1;
          total = elementWidth * longestRow;
        }
        dimensions.width = total;
        dimensions.height = elementHeight * settings.rows
      }
      return dimensions;
    },

    checkScrollVisibility: function($parent, $content, dimensions) {
      var right = function() {
        var width = $parent.outerWidth(false);
        var right = (dimensions.width + parseInt($content.css('marginLeft')));
        return right > width;
      };
      var left = function() {
        return parseInt($content.css('marginLeft')) < 0;
      };
      this.element.trigger('change-scroller', {left: left.call(), right: right.call()});
    },

    animate: function(dir) {
      this.animating = dir;
      this.$content.trigger('slide', dir);
    },

    stopAnimation: function() {
      this.animating = 0;
    },

    makeScroll: function(direction, height) {
      var sign = '+';
      if (direction === 'right') {
        sign = '-';
      }
      var link = $('<div rel="' + direction + '" class="scroll-' + direction + '"/>');
      link.css('height', height);
      link.on('click', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
      });
      var self = this;
      link.on('mouseenter', function(evt){
        evt.preventDefault();
        var target = $(evt.target);
        var direction = target.attr('rel');
        var coeff = direction === 'right' ? -1 : 1;
        self.animate(coeff);
      });

      link.on('mouseout', function() {
        self.stopAnimation();
      });

      if (direction === 'right') {
        var leftMargin = this.width - 63;
        link.css('left', leftMargin + "px");
      }
      return link;
    },

    adjustWidthAndPosition: function($parent, $slider) {
      var width = Math.floor(this.fxWidth());
      $parent.attr('style', 'width: ' + width + 'px !important');
      var rightPosition = width - 63;
      var rightScroll = $slider.find('div.scroll-right');
      rightScroll.css('left', rightPosition + 'px');
      var visibility = this.checkScrollVisibility($parent, this.$content, this.widthAndHeight(this.$content));
      if (visibility.left) {
        $slider.find('.scroll-left').css('display', 'block');
      } else {
        $slider.find('.scroll-left').css('display', 'none');
      }
    }
  })
})(jQuery);