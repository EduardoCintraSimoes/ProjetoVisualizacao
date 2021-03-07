
// mapa dos valores para otimizar o getSliderValue
var slidersValues = new Map();

function setExtractionSlider(posX, posY, name, text, color) {
	
	var titleTxt = svg.append("text")
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "before-edge")
			.attr("x", (posX + 1) * controlBox.width)
			.attr("y", posY * controlBox.height + 2)
				.attr("font-weight", "bold")
			.text("Extração de " + text);
	
	drawRectangle(posX, posY, 2, 1);
	
	setSlider( posX, posY, name + "Conf", "Confiança", 0, 100, 70, 1, false, color, 14); // confiança
	setSlider( posX + 1, posY, name + "Sim", "Similaridade", 0, 100, 90, 1, false, color, 14); // similaridade
}

function setSlider(posX, posY, name, text, minVal, maxVal, defaultVal, step, invHist, color, topShift = 0) {
	
	slidersValues.set(name, defaultVal);
	
	var shiftControl = {left: posX * controlBox.width,
						top: posY * controlBox.height + topShift}
	
	var textShift = {top: 5, left: 5};
	var controlMargin = {top: 24, left: 20, right: 20, bottom: 5, middle: 8};
	
	var controlWidth = controlBox.width - controlMargin.left - controlMargin.right;
	var controlHeight = controlBox.height - topShift;
	
	var sliderSize = 27;
	
	var sliderBox = {top: controlBox.top + controlHeight - sliderSize - controlMargin.bottom,
			left: controlMargin.left, 
			width: controlWidth,
			height: sliderSize};
	
	var histBox = {top: controlMargin.top, 
			left: controlMargin.left,
			width: controlWidth,
			height: sliderBox.top - controlMargin.middle - controlMargin.top};
		
	if(topShift == 0){
		// não veio do setExtractionSlider, então precisa desenhar a caixa
		drawRectangle(posX, posY, 1, 1);
	}
		
	var controlSvg = svg.append("g")
			.attr("transform", "translate(" + shiftControl.left + "," + shiftControl.top + ")");
		//.attr("width", controlMargin.left + controlWidth + controlMargin.right)
		//.attr("height", sliderBox.top + sliderBox.height + controlMargin.bottom );
	
	// texto
	var titleTxt = controlSvg.append("text")
			.attr("text-anchor", "start")
			.attr("alignment-baseline", "before-edge")
			.attr("x", textShift.left)
			.attr("y", textShift.top)
			.text(text + ": ");
	var labelTxt = controlSvg.append("text")
			.attr("text-anchor", "start")
			.attr("alignment-baseline", "before-edge")
			.attr("x", textShift.left + titleTxt._groups[0][0].clientWidth)
			.attr("y", textShift.top)
			.text(defaultVal);
			
	// Histograma
	var histSvg = addHist(name, minVal, maxVal, controlSvg, histBox);
	
	// Slider
	addSlider(name, minVal, maxVal, defaultVal, step, invHist, color, controlSvg, sliderBox, labelTxt, histSvg);
	
	updateHistColor(histSvg, invHist, color, defaultVal);
}

function drawRectangle(posX, posY, sizeX, sizeY)
{
	svg.append("rect")
		.attr("x", posX * controlBox.width)
		.attr("y", posY * controlBox.height)
		.attr('width', sizeX * controlBox.width)
		.attr('height', sizeY * controlBox.height)
		.attr('fill', "none")
		.attr('stroke', 'black');
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
		.tickPadding(-5)
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
