// Keyboard object. Manage the keyboard input of the game
function MyKeyboard(){
  
  // The keys
  this.keys = {
    
    // left key
    left: {
      state: 'up',
      timestamp: 0
    },
    
    // right key
    right: {
      state: 'up',
      timestamp: 0
    },
    
    // up key
    up: {
      state: 'up',
      timestamp: 0
    },
    
    // down key
    down: {
      state: 'up',
      timestamp: 0
    }
  }
  
  // the current action detected by the keyboard
  this.action = '';
  
  // The default callback on keyboard update
  this.onUpdateCallback = function(){};
  
  // The time (in ms) before a released key is set as up
  this.releaseTime = 500;
}

// Bind the update event of the keyboard to a callback
MyKeyboard.prototype.onUpdate = function(callback){
  this.onUpdateCallback = callback;
}

// Set the new state of a key
MyKeyboard.prototype.setKeyState = function(key, state, timestamp){
  var keyset = false;
  $.each(this.keys, function(key, value) {
    if(timestamp - value['timestamp'] > this.releaseTime)
    {
      value['state'] = 'up';
      keyset = true;
    }
  });
  switch(state)
  {
    case 'down':
      if(!this.keys[key].state != 'down')
      {
        this.keys[key].state = state;
        keyset = true;
      }
      break;
    case 'released':
      if(this.keys[key].state == 'down'){
        $.each(this.keys, function(key, value) {
          if(value['state'] == 'released')
            value['state'] = 'up';
        });
        this.keys[key].state = state;
        this.keys[key].timestamp = timestamp;
        keyset = true;
      }
      break;
    default:
      break;
  }
  return keyset;
}

MyKeyboard.prototype.updateAction = function(timestamp){
  var downkeys = [];
  var relkey = '';
  $.each(this.keys, function(key, value) {
    switch(value['state']){
      case 'released':
        relkey = key;
        break;
      case 'down':
        downkeys.push(key);
        break;
    }
  });
  if(downkeys.length == 0){
    this.action = 'setNext';
    $.each(this.keys, function(key, value) {
      value['state'] = 'up';
    });
  }
  else{
    if(downkeys.length == 1){
      if(relkey != ''){
        downkeys.push(relkey);
      }
    }
    if(downkeys.indexOf('left') != -1)
      if (downkeys.indexOf('up') != -1)
        this.action = 'leftup';
      else if (downkeys.indexOf('down') != -1)
        this.action = 'downleft';
      else
        this.action = 'left';
    else if (downkeys.indexOf('up') != -1)
      if (downkeys.indexOf('right') != -1)
        this.action = 'upright';
      else
        this.action = 'up';
    else if (downkeys.indexOf('right') != -1)
      if (downkeys.indexOf('down') != -1)
        this.action = 'rightdown';
      else
        this.action = 'right';
    else if (downkeys.indexOf('down') != -1)
      this.action = 'down';
  }
}

// Update the keyboard
MyKeyboard.prototype.update = function(e, down){
  var willUpdate = false;
  var state = down ? 'down' : 'released';
  switch(e.which){
    //left
    case 37:
      willUpdate = this.setKeyState('left', state, e.timestamp);
      break;
    //up
    case 38:
      willUpdate = this.setKeyState('up', state, e.timestamp);
      break;
    //right
    case 39:
      willUpdate = this.setKeyState('right', state, e.timestamp);
      break;
    //down
    case 40:
      willUpdate = this.setKeyState('down', state, e.timestamp);
      break;
    default:
      break;
  }
  if(willUpdate){
    e.preventDefault();
    this.updateAction(e.timestamp);
    this.onUpdateCallback();
    this.action = '';
  }
}