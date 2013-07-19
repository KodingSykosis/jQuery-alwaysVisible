(function ($) {
    var pluginName = "alwaysVisible";
    var base = { init: $.noop, create: $.noop };
    var prototype = $.extend({}, base, {
        defaults: {
            container: window,
            threshold: {
                left: 0,
                top: 0
            }
        },
        create: function (options) {
            this.options = $.extend(this.defaults, options);
            this.container = $(this.options.container);
            this.wrapper = $('<div>', {
                'class': 'ui-' + pluginName + '-wrap',
                css: {
                    height: this.element.outerHeight()
                }
            });

            this.element.wrap(this.wrapper);
            this.wrapper = this.element.parent();

            if (typeof this.options.beforeSticky === 'function') {
                this.element
                    .on('beforeSticky', this.options.beforeSticky);
            }

            if (typeof this.options.sticky === 'function') {
                this.element
                    .on('sticky', this.options.sticky);
            }

            if (typeof this.options.unSticky === 'function') {
                this.element
                    .on('unSticky', this.options.unSticky);
            }

            this.container
                .on({
                    scroll: $.proxy(this._onContainerScrolling, this),
                });
        },

        init: function () {
            this._onContainerScrolling();
        },

        _onElementSticky: function (currentPosition) {
            var wasSticky = this.element.is('.isSticky');

            if (!wasSticky) {
                var end = this.element.trigger('beforeSticky', currentPosition);
                if (end === false) return;

                this.wrapper
                    .height(this.element.outerHeight());

                var eOff = this.element.offset(),
                    cOff = this.container.offset();
                this.element
                    .appendTo($('body'))
                    .addClass('isSticky')
                    .css({
                        position: 'absolute',
                        top: Math.max(eOff.top, cOff.top),
                        left: Math.max(eOff.left, cOff.left),
                        zIndex: 100
                    });

                this.element
                    .trigger('sticky', currentPosition);
            }
        },

        _onElementUnSticky: function (currentPosition) {
            var wasSticky = this.element.is('.isSticky');
            if (!wasSticky) return;

            this.element
                .trigger('unSticky', currentPosition);

            this.element
                .appendTo(this.wrapper)
                .css({
                    position: 'relative',
                    top: 0,
                    left: 0,
                    zIndex: 'auto'
                })
                .removeClass('isSticky');
        },

        _getRelativePosition: function () {
            var containerOffset =
                this.container
                    .offset();

            var elementOffset =
                this.wrapper
                    .offset();

            return {
                top: elementOffset.top - containerOffset.top,
                left: elementOffset.left - containerOffset.left
            };
        },

        _getScrollPosition: function () {
            var el = this.container;
            return {
                top: el.scrollTop(),
                left: el.scrollLeft()
            };
        },

        _onContainerScrolling: function () {
            var elementPos = this._getRelativePosition();

            if ((this.options.threshold.top !== false && elementPos.top < this.options.threshold.top)
                || (this.options.threshold.left !== false && elementPos.left < this.options.threshold.left)) {
                this._onElementSticky(elementPos);
            } else if (elementPos.top >= (this.options.threshold.top || elementPos.top)
                && elementPos.left >= (this.options.threshold.left || elementPos.left)) {
                this._onElementUnSticky(elementPos);
            }
        }
    });

    function init(method) {
        var instance = this.data(pluginName);
        if (typeof instance === "undefined") {
            var results;
            this.data(pluginName, results = constr.apply(this, arguments));
            return results || this;
        }

        if (arguments.length === 0) {
            return instance.init();
        }

        if (typeof instance[method] === "undefined") {
            return $.error('Method ' + method + ' does not exist on jQuery.' + pluginName);
        }

        return instance[method].apply(instance, Array.prototype.splice.call(arguments, 1)) || this;
    }

    function constr(options) {
        var instance = $.noop;
        instance.prototype = prototype;
        instance = new instance();
        instance.element = this;
        return instance.create(options);
    }

    $.fn[pluginName] = init;
})(jQuery);