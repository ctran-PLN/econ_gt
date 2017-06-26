queue()
    .defer(d3.json, "/donorschoose/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {	
	//Clean projectsJson data
	var donorschooseProjects = projectsJson;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
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
		.height(400)
		.dimension(stateDim);
//		.group(totalDonationsByState)
//		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
//		.colorDomain([0, max_state])
//		.overlayGeoJson(statesJson["features"], "Country", function (d) {
//			return d.properties.name;
//		})
//		.projection(d3.geo.mercator()
//    				.center([0,40])
//				.scale(100)
//				.rotate([-12,0]))
/*		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "Country: " + p["key"]
					+ "\n";
		//			+ "Total Donations: " + Math.round(p["value"]) + " $";
		})
*/
    dc.renderAll();

};

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
	        // show desired information in tooltip
	        popupTemplate: function(geo, data) {
	        	return '<div class="hoverinfo"><strong>' + geo.properties.name + '</strong></div>';
	        	/*
	            // tooltip content
	            return ['<div class="hoverinfo">',
	                '<strong>', geo.properties.name, '</strong>',
	                '<br>Count: <strong>', data.numberOfThings, '</strong>',
	                '</div>'].join('');
	        	*/
	        }
	    },
	    done: function(datamap){
	        datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
	        function redraw() {
	            datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	        }
	    }
	});
	
	
}
