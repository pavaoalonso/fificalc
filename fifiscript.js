var cont 					= 1;
var valorVenda				= parseFloat(0);
var corretVenda				= parseFloat(0);
var valoresCompras 			= [];
var valoresQuantidades 		= [];
var valoresCorretsCompras 	= [];
var informaCorretagem       = false;

var urlsFrames = [
					'https://br.advfn.com/jornal/',
					'http://www.infomoney.com.br/ultimas-noticias',
					'https://www1.folha.uol.com.br/mercado/',
					'https://br.investing.com/news/latest-news'
				];

$(document).ready(function(){

	atualizaNoticias();

	$("#checkCorretagem").attr("checked",false);

	$("#checkCorretagem").click(function(){
		informaCorretagem = $("#checkCorretagem").is(":checked");
		//alert(informaCorretagem);
	})

	$('.masc').maskMoney({thousands:'.', decimal:',', symbolStay: true});

	$("input").keypress(function(){
		calcula();
	});

	$("input").keyup(function(){
		calcula();
	});

	$("input").keydown(function(){
		calcula();
	});

	$("#botaoInluiCompra").click(function(){
		addLinhaCompra();
	});

	$("#botaoAtualizaNoticias").click(function(){
		atualizaNoticias();
	});

	/*
	$.getJSON("http://developers.agenciaideias.com.br/cotacoes/json", function(data) {
		document.getElementById("indiceIbov").innerHTML = data.bovespa.cotacao+" ("+data.atualizacao+")";
	});

	$.getJSON("http://www.google.com/finance/info?q=INDEXBVMF:IBOV", function(data) {
		alert('teste');
	});
	*/

});

$(function() {
	$( "#tabs" ).tabs();
});

function atualizaNoticias(){

	var index = 0;

	$('iframe').each(function() {
	  $(this).attr( 'src', urlsFrames[index] );
	  index++;
	});
}

function calcula(){

	var valorCompra			= parseFloat(document.getElementById('valorCompra1').value.replace(",","."));
	var valorCorretagem 	= parseFloat(document.getElementById('valorCorretagemCompra1').value.replace(",","."));
	var valorQuantidade 	= parseFloat(document.getElementById('quantAcoes1').value);
	var valorTotalEsperado	= parseFloat(0);
	var lucroEsperado		= parseFloat(0);
	var valorInvestido		= parseFloat(0);

	valorVenda	= parseFloat(document.getElementById('valorVenda').value.replace(",","."));
	corretVenda = parseFloat(document.getElementById('corretVenda').value.replace(",","."));

	valorInvestido = getValorInvestido();
	setInputValue('valorInvestido', valorInvestido);

	valorCorretagem = getCorretagem(valorQuantidade);
	setInputValue('valorCorretagemCompra1', valorCorretagem);

	valorTotalEsperado = getValorVenda();
	setInputValue('valorTotalEsperado', valorTotalEsperado);

	lucroEsperado = valorTotalEsperado - valorInvestido;
	setInputValue('lucroEsperado', lucroEsperado);

	setInputValue('porcentLucroLiqEsperada', getPorcentValorizacao(valorInvestido,valorTotalEsperado));

	setInputValue('quantAcoes', getQuantTotalAcoes());

	preencheArrays();
}

function getValorInvestido(){

	var soma = parseFloat(0);

	for(y=0; y < cont; y++){

		var quant 	= parseFloat( getNotUndefinedValue( getNotUndefinedValue(valoresQuantidades[y]) ));
		var corret 	= parseFloat( getNotUndefinedValue( getNotUndefinedValue(valoresCorretsCompras[y]) ));
		var compra 	= parseFloat( getNotUndefinedValue( getNotUndefinedValue(valoresCompras[y]) ));

		soma += parseFloat(compra) *  parseFloat(quant);
		soma += corret;
	}

	return soma;
}

function getValorVenda(){

	var soma = parseFloat(0);

	for(y=0; y < cont; y++){

		var quant 	= parseFloat( getNotUndefinedValue( valoresQuantidades[y] ) );
		var compra 	= parseFloat( getNotUndefinedValue( valoresCompras[y] ));

		compra = compra != parseFloat(0) ? parseFloat(valorVenda) *  parseFloat(quant) : parseFloat(0);

		soma += compra;

		setInputValue( "valorizacaoAcao"+ parseInt(y+1), getPorcentValorizacao( valoresCompras[y], valorVenda ) );
	}

	soma -= getNotUndefinedValue( corretVenda );

	return soma;
}

