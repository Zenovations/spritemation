
# Spritemation - CSS sprite animator

The spritemation plugin animates CSS sprites through a sequence of frames using the background-position property.

If you are not familiar with CSS sprites, begin by learning about those:
http://www.noobcube.com/tutorials/html-css/css-background-image-sprites-a-beginners-guide-/
http://nicolasgallagher.com/css-background-image-hacks/

It can auto-detect the sprite's frame size, height and width, and whether frames are vertically or horizontally
oriented (based on height/width of the sprite image).

**Whatsit Cost?**

 5.3K minified; 2.1K gzipped.

**Why would you use this instead of an animated GIF?**

If you are asking this question, and the benefits of a plugin--being able to control where and when the animation begins,
dynamically alter the speed, reverse or cycle a given number of times, pause and continue at will--are not obvious,
then you probably want an animated gif and not this plugin.

# Documentation

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/zenovations/spritemation/master/spritemation.min.js
[max]: https://raw.github.com/zenovations/spritemation/master/spritemation.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/spritemation.min.js"></script>
<script>
jQuery(function($) {
   $('#sprite').spritemation( 10 );
});
</script>
```

## Examples

It can be called in one of two ways: `spritemation( endStep, duration )` or `spritemation( opts )`

```javascript
   // cycle from frame 0 to frame 10 however fast it gets there (default is 30 fps, so pretty darn quickly)
   $('#sprite').spritemation( 10 );

   // cycle from frame 0 to frame 10 in 1 second (at 10 fps)
   $('#sprite').spritemation( 10, 1000 );

   // or...
   $('#sprite').spritemation( { end: 10, fps: 10 } );

   // cycle backward from frame 10 to 5 in 1 second (at 5 fps)
   $('#sprite').spritemation( { start: 10, end: 5 }, 1000 );

   // or...
   $('#sprite').spritemation( { start: 10, end: 5, fps: 5 } );

   // or...
   $('#sprite').spritemation( { start: 10, end: 5, duration: 1000 } );

   // skip to the 4th frame without any animation (use duration of zero)
   $('#sprite').spritemation( 4, 0 );
```

## OPTIONS

`opts` accepts any of the following arguments:

   {int}      end        (default=0) which frame are we going to animate to?
   {int}      fps        (default=10) how fast should we animate? (frames per second)
   {int}      duration   (default=null) how long should we animate? (milliseconds, see below)
   {int}      cycles     (default=1) see below
   {boolean}  modulate   (default=false) cycles back and forth (see below)
   {function} callback  {default=null} executed when animation completes, receives final frame position
   {int}      start       which frame to begin the animation from (defaults to its current position)

The spritemation automatically calculates the following arguments. It doesn't probably make sense to
override any of them unless you want the animations to act weird, but you could do so as an (unnecessary)
optimization (if they happen to be known ahead of time):

   {int}     frameWidth   the width of the visible pane (of one frame of the sprite image)
   {int}     frameHeight  the height of the visible pane (of one frame of the sprite image)
   {boolean} vertical     is this sprite vertically oriented? set this if vertical sprites don't behave

**NOTE TO DEVS USING CHROME**: When viewing files in Chrome on the local filesystem (with file:/// in the url
instead of http), this plugin can't determine the height/width of an image (because of a security restriction in Chrome).
So if you want to use vertical sprites with Chrome and are too lazy to use a web server, you'll have to add
`vertical: true`; it will be hard but you can handle it.

## ANIMATION LENGTH AND SPEED

For convenience, there are two ways to control the speed of the animation. If you want it to run in parallel with
some other animations, you can utilize the `duration`, which will ensure they start and stop at the same time.

However, this causes it to animate faster/slower depending on how far it's travelling (in other words, it has
to get from 0-10 in the same amount of time that it gets from 0-5). If that's undesirable, you can utilize the
`fps` argument to set how fast each frame should tick by.

In the case that both exist, `duration` takes precedence, except when using the cycle option (see below).

## CYCLIC ANIMATIONS

Using `cycles`, it is possible to make spritemation go through the frames more than once. It can `modulate`
(go back and forth) through the frames or restart each time through.

Examples:
<code>
   // cycle frames 9-0 (backwards), a total of 10 times (100 frames) in 1 second, starting back at 9 each time 0 is reached
   spritemation({ start: 9, end: 0, cycles: 10 }, 1000 );

   // modulate frames 0-10 a total of 5 times each direction (100 frames) in 1 second, reversing from 10-0
   // before going forward again
   spritemation({ start: 0, end: 10, cycles: 5, modulate: true }, 1000 );
</code>

Note that above we specified the start positions, which would begin the spritemation by positioning the background
to the start frame. This is not necessary if the sprite is already positioned at the correct frame or we don't
care where it starts from.

# Support

Use [the issue tracker][issuetracker] to report problems, request features, and ask questions.

   [issuetracker]: http://github.com/Zenovations/spritemation/issues/

# License
Copyright (c) 2012 katowulf  
Licensed under the MIT, GPL licenses.

# Development

## Release History

### 0.1.0
Release Date: 8/18/2012
The initial release

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

### Important notes
Please don't edit files in the root directory as they are generated via grunt. You'll find source code in the `src` subdirectory!

### Installing grunt
_This assumes you have [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed already._

1. Test that grunt is installed globally by running `grunt --version` at the command-line.
1. If grunt isn't installed globally, run `npm install -g grunt` to install the latest version. _You may need to run `sudo npm install -g grunt`._
1. From the root directory of this project, run `npm install` to install the project's dependencies.
