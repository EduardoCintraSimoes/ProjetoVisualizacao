var toolTip = undefined;

var toolTipWidth = 400;
var toolTipHeight = 120;

function createToolTip(){
	toolTip = svg.append("g")
		.attr("font-size", 20);

	toolTip.append("rect")
		.attr("width", toolTipWidth)
		.attr("height", toolTipHeight)
		.attr("fill", "white")
		.attr("stroke", "black");

	toolTip.append("text")
		.attr("x", 200)
		.attr("y", 25)
		.style("text-anchor", "middle")
		.attr("id", "tooltipText")
		.text("Field Name");

	toolTip.append("text")
		.attr("x", 7)
		.attr("y", 50)
		.text("Proporção do elemento:");

	toolTip.append("text")
		.attr("x", 20)
		.attr("y", 80)
		.attr("id", "tooltipBase")
		.text("Base: 0%");

	toolTip.append("text")
		.attr("x", 20)
		.attr("y", 110)
		.attr("id", "tooltipParent")
		.text("Parente: 0%");
}

function showToolTip(d, i) {
	var coordinates = d3.pointer(d);
	var x = (i.x1 < width/2) ? i.x1 : (i.x0 - toolTipWidth);
	var y = Math.round(coordinates[1]);
	
	if(y > (height - toolTipHeight - 20)) {
		y -= toolTipHeight;
	}

	let qtd = i.qtd;
	let parentSize = getParentSize(i.name);
	let numElements = mapNodes.get("0_Base").qtd;

	toolTip.select("#tooltipText").text(getName(i));
	toolTip.select("#tooltipBase").text("Base: " + (100 * qtd / numElements).toFixed(2) + "%");
	toolTip.select("#tooltipParent").text(parentSize > 0 ? ("Parente: " + (100 * qtd / parentSize).toFixed(2) + "%") : "");

	toolTip
        .attr("transform", "translate(" + x + "," + y + ")")
		.attr("visibility", "visibility");
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

function hideToolTip() {
	toolTip.attr("visibility", "hidden");
}