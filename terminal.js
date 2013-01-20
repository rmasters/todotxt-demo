"use strict";

var Terminal = function() {
    this.lines =  [];
    this.callbacks = {
        'input': [],
        'output': [],
        // Not yet implemented
        'error': [],
        'clear': []
    };
};

Terminal.prototype.input = function(string) {
    this.lines.push(string);
    this.apply_callbacks("input", string);
};

Terminal.prototype.output = function(string) {
    this.lines.push(string);
    this.apply_callbacks("output", string);
};

Terminal.prototype.apply_callbacks = function(type, string) {
    if (Object.keys(this.callbacks).indexOf(type) == -1) {
        throw 'Invalid callback type not in (' + Object.keys(this.callbacks).join(', ') + ').';
    }
    
    for (var i = 0; i < this.callbacks[type].length; i++) {
        var match = this.callbacks[type][i]['pattern'].exec(string);
        
        if (null !== match) {
            var result = this.callbacks[type][i]['callback'](match, this);
            
            if (result > 0) {
                break;
            }
        }
    }
};

Terminal.prototype.register = function(type, callback, pattern, priority) {
    if (Object.keys(this.callbacks).indexOf(type) == -1) {
        throw 'Invalid callback type not in (' + Object.keys(this.callbacks).join(', ') + ').';
    }

    this.callbacks[type].push({
        'callback': callback,
        'pattern': pattern ? pattern : /^(.|\n)*$/,
        'priority': priority ? priority : 1
    });
    
    // Sort callbacks by priority
    var changed;
    do {
        changed = false;
        
        for (var i = 0; i < this.callbacks[type].length-1; i++) {
            if (this.callbacks[type][i].priority < this.callbacks[type][i+1].priority) {
                var tmp = this.callbacks[type][i+1];
                this.callbacks[type][i+1] = this.callbacks[type][i];
                this.callbacks[type][i] = tmp;
                changed = true;
            }
        }
    } while(changed);
};