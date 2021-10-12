
window.onload = function() { 
	var canvas = document.getElementById("canvas");
	var all_paths = new Array();
	var temp_path;

	if (canvas) { 
		let isdown = false; 
		var ctx    = canvas.getContext("2d");
		let canvasx, canvasy; 

		ctx.lineWidth = 1; 
		let i = 0;

		// Continuation function for mouse clicking,
		// on mousedown get the x,y coordinates, move the 
		// context object to that location, then draw lines
		// connecting the path the mouse travels until the 
		// mouseup event fires
		$(canvas).mousedown(function(e) { 
			temp_path = new Array();
			isdown = true; 
			ctx.beginPath(); 
			canvasx = e.pageX - canvas.offsetLeft;
			canvasy = e.pageY - canvas.offsetTop;
			ctx.moveTo(canvasx, canvasy);
		}).mousemove(function(e) { 
			if (isdown) { 
				canvasx = e.pageX - canvas.offsetLeft;
				canvasy = e.pageY - canvas.offsetTop;
				if (i % 2 == 0) { 
					temp_path.push(canvasx, canvasy);
				}
				ctx.lineTo(canvasx, canvasy);
				ctx.strokeStyle = "Black"; 
				ctx.stroke();
				i ++;
			}
		}).mouseup(function(e) { 
			isdown = false;
			ctx.closePath();
			console.log(temp_path);
			all_paths.push(temp_path);
		})
	}

	// Clear the canvas 
	document.getElementById('erase-button').addEventListener('click', function() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  all_paths = new Array();
	}, false);

	// send the base64 encoded image to the server 
	document.getElementById('send').addEventListener('click', function() { 
		console.log(all_paths);
		// let dataURL = canvas.toDataURL();
		let data = JSON.stringify({ value: all_paths});
		$.ajax({
		    type: "POST",
		    contentType: 'application/json',
		    url: "/save",
		    data: data
		}).done(function(o) {
		    document.location.href = '/'
		});
	})
}

