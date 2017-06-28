queue()
    .defer(d3.json, "/donorschoose/projects")
    .defer(d3.json, "static/geojson/countries.geo.json")	
    .await(makeGraphs);


function makeGraphs(error, projectsJson, statesJson) {
	
	//Clean projectsJson data
	var donorschooseProjects = projectsJson;
	var dateFormat = d3.time.format("%Y-%m-%d");
	donorschooseProjects.forEach(function(d) {
		d["date_posted"] = dateFormat.parse(d["date_posted"]);
		d["date_posted"].setDate(1);
		d["total_donations"] = +d["total_donations"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(donorschooseProjects);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["date_posted"]; });
	var resourceTypeDim = ndx.dimension(function(d) { return d["resource_type"]; });
	var povertyLevelDim = ndx.dimension(function(d) { return d["poverty_level"]; });
	var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });


	//Calculate metrics
	var numProjectsByDate = dateDim.group(); 
	var numProjectsByResourceType = resourceTypeDim.group();
	var numProjectsByPovertyLevel = povertyLevelDim.group();
	var totalDonationsByState = stateDim.group().reduceSum(function(d) {
		return d["total_donations"];
	});

	var all = ndx.groupAll();
	var totalDonations = ndx.groupAll().reduceSum(function(d) {return d["total_donations"];});

	var max_state = totalDonationsByState.top(1)[0].value;

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["date_posted"];
	var maxDate = dateDim.top(1)[0]["date_posted"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");
	var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	var totalDonationsND = dc.numberDisplay("#total-donations-nd");

	numberProjectsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	totalDonationsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalDonations)
		.formatNumber(d3.format(".3s"));

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(numProjectsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.xAxisLabel("Year")
		.yAxis().ticks(4);

	resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

	povertyLevelChart
		.width(300)
		.height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);


	usChart.width(1000)
		.height(330)
		.dimension(stateDim)
		.group(totalDonationsByState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.mercator()
    			//	.center([0,40])
				.scale(100)
				.rotate([-12,0]))
		.title(function (p) {
			return "State: " + p["key"]
					+ "\n"
					+ "Total Donations: " + Math.round(p["value"]) + " $";
		})

    dc.renderAll();

};


/*
function makeGraphs(error, projectsJson, statesJson) {	
	//Clean projectsJson data
	var donorschooseProjects = projectsJson;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	console.log(donorschooseProjects);
	donorschooseProjects.forEach(function(d) {
		d["date_posted"] = dateFormat.parse(d["date_posted"]);
		d["date_posted"].setDate(1);
		d["total_donations"] = +d["total_donations"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(donorschooseProjects);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["date_posted"]; });
	var resourceTypeDim = ndx.dimension(function(d) { return d["resource_type"]; });
	var povertyLevelDim = ndx.dimension(function(d) { return d["poverty_level"]; });
	var stateDim = ndx.dimension(function(d) { return d["school_state"]; });
	var totalDonationsDim  = ndx.dimension(function(d) { return d["total_donations"]; });


	//Calculate metrics
	var numProjectsByDate = dateDim.group(); 
	var numProjectsByResourceType = resourceTypeDim.group();
	var numProjectsByPovertyLevel = povertyLevelDim.group();
	var totalDonationsByState = stateDim.group().reduceSum(function(d) {
		return d["total_donations"];
	});

	var all = ndx.groupAll();
	var totalDonations = ndx.groupAll().reduceSum(function(d) {return d["total_donations"];});

	var max_state = totalDonationsByState.top(1)[0].value;

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["date_posted"];
	var maxDate = dateDim.top(1)[0]["date_posted"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
	var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");
	var numberProjectsND = dc.numberDisplay("#number-projects-nd");
	var totalDonationsND = dc.numberDisplay("#total-donations-nd");

	

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(numProjectsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.xAxisLabel("Year")
		.yAxis().ticks(4);

	resourceTypeChart
        .width(300)
        .height(250)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);

	povertyLevelChart
		.width(300)
		.height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);


	usChart.width(1000)
		.height(400)
		.dimension(stateDim);
		.group(totalDonationsByState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "Country", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.mercator()
    			//	.center([0,40])
				.scale(100)
				.rotate([-12,0]))
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "Country: " + p["key"]
					+ "\n";
		//			+ "Total Donations: " + Math.round(p["value"]) + " $";
		})

    dc.renderAll();

};

*/

