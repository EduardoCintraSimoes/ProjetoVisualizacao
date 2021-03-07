var toolTip = undefined;
var pie = undefined;

var toolTipTextWidth = 500;
var toolTipTextHeight = 70;

var toolTipPieWidth = 500;
var toolTipPieHeight = 150;

//var pieY1 = 100;
//var pieX1 = toolTipTextWidth;
//var toolTipWidth = pieX1 +toolTipPieWidth;
//var toolTipHeight = Math.max(toolTipTextHeight, pieY1 + toolTipPieHeight);

var pieY1 = toolTipTextHeight;
var pieX1 = 0;
var toolTipWidth = Math.max(toolTipTextWidth, pieX1 + toolTipPieWidth);
var toolTipHeight = pieY1 + toolTipPieHeight + 5;

function createToolTip() {
	toolTip = svg.append("g")
		.attr("font-size", 20);

	toolTip.append("rect")
		.attr("id", "tooltipBg")
		.attr("width", toolTipWidth)
		.attr("height", toolTipHeight)
		.attr("fill", "white")
		.attr("stroke", "black");

	toolTip.append("text")
		.attr("x", toolTipPieWidth / 2)
		.attr("y", 25)
		.style("text-anchor", "middle")
		.attr("id", "tooltipText")
		.text("Field Name");

	toolTip.append("text")
		.attr("x", 20)
		.attr("y", 50)
		.text("Proporção do elemento:");

	toolTip.append("text")
		.attr("x", 240)
		.attr("y", 50)
		.attr("id", "tooltipBase")
		.text("Base: 00.0%");

	toolTip.append("text")
		.attr("x", 360)
		.attr("y", 50)
		.attr("id", "tooltipParent")
		.text("Parente: 00.0%");
	
	initPie(toolTip, toolTipPieHeight, toolTipPieWidth, pieX1, pieY1);

	hideToolTip();
}

function showToolTip(d, i) {
	
	moveToolTip(d, i);
	
	let qtd = i.qtd;
	let parentSize = getParentSize(i.name);
	let numElements = mapNodes.get("0_Base").qtd;

	toolTip.select("#tooltipText").text(getName(i));
	toolTip.select("#tooltipBase").text("Base: " + (100 * qtd / numElements).toFixed(1) + "%");
	toolTip.select("#tooltipParent").text(parentSize > 0 ? ("Parente: " + (100 * qtd / parentSize).toFixed(1) + "%") : "");

	var data = getDivision(i.name);
	changePie(data);
	
	toolTip.select("#tooltipBg")
		.attr("height", data.length > 0 ? toolTipHeight : toolTipTextHeight);

	toolTip
		.attr("visibility", "visibility");
}

function moveToolTip(d, i) {
	var coordinates = d3.pointer(d);
	var x = (i.x1 < sankeyBox.width / 2) ? i.x1 : (i.x0 - toolTipWidth);
	var y = Math.round(coordinates[1]);
	
	var toolHeight = +toolTip.select("#tooltipBg").attr("height");
	if(y > (sankeyBox.height - toolHeight - 20)) {
		y -= toolHeight;
	}

	toolTip
        .attr("transform", "translate(" + x + "," + y + ")");
}

function getParentSize(fieldName) {
	var qtd = 0;
	mapLinks.forEach(d => {
		if(d.target === fieldName) {
			qtd += mapNodes.get(d.source).qtd;
		}
	});
	return qtd;
}

function getDivision(fieldName) {
	var data = [];
	mapLinks.forEach(d => {
		if(d.source === fieldName) {
			let targetNode = mapNodes.get(d.target);
			data.push({ name: getName(targetNode), color: targetNode.color, value: d.value, order: targetNode.order  });
		}
	});
	return data;
}

function hideToolTip() {
	toolTip.attr("visibility", "hidden");
}