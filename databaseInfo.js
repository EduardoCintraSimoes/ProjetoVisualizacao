class QualityInfo {
	constructor(element, histograms) {
		this.qaDefault = element.qaDefault;
		this.qaDPI = +element.qaDPI;
		this.qaDensity = +element.qaDensity * 100;
		this.qaInclination = +element.qaInclination;
		this.qaLightness = +element.qaLightness * 100;
		this.qaShadow = +element.qaShadow * 100;
		this.qaFocus = +element.qaFocus * 100;
		this.qaShine = +element.qaShine * 100;
		
		this.updatePosHist(1, 0);
	}
	getResult() {
		let order = 1;
		let nameValue = "";
		let colorValue = "#dd0000";
		
		if (!(this.qaDefault === "OK")) {
			nameValue = this.qaDefault;
			order = 2;
			colorValue = "#dddddd";
		}
		else if (this.qaDPI < getSliderValue("qaDpi")){
			nameValue = "Resolução (DPI)";
		}
		else if (this.qaDensity < getSliderValue("qaDensity")){
			nameValue = "Densidade";
		}
		else if (this.qaInclination > getSliderValue("qaInclination")){
			nameValue = "Inclinação";
		}
		else if (this.qaLightness < getSliderValue("qaLightness")){
			nameValue = "Iluminação";
		}
		else if (this.qaShadow < getSliderValue("qaShadow")){
			nameValue = "Sombra";
		}
		else if (this.qaFocus < getSliderValue("qaFocus")){
			nameValue = "Foco";
		}
		else if (this.qaShine < getSliderValue("qaShine")){
			nameValue = "Brilho";
		}
		else {
			order = 0;
			nameValue = "OK";
			colorValue = "#00dd00";
		}
		
		return [order, nameValue, colorValue];
	}
	
	updatePosHist(posQtd, negQtd) {
		incrementHistogram("qaDpi", this.qaDPI, posQtd, negQtd);
		incrementHistogram("qaDensity", this.qaDensity, posQtd, negQtd);
		incrementHistogram("qaInclination", this.qaInclination, posQtd, negQtd);
		incrementHistogram("qaLightness", this.qaLightness, posQtd, negQtd);
		incrementHistogram("qaShadow", this.qaShadow, posQtd, negQtd);
		incrementHistogram("qaFocus", this.qaFocus, posQtd, negQtd);
		incrementHistogram("qaShine", this.qaShine, posQtd, negQtd);
	}
}

class ClassificationInfo {
	constructor(element) {
		this.classification = element.classification;
		this.confidence = +element.classificationConf * 100;
		
		this.updatePosHist(1, 0);
	}
	getResult() {
		let isValid = this.classification === "rg_back";
		if (this.confidence >= getSliderValue("classifConf")){
			return [isValid ? 0 : 1, this.classification, isValid ? "#00dd00" : "#dd0000"];
		}
		else {
			return [isValid ? 2 : 3, "Desconhecido", "#dddd00"];
		}
	}
	
	updatePosHist(posQtd, negQtd) {
		incrementHistogram("classifConf", this.confidence, posQtd, negQtd);
	}
}

class ExtractionInfo {
	constructor(name, text, sim, conf) {
		this.name = name;
		this.text = text;
		this.similarity = +sim;
		this.confidence = +conf;
		
		this.updatePosHist(1, 0);
	}
	
	getResult() {
	
		let order = undefined;
		let nameValue = undefined;
		let colorValue =  undefined;
	
		let realStatus = this.similarity >= getSliderValue(this.name + "Sim");
		let predictedStatus = this.confidence >= getSliderValue(this.name + "Conf");
		
		if (predictedStatus) {
			if (realStatus) {
				nameValue = "TP";
				colorValue = "#00dd00";
				order = 0;
			}
			else {
				nameValue = "FP";
				colorValue =  "#dd0000";
				order = 3;
			}
		}
		else {
			if (realStatus) {
				nameValue = "FN";
				colorValue = "#dddd00";
				order = 2;
			}
			else {
				nameValue = "TN";
				colorValue = "#2222dd";
				order = 1;
			}
		}
		return [order, nameValue, colorValue];
	}
	
	updatePosHist(posQtd, negQtd) {
		incrementHistogram(this.name + "Sim", this.similarity, posQtd, negQtd);
		incrementHistogram(this.name + "Conf", this.confidence, posQtd, negQtd);
	}
}
		
class ElementInfo {
	constructor(procError, qaInfo, classInfo, extractInfo) {
		this.procError = +procError;
		this.qaInfo = qaInfo;
		this.classInfo = classInfo;
		this.extractInfo = extractInfo;
	}
	
