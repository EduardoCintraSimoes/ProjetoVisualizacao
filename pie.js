var pieGroup = undefined;
var pie = undefined;
var arc = undefined;
var textArc = undefined;
var lineArc = undefined;
var radius = undefined;

var pieSlices = undefined;
var pieLabels = undefined;
var pieLines = undefined;

function initPie(toolTip, pieHeight, pieWidth, x1, y1) {
	pieGroup = toolTip.append("g");
	
	pieSlices = pieGroup.append("g");
	pieLabels = pieGroup.append("g")
		.attr("font-size", 14);
	pieLines = pieGroup.append("g");

	pieAreaHeight = pieHeight;

	radius = Math.min(pieWidth, pieHeight) / 2;

	pie = d3.pie()
		//.sort(orderNodes)
		.sort(null)
		.value(d => d.value);

	arc = d3.arc()
		.outerRadius(radius * 0.9)
		.innerRadius(radius * 0.0);

	textArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	lineArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.6);

	pieGroup.attr("transform", "translate(" + (x1 + pieWidth / 2) + "," + (y1 + pieHeight / 2) + ")");
}

var key = d => d.data.name;

function changePie(data) {

	var pieData = pie(data);

	/* ------- PIE SLICES -------*/
	pieSlices
		.selectAll("path")
		.data(pieData)
		.join("path")
			.attr("fill", d => d.data.color)
			.attr("d", arc)
		.append("title")
			.text(d => d.data.name + ": " + d.data.value);

	/* ------- TEXT LABELS -------*/

	var total = pieData.reduce(getSum, 0);

    var tag_text = 0;
    var tag_line = 0;
    var text_move_ratio = 14;
	
	var limitAngle = 20 * Math.PI / 180;
	
	var labelInfo = getLabelInfo(pieData);
	
	pieLabels
		.selectAll("text")
        .data(pieData, key)
			.join("text")
				.text(d => d.data.name + ": " + (100 * d.data.value / total).toFixed(1) + "%")
				.style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
				.style('alignment-baseline', "middle")
				.attr('transform', function(d, i) {
					var info = labelInfo.get(d.data.name);
					
					//If the slice angle < 5, then change the text position to avoid label overlap
					return 'translate(' + [info.x, info.y] +')';
				});

	/* ------- SLICE TO TEXT POLYLINES -------*/

    tag_line = 0;
	pieLines
		.selectAll("polyline")
		.data(pieData, key)
		.join("polyline")
			.attr("stroke", "black")
			.attr("fill-opacity","0")
			.attr("points", function(d){
				var info = labelInfo.get(d.data.name);

				return [lineArc.centroid(d), [info.x * 0.8, info.y], [info.x * 0.95, info.y]];

			});
}

function getLabelInfo(pieData) {
    var text_move_ratio = 14;

	var leftPos = +radius;
	var rightPos = -radius;
	var infoList = [];
	
	pieData.forEach(d => {
		var angle = midAngle(d);
		var y = textArc.centroid(d)[1];
		var x = 1.2 * radius;
		if(angle < Math.PI) {
			// right
			y = Math.max(y, rightPos);
			rightPos = y + text_move_ratio;
			
		}
		else {
			// left
			y = Math.min(y, leftPos);
			leftPos = y - text_move_ratio;
			x = -x;
		}
		infoList.push({name: d.data.name, x: x, y: y });
	});
	
	// ajusta invertido
	infoList = infoList.reverse();
	leftPos = -radius;
	rightPos = +radius;
	infoList.forEach(d => {
		if(d.x > 0) {
			// right
			d.y =  Math.min(d.y, rightPos);
			rightPos = d.y - text_move_ratio;
		}
		else {
			// left
			d.y = Math.max(d.y, leftPos);
			leftPos = d.y + text_move_ratio;
		}
	});
	
	// retorna o mapa
	var labelInfo = new Map();
	infoList.forEach(d => {
		labelInfo.set(d.name, {x: d.x, y: d.y});
	});
	return labelInfo;
}

function getSum(total, d) {
  return total + d.data.value;
}

function midAngle(d){
	return d.startAngle + (d.endAngle - d.startAngle)/2;
}