function preencheArrays(){

	for(var y = parseInt(0); y < cont; y++){

		try {
			var valorCompra 		= parseFloat(document.getElementById("valorCompra"+ parseInt(y+1)).value.replace(",","."));
			var valorQuantidade 	= parseFloat(document.getElementById("quantAcoes"+ parseInt(y+1)).value.replace(",","."));
			var valorCorretCompra 	= getCorretagem(valorQuantidade);

			valoresCompras[y] 			= getNotUndefinedValue(valorCompra);
			valoresQuantidades[y]		= getNotUndefinedValue(valorQuantidade);
			valoresCorretsCompras[y] 	= getNotUndefinedValue(valorCorretCompra);
			setInputValue("valorCorretagemCompra"+ parseInt(y+1), valorCorretCompra);

		}catch(err){

			valoresCompras[y] 			= parseFloat(0);
			valoresQuantidades[y]		= parseFloat(0);
			valoresCorretsCompras[y] 	= parseFloat(0);
		}
	}
}

function spliceIndexArray(index){

	valoresCompras.splice(index-1,1);
	valoresQuantidades.splice(index-1,1);
	valoresCorretsCompras.splice(index-1,1);
}

function setInputValue(elementId, valor){
	try {
		valor = isNaN(valor) || !isFinite(valor) ? parseFloat(0) : parseFloat(valor.toFixed(2));
		document.getElementById(elementId).value = getNotUndefinedValue(valor);
	}catch(err){}
}

function getPorcentValorizacao(x,y){
	x = parseFloat(x);
	y = parseFloat(y);
	return ((y*100)/x)-100;
}

function getNotUndefinedValue(value){
	return typeof value == "undefined" || isNaN(value) || !isFinite(value) ? parseFloat(0) : value;
}

function getQuantTotalAcoes(){

	var total = parseInt(0);

	for(var y = parseInt(0); y < cont; y++){
		total += getNotUndefinedValue(valoresQuantidades[y]);
	}

	return total;
}

function addLinhaCompra(){

	var newRow = $("<tr>");
	var cols = "";

	cont++;

	cols += "<td class='colEsquerda'> <label style='color:red' for='valorCompra"+cont+"'>Valor Compra</label> </td>";
	cols += "<td> <input id='valorCompra"+cont+"' class='masc' type='text' title='Valor da aĂ§ĂŁo na compra.'/> </td>";

	cols += "<td class='colEsquerda'> <label for='quantAcoes"+cont+"' class='masc'>Quant.</label> </td>";
	cols += "<td> <input id='quantAcoes"+cont+"' onkeypress='calcula();' onkeydown='calcula();' onkeyup='calcula();' type='text' title='Quantidade de aĂ§Ăľes compradas.'/> </td>";

	cols += "<td class='colEsquerda'> <label for='valorCorretagemCompra"+cont+"'>Corretagem Compra</label> </td>";
	cols += "<td> <input id='valorCorretagemCompra"+cont+"' class='masc' type='text' readOnly='true' disabled='true' title='Corretagem de compra.'/> </td>";

	cols += "<td class='colEsquerda'> <label for='valorizacaoAcao"+cont+"'>ValorizaĂ§ĂŁo (%)</label> </td>";
	cols += "<td> <input id='valorizacaoAcao"+cont+"' class='masc' type='text' readOnly='true' disabled='true' title='ValorizaĂ§ĂŁo da aĂ§ĂŁo.'/> </td>";

	cols += "<td class='colDireita'> <input type='image' title='Remover compra.' class='botaoExluir' src='https://cdn4.iconfinder.com/data/icons/VistaICO_Toolbar-Icons/256/Symbol-Delete.png' onClick='removeTableRow(this, "+cont+")'/> </td>";

	newRow.append(cols);
	newRow.append("</tr>");

	$("#tabValoresCompras").append(newRow);
	$('.masc').maskMoney({thousands:'.', decimal:',', symbolStay: true});
	$("input").keypress(function(){
		calcula();
	});

	$("input").keyup(function(){
		calcula();
	});

	(function($) {

	  removeTableRow = function(handler, index) {

		var tr = $(handler).closest('tr');

		tr.fadeOut(200, function(){
		  tr.remove();
		  spliceIndexArray(index);
		  calcula();
		});

		return false;
	  };

	})(jQuery);
}

function getCorretagem(quantAcoes){

	quantAcoes = getNotUndefinedValue( quantAcoes );

	if(quantAcoes ===  parseFloat(0)) return parseFloat(0);

	return quantAcoes >= 100 ? parseFloat(9.8) : parseFloat(4.4);
}

function testar(){


	for(y=0; y<cont; y++){

		//alert(getNotUndefinedValue(valoresCompras[y]));
		//alert(getNotUndefinedValue(valoresQuantidades[y]));
		//alert(getNotUndefinedValue(valoresCorretsCompras[y]));
	}

	alert(getQuantTotalAcoes());
}