function call_Datamap(){
	
	
	new Datamap({
	    element: document.getElementById('datamap'),
	    projection: 'mercator', // big world map
	    // countries don't listed in dataset will be painted with this color
	    fills: { defaultFill: '#F5F5F5' },
	   
	    geographyConfig: {
	        borderColor: '#DEDEDE',
	        highlightBorderWidth: 2,
	        
	        // only change border
	        highlightBorderColor: '#B7B7B7',
		
	//	highlightFillColor: '#FC8D59',    
		    
	        // show desired information in tooltip
	        popupTemplate: function(geo, data) {
	        	return '<div class="hoverinfo"><strong>' + geo.properties.name + '</strong></div>';	        
	        }
	    },
	    done: function(datamap){
	        datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
	        function redraw() {
	            datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	        };
		datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {

		//	    console.log(json['geography.id']['gross domestic product, current prices'] );
		//	    console.log(json['geography.id']['gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp']);
			gdps = {"AFG": {"gross domestic product, current prices": "20.57", "name": "afghanistan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "67.462"}, "ALB": {"gross domestic product, current prices": "12.294", "name": "albania", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "36.198"}, "DZA": {"gross domestic product, current prices": "173.947", "name": "algeria", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "634.746"}, "AGO": {"gross domestic product, current prices": "122.365", "name": "angola", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "193.935"}, "ARG": {"gross domestic product, current prices": "628.935", "name": "argentina", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "912.816"}, "ARM": {"gross domestic product, current prices": "10.741", "name": "armenia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "27.116"}, "AUS": {"gross domestic product, current prices": "1,359.72", "name": "australia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,251.42"}, "AUT": {"gross domestic product, current prices": "383.509", "name": "austria", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "432.424"}, "AZE": {"gross domestic product, current prices": "38.583", "name": "azerbaijan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "167.431"}, "BHS": {"gross domestic product, current prices": "9.172", "name": "the bahamas", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "9.374"}, "BGD": {"gross domestic product, current prices": "248.853", "name": "bangladesh", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "686.598"}, "BLR": {"gross domestic product, current prices": "54.689", "name": "belarus", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "173.405"}, "BEL": {"gross domestic product, current prices": "462.715", "name": "belgium", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "529.289"}, "BLZ": {"gross domestic product, current prices": "1.829", "name": "belize", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3.252"}, "BEN": {"gross domestic product, current prices": "8.792", "name": "benin", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "25.407"}, "BTN": {"gross domestic product, current prices": "2.308", "name": "bhutan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "7.045"}, "BOL": {"gross domestic product, current prices": "39.267", "name": "bolivia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "83.608"}, "BIH": {"gross domestic product, current prices": "16.78", "name": "bosnia and herzegovina", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "44.462"}, "BWA": {"gross domestic product, current prices": "15.564", "name": "botswana", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "39.054"}, "BRA": {"gross domestic product, current prices": "2,140.94", "name": "brazil", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3,216.03"}, "BGR": {"gross domestic product, current prices": "52.291", "name": "bulgaria", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "152.079"}, "BFA": {"gross domestic product, current prices": "12.258", "name": "burkina faso", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "35.598"}, "BDI": {"gross domestic product, current prices": "3.384", "name": "burundi", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "8.024"}, "KHM": {"gross domestic product, current prices": "20.953", "name": "cambodia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "64.405"}, "CMR": {"gross domestic product, current prices": "29.547", "name": "cameroon", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "81.535"}, "CAN": {"gross domestic product, current prices": "1,600.27", "name": "canada", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,752.91"}, "CAF": {"gross domestic product, current prices": "1.992", "name": "central african republic", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3.411"}, "TCD": {"gross domestic product, current prices": "9.636", "name": "chad", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "29.73"}, "CHL": {"gross domestic product, current prices": "251.22", "name": "chile", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "455.941"}, "CHN": {"gross domestic product, current prices": "11,795.30", "name": "china", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "23,194.41"}, "COL": {"gross domestic product, current prices": "306.439", "name": "colombia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "720.151"}, "COD": {"gross domestic product, current prices": "41.098", "name": "democratic republic of the congo", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "68.331"}, "CRI": {"gross domestic product, current prices": "59.796", "name": "costa rica", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "85.781"}, "HRV": {"gross domestic product, current prices": "50.084", "name": "croatia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "100.006"}, "CYP": {"gross domestic product, current prices": "19.648", "name": "cyprus", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "31.093"}, "CZE": {"gross domestic product, current prices": "196.068", "name": "czech republic", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "368.659"}, "DNK": {"gross domestic product, current prices": "304.216", "name": "denmark", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "284.04"}, "DJI": {"gross domestic product, current prices": "2.088", "name": "djibouti", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3.658"}, "DOM": {"gross domestic product, current prices": "76.85", "name": "dominican republic", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "174.18"}, "ECU": {"gross domestic product, current prices": "97.362", "name": "ecuador", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "184.629"}, "EGY": {"gross domestic product, current prices": "n/a", "name": "egypt", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,197.97"}, "SLV": {"gross domestic product, current prices": "27.548", "name": "el salvador", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "57.285"}, "GNQ": {"gross domestic product, current prices": "11.686", "name": "equatorial guinea", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "30.807"}, "ERI": {"gross domestic product, current prices": "6.051", "name": "eritrea", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "9.678"}, "EST": {"gross domestic product, current prices": "23.422", "name": "estonia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "40.275"}, "ETH": {"gross domestic product, current prices": "78.384", "name": "ethiopia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "194.98"}, "FJI": {"gross domestic product, current prices": "4.869", "name": "fiji", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "8.798"}, "FIN": {"gross domestic product, current prices": "234.524", "name": "finland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "239.662"}, "FRA": {"gross domestic product, current prices": "2,420.44", "name": "france", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "2,833.06"}, "GAB": {"gross domestic product, current prices": "14.208", "name": "gabon", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "36.999"}, "GEO": {"gross domestic product, current prices": "13.723", "name": "georgia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "39.318"}, "DEU": {"gross domestic product, current prices": "3,423.29", "name": "germany", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "4,134.67"}, "GHA": {"gross domestic product, current prices": "42.753", "name": "ghana", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "131.498"}, "GRC": {"gross domestic product, current prices": "193.1", "name": "greece", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "302.15"}, "GTM": {"gross domestic product, current prices": "70.943", "name": "guatemala", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "138.987"}, "GIN": {"gross domestic product, current prices": "6.936", "name": "guinea", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "17.056"}, "GUY": {"gross domestic product, current prices": "3.591", "name": "guyana", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "6.398"}, "HTI": {"gross domestic product, current prices": "7.897", "name": "haiti", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "19.979"}, "HND": {"gross domestic product, current prices": "21.79", "name": "honduras", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "45.628"}, "HUN": {"gross domestic product, current prices": "125.297", "name": "hungary", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "284.266"}, "ISL": {"gross domestic product, current prices": "22.97", "name": "iceland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "17.846"}, "IND": {"gross domestic product, current prices": "2,454.46", "name": "india", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "9,489.30"}, "IDN": {"gross domestic product, current prices": "1,020.52", "name": "indonesia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3,257.12"}, "IRQ": {"gross domestic product, current prices": "189.432", "name": "iraq", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "641.005"}, "IRL": {"gross domestic product, current prices": "294.193", "name": "ireland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "343.682"}, "ISR": {"gross domestic product, current prices": "339.99", "name": "israel", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "316.12"}, "ITA": {"gross domestic product, current prices": "1,807.43", "name": "italy", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "2,303.11"}, "JAM": {"gross domestic product, current prices": "14.272", "name": "jamaica", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "26.474"}, "JPN": {"gross domestic product, current prices": "4,841.22", "name": "japan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "5,420.23"}, "JOR": {"gross domestic product, current prices": "40.506", "name": "jordan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "89.555"}, "KAZ": {"gross domestic product, current prices": "157.878", "name": "kazakhstan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "472.563"}, "KEN": {"gross domestic product, current prices": "75.099", "name": "kenya", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "164.34"}, "-99": {"gross domestic product, current prices": "6.809", "name": "kosovo", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "19.509"}, "KWT": {"gross domestic product, current prices": "126.971", "name": "kuwait", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "309.64"}, "LVA": {"gross domestic product, current prices": "27.795", "name": "latvia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "53.268"}, "LBN": {"gross domestic product, current prices": "53.915", "name": "lebanon", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "88.786"}, "LSO": {"gross domestic product, current prices": "2.439", "name": "lesotho", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "7.287"}, "LBR": {"gross domestic product, current prices": "2.215", "name": "liberia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3.96"}, "LBY": {"gross domestic product, current prices": "54.411", "name": "libya", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "87.067"}, "LTU": {"gross domestic product, current prices": "42.826", "name": "lithuania", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "90.387"}, "LUX": {"gross domestic product, current prices": "59.997", "name": "luxembourg", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "63.549"}, "MDG": {"gross domestic product, current prices": "10.372", "name": "madagascar", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "40.055"}, "MWI": {"gross domestic product, current prices": "6.182", "name": "malawi", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "22.577"}, "MYS": {"gross domestic product, current prices": "309.86", "name": "malaysia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "922.057"}, "MLI": {"gross domestic product, current prices": "14.344", "name": "mali", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "40.974"}, "MRT": {"gross domestic product, current prices": "5.063", "name": "mauritania", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "17.421"}, "MEX": {"gross domestic product, current prices": "987.303", "name": "mexico", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "2,406.20"}, "MDA": {"gross domestic product, current prices": "7.409", "name": "moldova", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "20.207"}, "MNG": {"gross domestic product, current prices": "10.271", "name": "mongolia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "37.731"}, "MNE": {"gross domestic product, current prices": "4.185", "name": "montenegro", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "10.934"}, "MAR": {"gross domestic product, current prices": "105.623", "name": "morocco", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "300.556"}, "MOZ": {"gross domestic product, current prices": "11.17", "name": "mozambique", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "37.321"}, "MMR": {"gross domestic product, current prices": "72.368", "name": "myanmar", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "334.856"}, "NAM": {"gross domestic product, current prices": "11.765", "name": "namibia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "27.451"}, "NPL": {"gross domestic product, current prices": "23.316", "name": "nepal", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "77.147"}, "NLD": {"gross domestic product, current prices": "762.694", "name": "netherlands", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "907.619"}, "NZL": {"gross domestic product, current prices": "198.043", "name": "new zealand", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "186.476"}, "NIC": {"gross domestic product, current prices": "13.748", "name": "nicaragua", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "35.835"}, "NER": {"gross domestic product, current prices": "7.674", "name": "niger", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "21.655"}, "NGA": {"gross domestic product, current prices": "400.621", "name": "nigeria", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,124.63"}, "NOR": {"gross domestic product, current prices": "391.959", "name": "norway", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "377.1"}, "OMN": {"gross domestic product, current prices": "71.325", "name": "oman", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "189.582"}, "PAK": {"gross domestic product, current prices": "n/a", "name": "pakistan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,060.57"}, "PAN": {"gross domestic product, current prices": "59.486", "name": "panama", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "100.512"}, "PNG": {"gross domestic product, current prices": "21.189", "name": "papua new guinea", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "29.481"}, "PRY": {"gross domestic product, current prices": "28.743", "name": "paraguay", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "68.005"}, "PER": {"gross domestic product, current prices": "207.072", "name": "peru", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "429.711"}, "PHL": {"gross domestic product, current prices": "329.716", "name": "philippines", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "878.98"}, "POL": {"gross domestic product, current prices": "482.92", "name": "poland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,114.11"}, "PRT": {"gross domestic product, current prices": "202.77", "name": "portugal", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "310.651"}, "PRI": {"gross domestic product, current prices": "99.727", "name": "puerto rico", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "129.848"}, "QAT": {"gross domestic product, current prices": "173.649", "name": "qatar", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "347.887"}, "ROU": {"gross domestic product, current prices": "189.79", "name": "romania", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "470.312"}, "RUS": {"gross domestic product, current prices": "1,560.71", "name": "russia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "3,938.00"}, "RWA": {"gross domestic product, current prices": "8.918", "name": "rwanda", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "24.717"}, "SAU": {"gross domestic product, current prices": "707.379", "name": "saudi arabia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,796.21"}, "SEN": {"gross domestic product, current prices": "15.431", "name": "senegal", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "43.326"}, "SLE": {"gross domestic product, current prices": "4.088", "name": "sierra leone", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "11.551"}, "SVN": {"gross domestic product, current prices": "43.503", "name": "slovenia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "69.358"}, "SLB": {"gross domestic product, current prices": "1.245", "name": "solomon islands", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1.247"}, "ZAF": {"gross domestic product, current prices": "317.568", "name": "south africa", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "761.926"}, "SSD": {"gross domestic product, current prices": "4.812", "name": "south sudan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "20.423"}, "ESP": {"gross domestic product, current prices": "1,232.44", "name": "spain", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,768.82"}, "LKA": {"gross domestic product, current prices": "84.023", "name": "sri lanka", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "278.415"}, "SDN": {"gross domestic product, current prices": "115.874", "name": "sudan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "186.715"}, "SUR": {"gross domestic product, current prices": "3.641", "name": "suriname", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "7.961"}, "SWZ": {"gross domestic product, current prices": "3.938", "name": "swaziland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "11.352"}, "SWE": {"gross domestic product, current prices": "507.046", "name": "sweden", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "522.849"}, "CHE": {"gross domestic product, current prices": "659.368", "name": "switzerland", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "514.162"}, "SYR": {"gross domestic product, current prices": "n/a", "name": "syria", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "n/a"}, "TJK": {"gross domestic product, current prices": "7.242", "name": "tajikistan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "27.802"}, "THA": {"gross domestic product, current prices": "432.898", "name": "thailand", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "1,226.41"}, "TGO": {"gross domestic product, current prices": "4.554", "name": "togo", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "12.494"}, "TTO": {"gross domestic product, current prices": "21.748", "name": "trinidad and tobago", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "44.654"}, "TUN": {"gross domestic product, current prices": "40.289", "name": "tunisia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "136.797"}, "TUR": {"gross domestic product, current prices": "793.698", "name": "turkey", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "2,082.08"}, "TKM": {"gross domestic product, current prices": "42.355", "name": "turkmenistan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "103.987"}, "UGA": {"gross domestic product, current prices": "27.174", "name": "uganda", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "91.212"}, "UKR": {"gross domestic product, current prices": "95.934", "name": "ukraine", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "368.047"}, "ARE": {"gross domestic product, current prices": "407.21", "name": "united arab emirates", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "693.765"}, "GBR": {"gross domestic product, current prices": "2,496.76", "name": "united kingdom", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "2,905.39"}, "URY": {"gross domestic product, current prices": "58.123", "name": "uruguay", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "77.8"}, "UZB": {"gross domestic product, current prices": "68.324", "name": "uzbekistan", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "222.792"}, "VUT": {"gross domestic product, current prices": "0.829", "name": "vanuatu", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "0.772"}, "VEN": {"gross domestic product, current prices": "251.589", "name": "venezuela", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "404.109"}, "VNM": {"gross domestic product, current prices": "215.829", "name": "vietnam", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "648.243"}, "YEM": {"gross domestic product, current prices": "27.189", "name": "yemen", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "74.25"}, "ZMB": {"gross domestic product, current prices": "23.137", "name": "zambia", "gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp": "68.648"}, "ZWE": {"gross domestic product, current prices": "15.285", "name": "zimbabwe"}};
			
			
			$('#countryName-container').text(geography.properties.name);
			   $('#countryName-container').css({"font-size":"25px","color":"#fff", "text-align": "center", "background-color" : "#3d4a57" });
			$("#gdp").text('$ ' +gdps[geography.id]['gross domestic product, current prices']);
			   $("#gdp").css({"font-size":"25px","color":"#777", "float" : "right"});
			$("#ppp").text('$ ' +gdps[geography.id]['gross domestic product based on purchasing-power-parity (ppp) valuation of country gdp']);
			   $("#ppp").css({"font-size":"25px","color":"#777", "float" : "right"});	
			
			dc.renderAll();
				
		});
		
    
	  }
	});
	
	
}
