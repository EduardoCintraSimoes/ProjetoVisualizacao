
// mapa dos valores para otimizar o getSliderValue
var slidersValues = new Map();

function setExtractionSlider(newGroup, name, text) {
	newGroup.text(text); // título
	newGroup.append("br");
	setSlider( newGroup, name + "Conf", "Confiança", 0, 100, 70); // confiança
	newGroup.append("br");
	setSlider( newGroup, name + "Sim", "Similaridade", 0, 100, 90); // similaridade
}

function setSlider(newGroup, name, text, minVal, maxVal, defaultVal, step = 1, invHist = false, color = "#0074ff") {
	
	slidersValues.set(name, defaultVal);
	
	var margin = {top: 25, right: 10, bottom: 20, middle: 10, left: 10};
	var textShift = {top: 5, left: 5};
	var controlWidth = 120;
	
	var histBox = {top: margin.top, left: margin.left, width: controlWidth, height: 40};
	var sliderBox = {top: histBox.top + histBox.height + margin.middle, left: margin.left, width: controlWidth, height: 20};
	
	var controlSvg = newGroup.append("svg")
		.attr("width", margin.left + controlWidth + margin.right)
		.attr("height", sliderBox.top + sliderBox.height + margin.bottom );
		
	// texto
	var titleTxt = controlSvg.append("text")
			.attr("text-anchor", "start")
			.attr("alignment-baseline", "before-edge")
			.attr("transform", "translate(" + textShift.left + "," + textShift.top + ")")
			.text(text + ": ");
	var labelTxt = controlSvg.append("text")
			.attr("text-anchor", "start")
			.attr("alignment-baseline", "before-edge")
			.attr("transform", "translate(" + (textShift.left + titleTxt._groups[0][0].clientWidth) + "," + textShift.top + ")")
			.text(defaultVal);
			
	// Histograma
	var histSvg = addHist(name, minVal, maxVal, controlSvg, histBox);
	
	// Slider
	addSlider(name, minVal, maxVal, defaultVal, step, invHist, color, controlSvg, sliderBox, labelTxt, histSvg);
	
	updateHistColor(histSvg, invHist, color, defaultVal);
}

function addHist(name, minVal, maxVal, controlSvg, histBox) {
	
	var data = histograms.get(name);
	
	// X axis: scale and draw:
	var xScale = d3.scaleLinear()
		.domain([minVal, maxVal])
		.range([0, histBox.width]);
	
	var numBins = 20;
	
	// set the parameters for the histogram
	var histogram = d3.histogram()
		//.value(d => d)   // I need to give the vector of value
		.domain(xScale.domain())  // then the domain of the graphic
		.thresholds(xScale.ticks(numBins)); // then the numbers of bins

	// And apply this function to data to get the bins
	var bins = histogram(data);

	var maxHistValue = d3.max(bins, d => d.length);

	// Y axis: scale and draw:
	var yScale = d3.scaleLinear()
		.domain([0, maxHistValue])
		.range([0, histBox.height]);
	
	var histSvg = controlSvg.append("g")
		.attr("transform", "translate(" + histBox.left + "," + histBox.top +")");
	
	var barWidth = histBox.width / numBins;
	var halfBarWidth = barWidth / 2;
	
	// append the bar rectangles to the svg element
	histSvg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", d => xScale(d.x0) - halfBarWidth)
        .attr("y", d => histBox.height - yScale(d.length))
        .attr("width", barWidth )
        .attr("height", d => yScale(d.length) );
		
	return histSvg;
}

function addSlider(name, minVal, maxVal, defaultVal, step, invHist, color, controlSvg, sliderBox, labelTxt, histSvg) {
	
	var stepFormat = undefined;
	if(step < 0.1)
	{
		stepFormat = ".2f";
	}
	else if(step < 1)
	{
		stepFormat = ".1f";
	}
	else
	{
		stepFormat = "d";
	}
	
	// barra
	var slider = d3
		.sliderBottom()
		.min(minVal)
		.max(maxVal)
		.width(sliderBox.width)
		.step(step)
		.tickFormat(d3.format(stepFormat))
		.ticks(5)
		.default(defaultVal)
		.on('onchange', value => {
			slidersValues.set(name, value);
			labelTxt.text(d3.format(stepFormat)(value));
			updateHistColor(histSvg, invHist, color, value);
			drawData();
		})
		;

	controlSvg.append('g')
		.attr('transform', 'translate(' + sliderBox.left + ',' + sliderBox.top + ')')
		.call(slider);
}

function updateHistColor(histSvg, invHist, color, value) {
	
	histSvg.selectAll("rect")
		.style("fill", d => (invHist == (d.x0 < value)) ? color : "#aaaaaa");
}

// retorna o valor da barra
function getSliderValue(name) {
	return slidersValues.get(name);
}
