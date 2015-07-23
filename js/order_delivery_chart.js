//LOAD DATA FROM SERVER
d3.json("../data/order_delivery.json", function(error, data) {
  if(error) {
    return console.log("Error Loading Data");
  }

  var margin = {top: 40, right: 10, bottom: 80, left: 20};
  
  var barHeight = 8;
  var barWidth = 280;
  var barGap = barHeight * 1.25;
  
  var w = 960 - margin.left - margin.right;
  var h = (data.length * barGap);

  var startDate = "01/01/2015";

  var tooltipDuration = 300;
  
  
  

  var dateFormat = d3.time.format("%m/%d/%Y");

  var timeScale = d3.time.scale()
    // Use following code to dynamically base start date of chart on oldest IO start date
    .domain([d3.min(data, function(d) {return dateFormat.parse(d.start_date);}),
     d3.max(data, function(d) {return dateFormat.parse(d.end_date);})])
    //Use the following to begin chart at specifc start date
    // .domain([dateFormat.parse(startDate),
    //  d3.max(data, function(d) {return dateFormat.parse(d.end_date);})])
    .range([0,w]);

  
  //Make the SVG container
  var svgContainer = d3.select(".svg-wrapper")
    .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "svg");
  //Chart title
  svgContainer.append("text")
    .attr("class", "title")
    .attr("x", (w / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .text("Customer Order Delivery");                      

  //Make div for tooltip                      
  var div = d3.select("body").append("div")   
    .attr("id", "tooltip")               
    .style("opacity", 0);

  //Group to contain the order bars                      
  var barsGroup = svgContainer.append("g")
    .attr("class", "campaign-bars")
    // .attr("transform", "translate(100,0)");
  
  var xAxis = d3.svg.axis()
    .scale(timeScale)
    .orient("bottom")
    .ticks(d3.time.months,1)
    .tickSize(-h, 0, 0)

  var timeAxis = barsGroup.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
    .selectAll("text")  
      .style("text-anchor", "end")
      .attr("fill", "#000")
      .attr("stroke", "none")
      .attr("font-size", 10)
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
        return "rotate(-65)"
      });

  //Bars representing full duration of order
  var campaignBars = barsGroup.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", function(d, i) {return i * barGap })
    .attr("x", function(d) {return timeScale(dateFormat.parse(d.start_date))})
    .attr("height", barHeight)
    .attr("width", function(d){
        return (timeScale(dateFormat.parse(d.end_date))-timeScale(dateFormat.parse(d.start_date)));
     })
    .attr("fill", "#BCD69A")
    //DYNAMIC COLOR SHADING -BASED ON CAMPAIGN PROGRESS
    // .attr("fill", function(d, i) {
    //   if(d.percent_delivered > .89) {
    //     return "#8CB852";
    //   } else if (d.percent_delivered > .5) {
    //     return "orange";
    //   } else {
    //     return "yellow";
    //   }
    // })
    .attr("class", "campaign duration")

        
  //Bars representing the amount of the order that has been delivered                      
  var completedBars = campaignBars.select("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", function(d, i) {return i * barGap })
    .attr("x", function(d) {return timeScale(dateFormat.parse(d.start_date))})
    .attr("height", barHeight)
    .attr("width", function(d){
        return d.percent_delivered * (timeScale(dateFormat.parse(d.end_date))-timeScale(dateFormat.parse(d.start_date)));
     })
    .attr("fill", "#577430")
    .attr("class", "campaign utilization")

  barsGroup.selectAll(".campaign")
    .on('mouseover', mouseover)
    // .on('mousemove', mousemove)
    .on('mouseout', mouseout)

  function mouseover() {
    div.transition()
      .duration(tooltipDuration)
      .style("opacity", 1);

      var toolTipContent = "";
      var selectedData = d3.select(this).data()[0];
      toolTipContent = "<span><b>Customer:</b> " + selectedData.customer_name + "</span>" +
                       "<span><b>Order ID:</b> " + selectedData.order_id + "</span>" +
                       "<span><b>Order Amount:</b> $" + selectedData.order_amount + "</span>" +
                       "<span><b>Current Delivery:</b> " + Math.round(selectedData.percent_delivered * 100) + "%</span>" +
                       "<span><b>Start Date:</b> " + selectedData.start_date + "</span>" +
                       "<span><b>End Date:</b> " + selectedData.end_date + "</span>";

      var xPosition = d3.event.pageX + 10 + "px";
      var yPosition = d3.event.pageY + "px";
      // console.log(xPosition + "," + yPosition);
      // console.log(toolTipContent);
      
      document.getElementById("tooltip").innerHTML = toolTipContent;

      d3.select("#tooltip").style({
        "left" : xPosition,
        "top" : yPosition
      })
  }

  function mouseout() {
    div.transition()
      .duration(500)
      .style("opacity", 1e-6);
  }             

})



