
function setExtractionSlider(newGroup, name, text) {
	newGroup.text(text); // título
	newGroup.append("br");
	setSlider( newGroup, name + "Conf", "Confiança", 0, 100, 70); // confiança
	newGroup.append("br");
	setSlider( newGroup, name + "Sim", "Similaridade", 0, 100, 90); // similaridade
}

function setSlider(newGroup, name, text, minVal, maxVal, defaultVal, step = 1, invHist = false, color = "#0074ff") {
	var sliderTag = name + "Slider";
	var labelTag = name + "Label";
	
	// texto
	newGroup.append("label").text(text + ": ");
	newGroup.append("label").attr("id", labelTag).text(defaultVal);
	newGroup.append("br");
	
	// Histograma
	addHist(newGroup, name, minVal, maxVal);
	newGroup.append("br");
	
	// barra
	newGroup.append("input")
		.attr("id", sliderTag)
		.attr("type", "range")
		.attr("step", step)
		.attr("min", minVal)
		.attr("max", maxVal)
		.attr("value", defaultVal)
		.attr("list", maxVal > 10 ? "tickmarks" : "smallTickmarks");
	
	updateHistColor(name, invHist, color);
	
	//evento de mudança do valor do slider
	d3.select("#" + sliderTag).on("change",function(){
		let aux = getSliderValue(name);
		d3.select("#" + labelTag).text(aux);
		updateHistColor(name, invHist, color);
		drawData();
	});
}

function addHist(newGroup, name, minVal, maxVal) {
	
	var histTag = name + "Hist";
	
	var margin = {top: 10, right: 10, bottom: 10, left: 10};
	
	var histHeight = 40;
	var histWidth = 170;
	
	
	// X axis: scale and draw:
	var xScale = d3.scaleLinear()
		.domain([minVal, maxVal])
		.range([0, histWidth]);
	
	// set the parameters for the histogram
	var histogram = d3.histogram()
		.value(function(d) { return d; })   // I need to give the vector of value
		.domain(xScale.domain())  // then the domain of the graphic
		.thresholds(xScale.ticks(20)); // then the numbers of bins

	// And apply this function to data to get the bins
	var bins = histogram(histograms.get(name));

	// Y axis: scale and draw:
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(bins, function(d) { return d.length; })])
		.range([histHeight, 0]);
	
	var histSvg = newGroup.append("svg")
		.attr("id", histTag)
		.attr("width", histWidth + margin.left + margin.right)
		.attr("height", histHeight + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top +")");
	
  // append the bar rectangles to the svg element
  histSvg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
        .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) ; })
        .attr("height", function(d) { return height - yScale(d.length); })
        .style("fill", "orange");
}

function updateHistColor(name, invHist, color) {
	
	var histTag = name + "Hist";
	// append the bar rectangles to the svg element
	
	var value = getSliderValue(name);
	
	histSvg = d3.select("#" + histTag);
	
	
	histSvg.selectAll("rect")
		.style("fill", function(d){ if(invHist == (d.x0 < value)){return color} else {return "#aaaaaa"}});
}

// retorna o valor da barra
function getSliderValue(name) {
	var sliderTag = name + "Slider";
	return +d3.select("#" + sliderTag).node().value;
}

function incrementSankeyData(leftName, rightName, qtd, orderLvl, colorVal) {
	if (!mapNodes.has(leftName)) mapNodes.set(leftName, { name: leftName, color: "#aaaaaa", order: 0 });
	if (!mapNodes.has(rightName)) mapNodes.set(rightName, { name: rightName, color: colorVal, order: orderLvl });
	
	let tag = leftName + "_" + rightName;
	if(!mapLinks.has(tag)) {
		mapLinks.set(tag, {source: leftName, target: rightName, value: qtd});
	}
	else {
		mapLinks.get(tag).value += qtd;
	}
}
