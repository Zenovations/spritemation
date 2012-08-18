jQuery(function($) {
   // used by sprites
   var steps = 0;
   var duration = 250;

   // used by boid (not a real Boid algorithm; just a bird with an accent)
   var cycles = 10;
   var fps = 15;

   function drawSprites() {
      var dur = $('#noanimate:checked').length? 0 : duration;
      $('#sprite').spritemation(steps, dur);
      $('#vertical-sprite').spritemation(steps, dur);
   }

   function drawBoid() {
      $('#boid')
            // animate the boid
            .spritemation({
               start: 0,
               end: 3,
               fps: fps,
               cycles:   cycles,
               modulate: true,
               callback: function() {
                  // reset
                  $('#boid').spritemation(0,0);
               }
            });
   }

   $('#step').noUiSlider('init', {
      knobs: 1,
      connect: "lower",
      scale: [0, 10],
      start: [0],
      step: 1,
      change: function() {
         steps = this.noUiSlider('value')[1];
         this.next('h3').text(steps);
      },
      end: drawSprites
   }).next('h3').text(steps);

   $('#duration').noUiSlider('init', {
      knobs: 1,
      connect: "lower",
      scale: [100, 2000],
      start: [duration],
      step: 10,
      change: function() {
         duration = this.noUiSlider('value')[1];
         this.next('h3').text(duration);
      }
   }).next('h3').text(duration);


   $('#cycles').noUiSlider('init', {
      knobs: 1,
      connect: "lower",
      scale: [1, 25],
      start: [cycles],
      step: 1,
      change: function() {
         cycles = this.noUiSlider('value')[1];
         this.next('h3').text(cycles);
      }
   }).next('h3').text(cycles);


   $('#fps').noUiSlider('init', {
      knobs: 1,
      connect: "lower",
      scale: [1, 100],
      start: [fps],
      step: 1,
      change: function() {
         fps = this.noUiSlider('value')[1];
         this.next('h3').text(fps);
      }
   }).next('h3').text(fps);

   $('#boidButton').click(drawBoid);
});
