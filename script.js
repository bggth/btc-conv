var converters = []

class Converter {
	constructor(from, to, value) {
		this.from = from;
		this.to = to;
		this.value = value
	}
	convert(value) {
		var result = value * this.value
		return result.toFixed(result<0.01?8:2) + " " + this.to;
	}
}

function log(s) {
	console.log(s)
}

function getBTCPrice(currency_info) {
	log("getBTCPrice()")
	$.get("https://www.cryptonator.com/api/ticker/btc-usd")
		.done(function(data) {
			var price = data['ticker']['price']
			currency_info["btc_usd"] = price;
			getUSDPrice(currency_info)
		})
}

function getBTCPrice2(currency_info) {
	log("getBTCPrice2()")
	$.get("http://api.coindesk.com/v1/bpi/currentprice.json")
		.done(function(data) {
			data = JSON.parse(data)
			log(data["bpi"]["USD"]["rate"])
			var price = data["bpi"]["USD"]["rate"].replace(",", "")
			currency_info["btc_usd"] = parseFloat(price);
			getUSDPrice(currency_info)
		})
}


function getUSDPrice(currency_info) {
	log("getUSDPrice()")
	$.getJSON("https://www.cbr-xml-daily.ru/daily_json.js")
		.done(function(data) {
			var price = data["Valute"]["USD"]["Value"];//data['ticker']['price']
			currency_info["usd_rub"] = price;
			init_converters(currency_info);
			log(currency_info)

		})
}

function init_converters(currency_info) {
	var btc_usd = currency_info["btc_usd"];
	var usd_rub = currency_info["usd_rub"];
	var btc_rub = usd_rub * btc_usd;
	converter = new Converter('rub', 'usd', 1 / usd_rub);
	converters.push(converter)
	converter = new Converter('usd', 'rub', usd_rub);
	converters.push(converter)
	converter = new Converter('usd', 'btc', 1 / btc_usd);
	converters.push(converter)
	converter = new Converter('btc', 'usd', btc_usd);
	converters.push(converter)
	converter = new Converter('rub', 'btc', 1 / btc_rub);
	converters.push(converter)
	converter = new Converter('btc', 'rub', btc_rub);
	converters.push(converter)
	return "result init_converters"
}

function parse_input(s) {
	data = s.split(" ")
	if (data.length == 2) {
		var input = {};
		input.value = data[0]
		input.currency = data[1]
		return input
	} else {
		return null;
	}
}

function convert(input) {
	input = parse_input(input)
	result = []
	if (input != null) {
		converters.forEach(converter => {
			if (input.currency==converter.from) {
				result.push(converter.convert(input.value))
			}
		})	
	}
	return result
}

$("#line1").on("input", function(){
	result = convert(this.value)
	log(result)
	if (result != []) {
		$("#line2").val(result[0])		
		$("#line3").val(result[1])		
	}
})

$(document).ready(function() {
	var currency_info = {};
	getBTCPrice2(currency_info);
		//$("#currency_info").html()
})