	updateMap() {
		let qtd = this.extractInfo.length;
	
		// preprocessamento
		let processName = this.procError == 1 ? "1_Error" : "1_OK";
		let validProcess = processName === "1_OK";
		
		incrementSankeyData("0_Base", processName, qtd, validProcess ? 0 : 1, validProcess ? "#00dd00" : "#dd0000" )
		
		mapNodes.get("0_Base").qtd += qtd;
		
		if(validProcess) {
			
			// qualidade
			let res = this.qaInfo.getResult();
			let qaName = "2_" + res[1];
			incrementSankeyData(processName, qaName, qtd, res[0], res[2]);
			var isValid = res[0] == 0;
			
			// classificação
			res = this.classInfo.getResult();
			var className = "3_" + res[1];
			let validRealClass = res[0] == 0 || res[0] == 2;
			let validClassif = res[0] == 0;
			
			if(isValid) {
				// conecta qualidade -> classificação
				incrementSankeyData(qaName, className, qtd, res[0], res[2]);
				isValid = validClassif;
				
				// atualiza o histograma da classificação
				this.classInfo.updatePosHist(validRealClass ? 1 : 0, validRealClass ? 0 : 1);
			}
			
			var posQtd = 0;
			var negQtd = 0;
			this.extractInfo.forEach(d => {
				
				res = d.getResult();
				let posVal = (res[0] == 0 || res[0] == 2) ? 1 : 0; // Classe real = TP | FN
				let negVal = 1 - posVal; // complemento
				posQtd += posVal;
				negQtd += negVal;
				
				if(isValid) {
					// campos
					let extractName = "4_" + d.text;
					incrementSankeyData(className, extractName, 1, 0, "#aaaaaa");
					
					// extração
					incrementSankeyData(extractName, "5_" + res[1], 1, res[0], res[2]);
					d.updatePosHist(posVal, negVal);
				}
			});
			
			if(!validRealClass) {
				// classe errada = errar todos os campos
				negQtd += posQtd;
				posQtd = 0;
			}
			// atualiza os histogramas de qualidade levando em consideração o número de campos corretos
			this.qaInfo.updatePosHist(posQtd, negQtd);
		}
	}
}

function loadDataset(data) {
	dataset = [];

	data.forEach(function(element) {
		let qaInfo = new QualityInfo(element, histograms);
		let classInfo = new ClassificationInfo(element);
	
		let extractionList = [
			new ExtractionInfo("DATA_EXPEDICAO", "Data de Expedição", element.DATA_EXPEDICAOSim, element.DATA_EXPEDICAOSim),
			new ExtractionInfo("DATA_NASCIMENTO", "Data de Nascimento", element.DATA_NASCIMENTOSim, element.DATA_NASCIMENTOConf),
			new ExtractionInfo("FILIACAO_A", "Filiação A", element.FILIACAO_ASim, element.FILIACAO_AConf),
			new ExtractionInfo("FILIACAO_B", "Filiação B", element.FILIACAO_BSim, element.FILIACAO_BConf),
			new ExtractionInfo("NATURALIDADE", "Naturalidade", element.NATURALIDADESim, element.NATURALIDADEConf),
			new ExtractionInfo("NOME", "Nome", element.NOMESim, element.NOMEConf),
			new ExtractionInfo("NUM_RG", "Registro Geral", element.NUM_RGSim, element.NUM_RGConf)];
	
		if(element.NUM_CPFSim < 100 || element.NUM_CPFConf > 0)	{
			// tratamento para documentos que não possuem CPF
			extractionList.push(new ExtractionInfo("NUM_CPF", "CPF", element.NUM_CPFSim, element.NUM_CPFConf));
		}
		
		dataset.push(new ElementInfo(element.processError, qaInfo, classInfo, extractionList));
			
	});
	return dataset;
}

function incrementSankeyData(leftName, rightName, qtd, orderLvl, colorVal) {
	if (!mapNodes.has(leftName)) mapNodes.set(leftName, { name: leftName, color: "#aaaaaa", order: 0, qtd: 0, qtd: 0  });
	if (!mapNodes.has(rightName)) mapNodes.set(rightName, { name: rightName, color: colorVal, order: orderLvl, qtd: 0 });
	
	// incrementa quantidade de elementos entrando
	mapNodes.get(rightName).qtd += qtd;
	
	let tag = leftName + "_" + rightName;
	if(!mapLinks.has(tag)) {
		mapLinks.set(tag, {source: leftName, target: rightName, value: qtd});
	}
	else {
		mapLinks.get(tag).value += qtd;
	}
}

function incrementHistogram(name, value, posQtd, negQtd) {
	if (!histograms.has(name)) {
		histograms.set(name, new Map());
	}
	var hist = histograms.get(name);

	if (!hist.has(value)) {
		hist.set(value, {val: value, pos: posQtd, neg: negQtd});
	}
	else{
		var histVal = hist.get(value);
		histVal.pos += posQtd;
		histVal.neg += negQtd;
	}
}

function clearHistogram() {
	histograms = new Map();
}
