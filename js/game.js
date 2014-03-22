// helper random function
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function(){
	// the color taken by new numbers
	var bg_r = 0;
	var bg_g = 120;
	var bg_b = 255;
	
	// control vars for color change
	var r_inc = true;
	var g_inc = true;
	var b_inc = false;
	
	// colors of the tiles
	var nextColor = "rgba(255,255,255,0.1)";
	var nextShadow = "2px 2px 6px 0px #000";
	var activeColor = nextColor;//"rgba(255,255,200,0.3)";
	var activeShadow = "inset 2px 2px 6px 0px #000";
	var fillShadow = "2px 2px 6px 0px #000";
	
	var $cells = $('.grid-cell'); 								//the cells of the game
	var bg_original = $($cells[0]).css('background-color');		//the original bg color of the cells
	var shadow_original = $($cells[0]).css('box-shadow');		//the original shadow of the cells
	var no_shadow = '0 0 0 0 #444';				//the shadow of the filled cells (no shadow)
	var cnt = 0;															//the current number
	var curx = randInt(1,10);									//the x coord of the current number
	var cury = randInt(1,10);									//the y coord of the current number
	var activex = 0;
	var activey = 0;
	var lastaction = '';
	var keyboard = new MyKeyboard();
	var prevcell;
	
	//all the coords of the next step, relative to the cursor
	var nextCoords = [
		[0,3],
		[2,2],
		[3,0],
		[2,-2],
		[0,-3],
		[-2,-2],
		[-3,0],
		[-2,2]
	]

	// Increment the counters
	function incrementCounters(){
		if(bg_r > 250)
			r_inc = false;
		if (bg_r < 5)
			r_inc = true;
		if(bg_g > 250)
			g_inc = false;
		if (bg_g < 5)
			g_inc = true;
		if(bg_b > 250)
			b_inc = false;
		if (bg_b < 5)
			b_inc = true;
		if (r_inc)
			bg_r += 5;
		else
			bg_r -= 5;
		if (g_inc)
			bg_g += 5;
		else
			bg_g -= 5;
		if (b_inc)
			bg_b += 5;
		else
			bg_b -= 5;
		cnt += 1;
	}
	
	// Set the new number
	function setNumber($curcell){
		if(cnt > 0){
			changeCellColor(prevcell, 'rgba(' + bg_r + ',' + bg_g + ',' + bg_b + ',0.5)', no_shadow, false, true);
		}
		incrementCounters();
		var newColor = 'rgba(' + bg_r + ',' + bg_g + ',' + bg_b + ',0.5)';
		$curcell.animate({boxShadow: no_shadow, backgroundColor: newColor}, 150, 'linear', function(){
			$(this).css('box-shadow', 'outset 0 0 0 0 #000').animate({boxShadow: nextShadow}, 150, 'linear');
		});
		$curcell.text(cnt);
		$curcell.attr('data-filled', 'true');
		$('#score').text(cnt);
		var scoreColor = 'rgba(' + bg_r + ',' + bg_g + ',' + bg_b + ',1)';
		$('#score').animate({color: scoreColor});
		if (parseInt($('#best').text()) < cnt) {
			$('#best').text(cnt);
			$('#best').animate({color: scoreColor});
			$.cookie('best', $('#best').text(), {expires: 4000});
			$.cookie('best-color', scoreColor, {expires: 4000});
		};
		prevcell = $curcell;
		if(cnt >= 100)
			$('#win-modal').modal();
	}
	
	// Check if a given cell is already filled
	function isFilled($cell)
	{
		return ($cell.attr('data-filled') == 'true');
	}
	
	// Get the cell with the given coords
	function getCell(x,y){
		return $('.grid-cell[data-coord="' + y + '-' + x + '"]');
	}
	
	// Set the next candidate cells
	function setNext($curcell){
		var nextNum = 0;
		nextCoords.forEach(function(entry){
			var x = entry[1] + curx;
			var y = entry[0] + cury;
			if(x >= 1 && x <= 10 && y >= 1 && y <= 10){
				var $nextcell = getCell(x,y);
				if(changeCellColor($nextcell, nextColor, nextShadow))
					nextNum += 1;
			}
		});
		if(nextNum == 0){
			$('#game-over-score').text($('#score').text());
			$('#game-over-modal').modal();
		}
	}
	
	// Highlight a cell as active, because the user is pointing at it
	function setActive(actx, acty){
		nextCoords.forEach(function(entry){
			var x = entry[1] + curx;
			var y = entry[0] + cury;
			unsetActive(x, y);
		});
		if(actx >= 1 && actx <= 10 && acty >= 1 && acty <= 10){
			var $actcell = getCell(actx, acty);
			changeCellColor($actcell, activeColor, activeShadow, true);
			activex = actx;
			activey = acty;
		}
	}
	
	// Restore the active cell to its previous state
	function unsetActive(actx, acty){
		if(actx >= 1 && actx <= 10 && acty >= 1 && acty <= 10)
		{
			var $actcell = getCell(actx, acty);
			changeCellColor($actcell, nextColor, nextShadow, true);
		}
	}
	
	// Reset a cell to its initial color, if it has not been filled yet
	function resetIfEmpty(actx, acty){
		if(actx >= 1 && actx <= 10 && acty >= 1 && acty <= 10)
		{
			var $actcell = getCell(actx, acty);
			changeCellColor($actcell, bg_original, shadow_original);
		}
	}
	
	// Change the color of a cell, performing an animation if necessary
	function changeCellColor(cell, color, shadow, no_animate, force){
		if(!isFilled(cell) || force)
		{
			if(no_animate)
			{
				cell.css('background-color', color);
				cell.css('box-shadow', shadow);
			}
			else
			{
				cell.animate({backgroundColor: color}, 100);
				cell.animate({boxShadow: shadow}, 200);
			}
			return true;
		}
		else
			return false;
	}
	
	// Updates the game state
	function update(){
		if(lastaction == keyboard.action)
			return;
		switch(keyboard.action){
			case 'left':
				setActive(curx - 3, cury);			
				break;
			case 'leftup':
				setActive(curx - 2, cury - 2);
				break;
			case 'up':
				setActive(curx, cury - 3);
				break;
			case 'upright':
				setActive(curx + 2, cury - 2);
				break;
			case 'right':
				setActive(curx + 3, cury);
				break;
			case 'rightdown':
				setActive(curx + 2, cury + 2);
				break;
			case 'down':
				setActive(curx, cury + 3);
				break;
			case 'downleft':
				setActive(curx - 2, cury + 2);
				break;
			case 'setNext':
				var $actcell = getCell(activex, activey);
				if($actcell && !isFilled($actcell) && (activex != curx || activey != cury))
				{
					var oldx = curx;
					var oldy = cury;
					curx = activex;
					cury = activey;
					setCur();
					nextCoords.forEach(function(entry){
						var x = entry[1] + oldx;
						var y = entry[0] + oldy;
						resetIfEmpty(x, y);
					});
				}
				break;
			default:
				break;
		}
		lastaction = keyboard.action;
	}
	
	// Set the current cell, writing inside the current number
	function setCur(){
		var $curcell = $('.grid-cell[data-coord="' + cury + '-' + curx + '"]');
		setNumber($curcell);
		setNext($curcell);
	}
	
	// key event binding
	$(window).keydown(function(e){
		keyboard.update(e,true)
	});
	$(window).keyup(function(e){
		keyboard.update(e,false)
	});
	
	// First loop execution: Set the best score
	if($.cookie('best'))
	{
		$('#best').text($.cookie('best'));
		if($.cookie('best-color'))
			$('#best').animate({color: $.cookie('best-color')});
	}

	$("#how-to-button").click(function(){
		$('#instructions-modal').modal();
	});

	$("#restart-button").click(function(){
		alert('this button is under construction! to restart the game refresh the page.')
	});

	// First loop execution: Set the current cell
	setCur();
	
	// First loop execution: bind the keyboard update event to the game update function
	keyboard.onUpdate(update);
});