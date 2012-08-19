
/******************************************
 * Converter: Deal with em/px/% conversions
 ******************************************/

(function() {
   /**
    * @param {number,HTMLElement} heightOrElm the element we'll be converting props for
    * @param {string,number} [amt]
    * @param {string} [units]
    */
   function Converter(heightOrElm, amt, units) {
      this.pxHeight = typeof(heightOrElm) === 'number'? heightOrElm : _pxHeight($(heightOrElm));
      // for some reason, IE doesn't like this.load() here (object doesn't support this property or method)
      if(typeof(amt) === 'undefined') { _load(this, 0); }
      else { _load(this, amt, units); }
   }

   Converter.prototype.clone = function($e) {
      return new Converter($e||this.pxHeight, this.amt, this.units);
   };

   Converter.prototype.load = function(amt, units) {
      _load(this, amt, units);
      return this;
   };

   Converter.prototype.add = function(b) {
      if( !(b instanceof Converter) ) {
         b = this.clone().load(b);
      }
      this.amt += b.convert(this.units);
      return this;
   };

   Converter.prototype.convert = function(newType) { return _convVal(this, newType); };

   Converter.prototype.px = function() { return this.convert('px'); };

   Converter.prototype.toString = function() {
      return ''+this.amt+this.units;
   };

   Converter.px = function($e, amt) {return (new Converter($e, amt)).convert('px'); };

   function _load(conv, amt, units) {
      var t = typeof(amt);
      if( t === 'string' ) {
         if( amt.match(/(smallest|small|medium|large|largest)/) ) {
            //todo
            //todo
            //todo
            //todo
            throw new Error('I don\'t know what to do with smallest/small/medium/large/largest yet :(');
         }
         else if( amt.match(/[^0-9.-]/) ) {
            units = _extractUnits(amt);
            amt = _extractVal(amt);
         }
         else if( amt === '' ) {
            amt = 0;
         }
         else {
            amt = parseFloat(amt);
         }
      }
      else if( t !== 'number' ) {
         throw new Error('not a valid number', amt);
      }
      conv.amt = amt;
      conv.units = units? units : 'px';
   }

   function _pxHeight($e) {
      var h, $d = $('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo($e);
      h = $d.height();
      $d.remove();
      return h;
   }

   function _extractVal(v) {
      return parseFloat(v.replace(/[^0-9.-]/, ''));
   }

   function _extractUnits(v) {
      if( v.match(/(em|px|%)$/) ) {
         return v.replace(/.*(em|px|%)$/, '$1');
      }
      else {
         throw new Error('Unable to determine units from '+v);
      }
   }

   function _convVal(a, newUnits) {
      var amt = a.amt, px = a.pxHeight;
      if( amt === 0 ) { return 0; }
      switch(newUnits) {
         case 'px':
            switch(a.units) {
               case 'px':
                  return amt;
               case 'em':
                  return _emToPx(px, amt);
               case '%':
                  return _percentToPx(px, amt);
               default:
                  throw Error('I don\'t know what type "'+a.units+'" is');
            }
         case 'em':
            switch(a.units) {
               case 'px':
                  return _pxToEm(px, amt);
               case 'em':
                  return amt;
               case '%':
                  return _percentToEm(px, amt);
               default:
                  throw Error('I don\'t know what type "'+a.units+'" is');
            }
         case '%':
            switch(a.units) {
               case 'px':
                  return _pxToPercent(px, amt);
               case 'em':
                  return _emToPercent(px, amt);
               case '%':
                  return amt;
               default:
                  throw Error('I don\'t know what type "'+a.units+'" is');
            }
         default:
            throw Error('I don\'t know what type "'+a.units+'" is');
      }
   }

   function _pxToEm(h, px) {
      if( px > 0 ) {
         return _round(px/h, 3);
      }
      return 0;
   }

   function _emToPx(h, em) {
      if( em > 0 ) {
         return _round(em*h, 3);
      }
      return 0;
   }

   function _percentToPx(h, perc) {
      return _round(h*perc/100, 3);
   }

   function _percentToEm(ph, perc) {
      return _pxToEm(ph, ph*perc/100);
   }

   function _pxToPercent(h, px) {
      return _round(px/h*100);
   }

   function _emToPercent(h, em) {
      return _pxToPercent(h, _emToPx(h, em));
   }

   function _round(number, decimals) {
      if( !decimals ) { decimals = 0; }
      return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
   }

   $.UnitConverter = Converter;
})();

