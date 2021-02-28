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
		
		incrementHistogram("qaDpi", this.qaDPI);
		incrementHistogram("qaDensity", this.qaDensity);
		incrementHistogram("qaInclination", this.qaInclination);
		incrementHistogram("qaLightness", this.qaLightness);
		incrementHistogram("qaShadow", this.qaShadow);
		incrementHistogram("qaFocus", this.qaFocus);
		incrementHistogram("qaShine", this.qaShine);
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
}

class ClassificationInfo {
	constructor(element) {
		this.classification = element.classification;
		this.confidence = +element.classificationConf * 100;
		incrementHistogram("classifConf", this.confidence);
	}
	getResult() {
		if (this.confidence >= getSliderValue("classifConf")){
			let isValid = this.classification === "rg_back";
			return [isValid ? 0 : 1, this.classification, isValid ? "#00dd00" : "#dd0000"];
		}
		else {
			return [2, "Desconhecido", "#dddd00"];
		}
	}
}

class ExtractionInfo {
	constructor(name, text, sim, conf) {
		this.name = name;
		this.text = text;
		this.similarity = +sim;
		this.confidence = +conf;
		
		incrementHistogram(this.name + "Sim", this.similarity);
		incrementHistogram(this.name + "Conf", this.confidence);
	}
	getResult() {
	
		let order = undefined;
		let nameValue = undefined;
		let colorValue =  undefined;
	
		let realStatus = this.confidence >= getSliderValue(this.name + "Sim");
		let predictedStatus = this.similarity >= getSliderValue(this.name + "Conf");
		
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
			if(res[0] == 0) {
			
				// classificação
				res = this.classInfo.getResult();
				let className = "3_" + res[1];
				incrementSankeyData(qaName, className, qtd, res[0], res[2]);
				if(res[0] == 0) {

					this.extractInfo.forEach(d => {
						// campos
						let extractName = "4_" + d.text;
						incrementSankeyData(className, extractName, 1, 0, "#aaaaaa");
						
						// extração
						res = d.getResult();
						incrementSankeyData(extractName, "5_" + res[1], 1, res[0], res[2]);
					});
				}
			}
		}
	}
}

function loadDataset(data) {
	dataset = [];

	data.forEach(function(element){
		let qaInfo = new QualityInfo(element, histograms);
		let classInfo = new ClassificationInfo(element);
	
		dataset.push(new ElementInfo(element.processError, qaInfo, classInfo, [
			new ExtractionInfo("DATA_EXPEDICAO", "Data de Expedição", element.DATA_EXPEDICAOSim, element.DATA_EXPEDICAOSim),
			new ExtractionInfo("DATA_NASCIMENTO", "Data de Nascimento", element.DATA_NASCIMENTOSim, element.DATA_NASCIMENTOConf),
			new ExtractionInfo("FILIACAO_A", "Filiação A", element.FILIACAO_ASim, element.FILIACAO_AConf),
			new ExtractionInfo("FILIACAO_B", "Filiação B", element.FILIACAO_BSim, element.FILIACAO_BConf),
			new ExtractionInfo("NATURALIDADE", "Naturalidade", element.NATURALIDADESim, element.NATURALIDADEConf),
			new ExtractionInfo("NOME", "Nome", element.NOMESim, element.NOMEConf),
			new ExtractionInfo("NUM_CPF", "CPF", element.NUM_CPFSim, element.NUM_CPFConf),
			new ExtractionInfo("NUM_RG", "Registro Geral", element.NUM_RGSim, element.NUM_RGConf)]));
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

function incrementHistogram(name, value) {
	if (!histograms.has(name)) {
		histograms.set(name, []);
	}
	histograms.get(name).push(value);
}
