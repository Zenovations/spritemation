
(function($) {
   /**
    * DESCRIPTION
    * -----------
    * The spritemation plugin animates CSS sprites (background images on a DOM element which are larger than the element's
    * viewable portal) through a sequence of frames to create the illusion of transitions or movement.
    *
    * If you are not familiar with CSS sprites, begin by learning about those:
    * http://www.noobcube.com/tutorials/html-css/css-background-image-sprites-a-beginners-guide-/
    * http://nicolasgallagher.com/css-background-image-hacks/
    *
    * It can be called in one of two ways: spritemation( endStep, duration ) or spritemation( opts )
    *
    * EXAMPLES
    * --------
    * <code>
    *    // cycle from frame 0 to frame 10 in 1 second (at 10 fps)
    *    $('#sprite').spritemation( 10, 1000 );
    *
    *    // or...
    *    $('#sprite').spritemation( { end: 10, fps: 100 } );
    *
    *    // cycle backward from frame 10 to 5 in 1 second (at 5 fps)
    *    $('#sprite').spritemation( { start: 10, end: 5 }, 1000 );
    *
    *    // or...
    *    $('#sprite').spritemation( { start: 10, end: 5, fps: 5 } );
    *
    *    // or...
    *    $('#sprite').spritemation( { start: 10, end: 5, duration: 1000 } );
    *
    *    // skip to the 4th frame without any animation (use duration of zero)
    *    $('#sprite').spritemation( 4, 0 );
    * </code>
    *
    * OPTIONS
    * -------
    *
    * `opts` accepts any of the following arguments:
    *
    *    {int}      end        (default=0) which frame are we going to animate to?
    *    {int}      fps        (default=10) how fast should we animate? (frames per second)
    *    {int}      duration   (default=null) how long should we animate? (milliseconds, see below)
    *    {int}      cycles     (default=1) see below
    *    {boolean}  modulate   (default=false) cycles back and forth (see below)
    *    {function} callback  {default=null} executed when animation completes, receives final frame position
    *    {int}      start       which frame to begin the animation from (defaults to its current position)
    *
    * The spritemation automatically calculates the following arguments. It doesn't probably make sense to
    * override any of them unless you want the animations to act weird, but you could do so as an (unnecessary)
    * optimization (if they happen to be known ahead of time):
    *
    *    {int}     frameWidth   the width of the visible pane (of one frame of the sprite image)
    *    {int}     frameHeight  the height of the visible pane (of one frame of the sprite image)
    *    {boolean} vertical     is this sprite vertically oriented?
    *
    * ANIMATION LENGTH AND SPEED
    * --------------------------
    * For convenience, there are two ways to control the speed of the animation. If you want it to run in parallel with
    * some other animations, you can utilize the `duration`, which will ensure they start and stop at the same time.
    *
    * However, this causes it to animate faster/slower depending on how far it's travelling (in other words, it has
    * to get from 0-10 in the same amount of time that it gets from 0-5). If that's undesirable, you can utilize the
    * `fps` argument to set how fast each frame should tick by.
    *
    * In the case that both exist, `duration` takes precedence, except when using the cycle option (see below).
    *
    * CYCLIC ANIMATIONS
    * -----------------
    * Using `cycles`, it is possible to make spritemation go through the frames more than once. It can `modulate`
    * (go back and forth) through the frames or restart each time through.
    *
    * Examples:
    * <code>
    *    // cycle frames 9-0 (backwards), a total of 10 times (100 frames) in 1 second, starting back at 9 each time 0 is reached
    *    spritemation({ start: 9, end: 0, cycles: 10 }, 1000 );
    *
    *    // modulate frames 0-10 a total of 5 times each direction (100 frames) in 1 second, reversing from 10-0
    *    // before going forward again
    *    spritemation({ start: 0, end: 10, cycles: 5, modulate: true }, 1000 );
    * </code>
    *
    * Note that above we specified the start positions, which would begin the spritemation by positioning the background
    * to the start frame. This is not necessary if the sprite is already positioned at the correct frame or we don't
    * care where it starts from.
    *
    * @param {Object|int} [opts] see above
    * @param {int}        [duration] can also be declared in opts
    */
   $.fn.spritemation = function(opts, duration) {
      // clear any running sprite animation so when we can run ours immediately (and get accurate starting datum)
      return this.each(function() {
         // we may have to load an image to get the args, so wait for promise to fulfill
         _getArgs(opts, duration, $(this)).done($.proxy(function(args) {
            var $self = $(this).stop('spritemation', true), it = new CycleIterator(args);
            if( args.duration === 0 || args.start == args.end ) {
               // show a frame number without any animation (with duration zero)
               $self.css('background-position', _bgPos(args, args.end));
               if( args.callback ) { args.callback(args.end); }
            }
            else {
               var frame, delay = 1000/args.fps, _checkQueue;

               // a callback to check the queue and see if all the frames have loaded
               if( args.callback ) {
                  _checkQueue = function(lastStep) {
                     if( lastStep && args.callback ) {
                        args.callback(frame);
                     }
                  }
               }

               // iterate the frames and load them into the queue
               while(it.hasNext()) {
                  frame = it.next();
                  $self.queue('spritemation', _nextFrame($self, _bgPos(args, frame), _checkQueue)).delay(delay, 'spritemation');
               }
               $self.dequeue('spritemation');
            }
         }, this));
      });
   };

   /** ITERATOR
    ******************************************************************/

   function CycleIterator(args) {
      this.first      = Math.min(args.start, args.end);
      this.last        = Math.max(args.start, args.end);
      this.frames     = this.last - this.first + 1; // inclusive, so add 1
      this.modulate   = !!(args.modulate);
      this.maxSteps   = this.frames * args.cycles;
      this.direction  = args.start > args.end? -1 : 1;
      this.curStep    = -1;
      this.curFrame   = this.direction < 0? this.last : this.first;
   }

   CycleIterator.prototype.next = function() {
      if( this.hasNext() ) {
         this.curStep++;
         if( this.modulate ) {
            if( (this.direction > 0 && this.curFrame === this.last)
                || (this.direction < 0 && this.curFrame === this.first) ) {
               this.direction = -(this.direction);
            }
            this.curFrame = this.curFrame + this.direction;
         }
         else {
            var amt = this.curStep % this.frames;
            if( this.direction < 0 ) {
               this.curFrame = this.last - amt;
            }
            else {
               this.curFrame = this.first + amt;
            }
         }
         return this.curFrame;
      }
      else {
         if( typeof(console) === 'object' && console.warn ) {
            console.warn('CycleIterator.next() called after last element; that was probably a mistake');
         }
         return false;
      }
   };

   CycleIterator.prototype.hasNext = function() {
      return this.curStep < this.maxSteps-1;
   };

   CycleIterator.prototype.reset = function() {
      this.curStep = -1;
      this.curFrame = this.direction < 0? this.last : this.first;
   };

   /** UTILITIES
    ******************************************************************/

   /**
    * @param {jQuery}   $this
    * @param {string}   bgPos
    * @param {function} [callback]
    * @return {Function}
    * @private
    */
   function _nextFrame($this, bgPos, callback) {
      return function( next ) {
         $this.css('background-position', bgPos);
         next();
         callback && callback( $this.queue('spritemation').length < 1 );
      };
   }

   function _getArgs(opts, duration, $this) {
      // we defer returning arguments because we may need to load an image to determine background width/height
      // which is asynchronous
      return $.Deferred(function(def) {
         // cache the costly calculations so calling spritemation scales well
         var cache = $this.data('spritemation');

         // opts might be an integer value
         if( opts && typeof(opts) !== 'object' ) { opts = {end: ~~opts}; }
         // or opts might not even exist
         else if( !opts ) { opts = {}; }

         // duration might be declared as another arg or in opts
         if( !(duration in opts) && typeof(duration) in {number: 1, string: 1} ) { opts.duration = ~~duration; }

         // apply the defaults, override with any declared options
         var undef, args = $.extend({
            start: undef,
            end: 0,
            frameHeight: undef,
            frameWidth: undef,
            vertical: undef,
            fps: 30,
            cycles: 1,
            cycleType: 'restart'
         }, cache, opts);

         function _resolveArgs(isVertical) {
            args.vertical = isVertical;
            if( !args.frameWidth ) { args.frameWidth = $this.innerWidth(); }
            if( !args.frameHeight ) { args.frameHeight = $this.innerHeight(); }
            if( args.start === undef ) {
               // we can't cache this because it changes every time the sprite shifts frames
               //todo but we could cache the bgOffset for each frame!
               args.start = _calcBgOffset($this, args.frameHeight, args.frameWidth, args.vertical);
            }

            var span = Math.abs(args.end - args.start)+1; // inclusive, so add 1

            if( args.duration ) {
               // if there is a duration, then the fps needs to be calculated to ensure we reach args.end
               // exactly at end of the animation
               var frames = span * args.cycles;

               // if we are going to modulate, then the total steps is doubled (we come back once for each cycle)
               if( args.modulate ) { frames *= 2; }

               // teh maths: fps = frames / duration * 1000
               args.fps = Math.round( frames / duration * 1000 );
            }

            if( !cache ) {
               // cache the costly calculations so calling spritemation scales well
               $this.data('spritemation', {
                  frameHeight: args.frameHeight,
                  frameWidth: args.frameWidth,
                  vertical: args.vertical,
                  clearQueue: false
               })
            }

            args.cache = cache;

            def.resolve(args);
         }

         if( 'vertical' in opts ) {
            // if the vertical/horizontal orientation of the sprite has been specified by caller, there is no reason
            // to bother fetching it, so go ahead and resolve right now.
            _resolveArgs(opts.vertical);
         }
         else {
            // only calculate this if it is not already declared; we have to load an image and potentially
            // perform an http request, which could turn out to be expensive
            _isVertical($this).then(_resolveArgs);
         }
      });
   }

   function _isVertical($e) {
      return $.Deferred(function(def) {
         var imgUrl = $e.css('background-image');//, $img = $('<img />');
         $('<img />').hide().appendTo('body').on('load', function() {
            def.resolve($(this).height() > $(this).width());
            $(this).remove();
         }).attr('src', imgUrl.substr(5, imgUrl.length-7));
      });
   }

   function _bgPos(args, step) {
      var x = args.vertical? 0 : _calcBgPx(args, step, false),
          y = args.vertical? _calcBgPx(args, step, true)+'px' : 0;
      return [
         x? x + 'px' : 0,
         y? y + 'px' : 0
      ].join(' ');
   }

   function _calcBgPx(args, step, vertical) {
      return vertical? args.frameHeight * -step : args.frameWidth * -step;
   }

   function _calcBgOffset($e, h, w, vertical) {
      var bgPos = $e.css('background-position'), side = vertical? h : w, idx = vertical? 2 : 1;
      var m = bgPos && bgPos.match(/^(-?[0-9]+(?:px|em|%)?) ?(-?[0-9]+(?:px|em|%)?)?$/);
      return m? Math.floor(Math.abs( $.UnitConverter.px($e, m[idx]) / side )) : 0;
   }

   /**
    * Ensure a number stays within a given range
    *
    * @param {number} num
    * @param {number} min
    * @param {number} max
    * @return {number}
    */
   function range(num, min, max) {
      if( min > max ) {
         //switch em
         min = min^max;
         max = min^max;
         min = min^max;
      }
      return Math.max(min, Math.min(max, num));
   }

})(jQuery);

