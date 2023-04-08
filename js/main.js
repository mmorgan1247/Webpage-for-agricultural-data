//--------------------------------------------//
// Define Constants //
//--------------------------------------------//

const FRAME_HEIGHT = 250;
const FRAME_HEIGHT_TALL = 400;
const FRAME_WIDTH = 400;
const FRAME_WIDTH_LONG = 900;
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_HEIGHT_TALL = FRAME_HEIGHT_TALL - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;
const VIS_WIDTH_LONG = FRAME_WIDTH_LONG - MARGINS.left - MARGINS.right;

//--------------------------------------------//
// VISUALIZATION #1
//--------------------------------------------//

// Create selection options
let allGroup = ["Total Output", "All Livestock and Products", "All Crops"];

d3.select("#selectButton")
  .selectAll('myOptions')
  .data(allGroup)
  .enter()
    .append('option')
    .text(d => d)
    .attr("value", d => d);

//--------------------------------------------//
// Builds scatter plotl
//--------------------------------------------//
function build_outputs() {

  let svg = d3.select("#viz1")
    .append("svg")
      .attr("width", FRAME_WIDTH_LONG + MARGINS.left)
      .attr("height", FRAME_HEIGHT_TALL)
    .append("g")
      .attr("transform",
            "translate(" + MARGINS.left * 2 + "," + MARGINS.top + ")");

  let g1_tooltip = d3.select("#viz1")
            .append("div")
            .attr("id", "viz1tip")
            .style("opacity", 0)
            .attr("class", "tooltip");

  // Add X axis
  let x = d3.scaleLinear()
    .domain([1960,2004])
    .range([ 0, VIS_WIDTH_LONG ]);
  svg.append("g")
    .attr("transform", "translate(0," + VIS_HEIGHT_TALL + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  let y = d3.scaleLinear()
    .domain( [0,400000])
    .range([ VIS_HEIGHT_TALL, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add Axis Labels
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", FRAME_WIDTH_LONG/2 - MARGINS.right)
    .attr("y", VIS_HEIGHT_TALL + 40)
    .text("Year");
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -50)
    .attr("y", 0 - MARGINS.left - 20)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Quantity: Millions in USD Produced");
  svg.append("text")
    .attr("x", FRAME_WIDTH_LONG/2 - MARGINS.right)
    .attr("y", 0 - MARGINS.top/2)
    .attr("text-anchor", "middle")
    .text("Agriculture Output Over Time")

  // Read the data
  d3.csv("data_clean/table01a_F.csv").then(function(data) {

      // Initialize line with "Total Output"
      let line = svg
        .append('g')
        .append("path")
          .datum(data)
          .attr("d", d3.line()
            .x(function(d) { return x(parseInt(d["Year"])); })
            .y(function(d) { return y(parseInt(d["Total Output"])); })
          )
          .attr("stroke", "black")
          .style("stroke-width", 2)
          .style("fill", "none");

      // Initialize dots with "Total Output"
      let dot = svg
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
          .attr("cx", function(d) { return x(parseInt(d["Year"])); })
          .attr("cy", function(d) { return y(parseInt(d["Total Output"])); })
          .attr("r", 4)
          .style("fill", "#69b3a2")

          .on("mouseover", function(event, d) {
            d3.select("#viz1tip")
              .style("opacity", 1)
              .html("Value")
            d3.select(this)
              .style("fill", "#f58231")
          })

          .on("mousemove", function(event, d) {
            d3.select("#viz1tip")
              .html(d["Year"] + ": $" + d["Total Output"])
              .style("left", `${event.layerX+10}px`)
              .style("top", `${event.layerY}px`)
          })

          .on("mouseleave", function(event, d) {
            d3.select("#viz1tip")
              .style("opacity", 0)
            d3.select(this)
              .style("fill", "#69b3a2")
          })

      // A function that update the chart
      function updateScatter(selectedGroup) {
        // Create new data with the selection
        const dataFilter = data.map(function(d) {
          return {Year: d.Year, value:d[selectedGroup]}
        })
        // Give these new data to update line
        line.datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.Year) })
              .y(function(d) { return y(+d.value) }))
        dot.data(dataFilter)
          .transition()
          .duration(1000)
            .attr("cx", function(d) { return x(+d.Year) })
            .attr("cy", function(d) { return y(+d.value) })

        dot.on("mousemove", function(event, d) {
          d3.select("#viz1tip")
          .html(d.Year + ": $" + d.value)
          .style("left", `${event.layerX+10}px`)
          .style("top", `${event.layerY}px`)
        })
      };

      // When the button is changed, run the updateChart function
      d3.select("#selectButton").on("change", function(d) {
          let selectedOption = d3.select(this).property("value");
          console.log(selectedOption);
          updateScatter(selectedOption);
      });

  });
};

//--------------------------------------------//
// Builds stacked line chart
//--------------------------------------------//
function build_stacked_outputs() {

  let category = "All"  // "Crop", "Livestock"

  let svg = d3.select("#viz1")
    .append("svg")
      .attr("width", FRAME_WIDTH_LONG + MARGINS.left + 300)
      .attr("height", FRAME_HEIGHT_TALL)
    .append("g")
      .attr("transform",
            "translate(" + MARGINS.left * 2 + "," + MARGINS.top + ")");

  // Parse the Data
  d3.csv("data_clean/table01a_F_R.csv").then(function(data) {

    // List of groups = header of the csv files
    let keys = data.columns.slice(1);

    let colors = ['#000075','#e6194B','#f58231',
    '#04bf36','#42d4f4','#4363d8','#911eb4','#ffe119','#f032e6'];

    // Add X axis
    let x = d3.scaleLinear()
      .domain([1960,2004])
      .range([ 0, VIS_WIDTH_LONG ]);
    svg.append("g")
      .attr("transform", "translate(0," + VIS_HEIGHT_TALL + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, 350000])
      .range([ VIS_HEIGHT_TALL, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", FRAME_WIDTH_LONG/2 - MARGINS.right)
      .attr("y", VIS_HEIGHT_TALL + 40)
      .text("Year");
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("x", -50)
      .attr("y", 0 - MARGINS.left - 20)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Quantity: Millions in USD Produced");
    svg.append("text")
      .attr("x", FRAME_WIDTH_LONG/2 - MARGINS.right)
      .attr("y", 0 - MARGINS.top/2)
      .attr("text-anchor", "middle")
      .text("Total Agriculture Output Over Time by Product Type");

    // Match keys to colors
    let color = d3.scaleOrdinal()
      .domain(keys)
      .range(colors);

    // Stack the data
    let stackedData = d3.stack()
      .keys(keys)
      (data);

    // Show the areas
    svg
      .selectAll("mylayers")
      .data(stackedData)
      .enter()
      .append("path")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", d3.area()
          .x(function(d, i) { return x(d.data.Year); })
          .y0(function(d) { return y(d[0]); })
          .y1(function(d) { return y(d[1]); })
      )
      // Tooltip and hover effect
      .on("mouseover", function(event, d) {
            d3.select("#viz1tip")
              .style("opacity", 1)
              .html("Value");
            d3.select(this)
              .attr("stroke", "#fff")
              .attr("stroke-width", "2px");
          })
          .on("mousemove", function(event, d) {
            d3.select("#viz1tip")
              .html(d.key)
              .style("left", `${event.layerX+10}px`)
              .style("top", `${event.layerY}px`);
          })
          .on("mouseleave", function(event, d) {
            d3.select("#viz1tip")
              .style("opacity", 0);
            d3.select(this).attr("stroke", "none");
          });

      // Creating key
      let firstCirclePos = 10;
      for (let i = colors.length - 1; i >= 0; i--) {
        svg.append("circle")
          .attr("cx",850)
          .attr("cy",firstCirclePos)
          .attr("r", 6)
          .style("fill", colors[i]);
        svg.append("text")
          .attr("x", 870)
          .attr("y", firstCirclePos)
          .text(keys[i])
          .style("font-size", "10px")
          .attr("alignment-baseline","middle");
        firstCirclePos = firstCirclePos + 20;
      };

  })
}

//--------------------------------------------//
// VISUALIZATION #2
//--------------------------------------------//

// Colors for line chart
const colors = ['blue', 'violet', 'forestgreen',
                'darkred', 'grey', 'black', 'peru', 'orange',
                'red', 'yellow', 'cyan', 'goldenrod', 'greenyellow',
                'lightcoral', 'lightblue', 'lightsalmon', 'mediumaquamarine',
                'orangered', 'tan', 'purple', 'rebeccapurple'];
let states_colors = {};

// Define SVGs for each graph
let pest_svg = d3.select("#pest")
  .append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGINS.left + "," + MARGINS.top + ")");

let fert_svg = d3.select("#fert")
  .append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate("  + MARGINS.left + "," + MARGINS.top + ")");

let energy_svg = d3.select("#energy")
  .append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGINS.left + "," + MARGINS.top + ")");

let labor_svg = d3.select("#labor")
  .append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGINS.left + "," + MARGINS.top + ")");

// Define tooltips for each graph
let labor_tooltip = d3.select("#labor")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

let energy_tooltip = d3.select("#energy")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

let fert_tooltip = d3.select("#fert")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

let pest_tooltip = d3.select("#pest")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

//--------------------------------------------//
// Builds pesticide graph
//--------------------------------------------//
function build_pesticide(states, firstRun){

  states = Array.from(states);

  // Parse data
  d3.csv("data_clean/pesticide_consumption_F.csv").then((data) => {
    // Create X axis
    let x = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d.Year; })
        , d3.max(data, function(d) { return d.Year; })])
      .range([ 0, FRAME_WIDTH ]);

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Value; })])
      .range([ FRAME_HEIGHT, 0 ]);

    // Builds axes on first run
    if(firstRun) {
      pest_svg.append("text")
            .attr("x", FRAME_WIDTH/2)
            .attr("y", 0 - MARGINS.top/2)
            .attr("text-anchor", "middle")
            .text("Pesticide Consumption Per Year")
      pest_svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", FRAME_WIDTH/2)
            .attr("y", FRAME_HEIGHT + 40)
            .text("Year");
      pest_svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", 0 - FRAME_HEIGHT / 4)
            .attr("y", 0 - MARGINS.left)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Y-Value: check footnote");
      pest_svg.append("g")
        .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
        .call(d3.axisBottom(x));
      pest_svg.append("g")
        .call(d3.axisLeft(y));

      pest_svg.append("text")
        .attr("x", FRAME_WIDTH/2)
        .attr("y", 0 - MARGINS.top/2)
        .attr("text-anchor", "middle")
        .text("Pesticide Consumption Per Year");
    }

    // Add the lines for each state
    let state_count = 0;
    let prev_point = [0, y(data[0].Value)];
    states.forEach(item => {
      let pest_row = data.filter(function(d){ return d.State == item; });
      prev_point = [0, y(pest_row[0].Value)]

      for (let i = 0; i < 45; i++) {
        pest_svg.append("line")
        .datum(data)
          .attr("class", item)
          .attr("fill", "none")
          .attr("stroke", colors[state_count])
          .attr("stroke-width", 1.5)
          .attr('x1', prev_point[0])
          .attr('y1', prev_point[1])
          .attr('x2', x(pest_row[i].Year))
          .attr('y2', y(pest_row[i].Value))
          // Add hover effect and tooltip
          .on("mouseover", function(event, d){
            d3.selectAll("." + item)
              .attr("stroke-width", 5)
              .style("font-weight", "bolder")
              .style("color", states_colors[item]);
            pest_tooltip
              .style("opacity", 1)
              .html(pest_row[i].State + " in "
                    + pest_row[i].Year +": " + pest_row[i].Value)
              .style("left", `${event.screenX+10}px`)
              .style("top", `${event.screenY - 100}px`)
            })
          .on("mousemove", function(event, d) {
            pest_tooltip
            .html(pest_row[i].State + " in "
                  + pest_row[i].Year +": " + pest_row[i].Value)
            .style("left", `${event.layerX+10}px`)
            .style("top", `${event.layerY}px`)
        })
          .on("mouseleave", function(event, d) {
            d3.selectAll("."+item)
              .attr("stroke-width", 1.5)
              .style("font-weight", "normal")
              .style("color", "black");
            pest_tooltip
              .style("opacity", 0);
          });

      prev_point = [x(pest_row[i].Year), y(pest_row[i].Value)];
    };

      state_count ++;
    })
  })
}

//--------------------------------------------//
// Builds fertilizer graph
//--------------------------------------------//
function build_fertilizer(states, firstRun) {
  states = Array.from(states);

  // Parse the data
  d3.csv("data_clean/fertilizer_consumption_F.csv").then((data) => {

    // Create X axis
    let x = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d.Year; })
        , d3.max(data, function(d) { return d.Year; })])
      .range([ 0, FRAME_WIDTH ]);

    // Create Y axis
    let y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Value; })])
      .range([ FRAME_HEIGHT, 0 ]);

    // Builds axes and labels
    if(firstRun) {
      fert_svg.append("g")
        .call(d3.axisLeft(y));
      fert_svg.append("g")
        .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
        .call(d3.axisBottom(x));
      fert_svg.append("text")
            .attr("x", FRAME_WIDTH/2)
            .attr("y", 0 - MARGINS.top/2)
            .attr("text-anchor", "middle")
            .text("Fertilizer Consumption Per Year")
      fert_svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", 0 - FRAME_HEIGHT / 4)
            .attr("y", 0 - MARGINS.left)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Y-Value: check footnote");
      fert_svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", FRAME_WIDTH/2)
            .attr("y", FRAME_HEIGHT + 40)
            .text("Year");
    }

    // Add the line for each state
    let state_count = 0;
    let prev_point = [0, y(data[0].Value)];
    states.forEach(item => {

      let fert_row = data.filter(function(d){ return d.State == item; });
      prev_point = [0, y(fert_row[0].Value)]

      for (let i = 0; i < 45; i++) {
        fert_svg.append("line")
        .datum(data)
          .attr("class", item)
          .attr("fill", "none")
          .attr("stroke", colors[state_count])
          .attr("stroke-width", 1.5)
          .attr('x1', prev_point[0])
          .attr('y1', prev_point[1])
          .attr('x2', x(fert_row[i].Year))
          .attr('y2', y(fert_row[i].Value))
          // Add tooltip and hover effect
          .on("mouseover", function(event, d) {
            d3.selectAll("."+item)
              .attr("stroke-width", 5)
              .style("font-weight", "bolder")
              .style("color", states_colors[item]);
            fert_tooltip
              .style("opacity", 1)
              .html(fert_row[i].State + " in " + fert_row[i].Year
                    + ": " + fert_row[i].Value)
              .style("left", `${event.screenX+10}px`)
              .style("top", `${event.screenY - 100}px`)
            }
          )
          .on("mousemove", function(event, d) {
            fert_tooltip
            .html(fert_row[i].State + " in " + fert_row[i].Year +": " + fert_row[i].Value)
            .style("left", `${event.layerX+10}px`)
            .style("top", `${event.layerY}px`)
            }
          )
          .on("mouseleave", function(event, d) {
            d3.selectAll("."+item)
              .attr("stroke-width", 1.5)
              .style("font-weight", "normal")
              .style("color", "black");
            fert_tooltip
            .style("opacity", 0);
            }
          );

      prev_point = [x(fert_row[i].Year), y(fert_row[i].Value)];
    };
      state_count ++;
    })
  })
}

//--------------------------------------------//
// Builds energy graph
//--------------------------------------------//
function build_energy_input(states, firstRun){
  states = Array.from(states);

  // Parse data
  d3.csv("data_clean/energy_input_F.csv").then((data) => {

  // Create X axis
  let x = d3.scaleLinear()
    .domain([d3.min(data, function(d) { return d.Year; }),
      d3.max(data, function(d) { return d.Year; })])
    .range([ 0, FRAME_WIDTH ]);

  // Create Y axis
  let y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.Value; })])
    .range([ FRAME_HEIGHT, 0 ]);

  // Create axes and labels on first run
  if(firstRun) {
      energy_svg.append("text")
        .attr("x", FRAME_WIDTH/2)
        .attr("y", 0 - MARGINS.top/2)
        .attr("text-anchor", "middle")
        .text("Energy Input Per Year")
      energy_svg.append("text")
          .attr("class", "y label")
          .attr("text-anchor", "end")
          .attr("x", 0 - FRAME_HEIGHT / 4)
          .attr("y", 0 - MARGINS.left)
          .attr("dy", ".75em")
          .attr("transform", "rotate(-90)")
          .text("Y-Value: check footnote");
      energy_svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", FRAME_WIDTH/2)
        .attr("y", FRAME_HEIGHT + 40)
        .text("Year");
      energy_svg.append("g")
        .call(d3.axisLeft(y));
      energy_svg.append("g")
        .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
        .call(d3.axisBottom(x));
    }

  // Add the line for each state
  let state_count = 0;
  let prev_point = [0, y(data[0].Value)];

  states.forEach(item => {
    let energy_row = data.filter(function(d){ return d.State == item; });
    prev_point = [0, y(energy_row[0].Value)]

    for (let i = 0; i < 45; i++) {
      energy_svg.append("line")
      .datum(data)
      .attr("class", item)
      .attr("fill", "none")
      .attr("stroke", colors[state_count])
      .attr("stroke-width", 1.5)
      .attr('x1', prev_point[0])
      .attr('y1', prev_point[1])
      .attr('x2', x(energy_row[i].Year))
      .attr('y2', y(energy_row[i].Value))
      // Add tooltip and hover effect
      .on("mouseover", function(event, d){
        d3.selectAll("."+item)
          .attr("stroke-width", 5)
          .style("font-weight", "bolder")
          .style("color", states_colors[item]);
        energy_tooltip
          .style("opacity", 1)
          .html(energy_row[i].State + " in "
                + energy_row[i].Year +": " + energy_row[i].Value)
          .style("left", `${event.screenX+10}px`)
          .style("top", `${event.screenY - 100}px`)
        })
      .on("mousemove", function(event, d) {
        energy_tooltip
        .html(energy_row[i].State + " in "
              + energy_row[i].Year +": " + energy_row[i].Value)
        .style("left", `${event.layerX+10}px`)
        .style("top", `${event.layerY}px`)
    })
      .on("mouseleave", function(event, d) {
        d3.selectAll("."+item)
          .attr("stroke-width", 1.5)
          .style("font-weight", "normal")
          .style("color", "black");
        energy_tooltip
        .style("opacity", 0);
      });

    prev_point = [x(energy_row[i].Year), y(energy_row[i].Value)];
  };
    state_count++;
  })

})
}

//--------------------------------------------//
// Builds labor graph
//--------------------------------------------//
function build_labor_input(states, firstRun){
  d3.selectAll("line").remove();

  states = Array.from(states);

  // Parse data
  d3.csv("data_clean/labour_input_F.csv").then((data) => {

    // Create X axis
    let x = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d.Year; })
        , d3.max(data, function(d) { return d.Year; })])
      .range([ 0, FRAME_WIDTH ]);

    // Create Y axis
    let y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Value; })])
      .range([ FRAME_HEIGHT, 0 ]);

    // Add axes on first run
    if(firstRun) {
      labor_svg.append("g")
        .call(d3.axisLeft(y));
      labor_svg.append("g")
        .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
        .call(d3.axisBottom(x));
      labor_svg.append("text")
          .attr("x", FRAME_WIDTH/2)
          .attr("y", 0 - MARGINS.top/2)
          .attr("text-anchor", "middle")
          .text("Labor Input Per Year")
      labor_svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", 0 - FRAME_HEIGHT / 4)
            .attr("y", 0 - MARGINS.left)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Y-Value: check footnote");
      labor_svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", FRAME_WIDTH/2)
          .attr("y", FRAME_HEIGHT + 40)
          .text("Year");
    }

    // Create lines for each state
    let state_count = 0;
    let prev_point = [0, y(data[0].Value)];

    states.forEach(item => {
      states_colors[item] = colors[state_count];
      let labor_row = data.filter(function(d){ return d.State == item; });
      prev_point = [0, y(labor_row[0].Value)]

      for (let i = 0; i < 45; i++) {
        labor_svg.append("line")
        .datum(data)
        .attr("class", item)
        .attr("fill", "none")
        .attr("stroke", colors[state_count])
        .attr("stroke-width", 1.5)
        .attr('x1', prev_point[0])
        .attr('y1', prev_point[1])
        .attr('x2', x(labor_row[i].Year))
        .attr('y2', y(labor_row[i].Value))
        // Create tooltip and hover effect
        .on("mouseover", function(event, d){
          d3.selectAll("."+item)
            .attr("stroke-width", 5)
            .style("font-weight", "bolder")
            .style("color", states_colors[item]);
          labor_tooltip
            .style("opacity", 1)
            .html(labor_row[i].State + " in "
                  + labor_row[i].Year +": " + labor_row[i].Value)
            .style("left", `${event.screenX+10}px`)
            .style("top", `${event.screenY - 100}px`)
          })
        .on("mousemove", function(event, d) {
          labor_tooltip
          .html(labor_row[i].State + " in "
                + labor_row[i].Year +": " + labor_row[i].Value)
          .style("left", `${event.layerX+10}px`)
          .style("top", `${event.layerY}px`)
      })
        .on("mouseleave", function(event, d) {
          d3.selectAll("."+item)
            .attr("stroke-width", 1.5)
            .style("font-weight", "normal")
            .style("color", "black");

          labor_tooltip
          .style("opacity", 0);
        });

        prev_point = [x(labor_row[i].Year), y(labor_row[i].Value)];

    };
      state_count++;
    })


  })
}

//--------------------------------------------//
// Helper Functions for Viz #2
//--------------------------------------------//

let states_selected = [];

//--------------------------------------------//
// Adds new state to Vis #2
//--------------------------------------------//
function newLine(){
  let newState = document.getElementById("selector").value;
  if (!states_selected.includes(newState)){
    states_selected.push(newState);
    dispKey();
  }
  build_pesticide(states_selected, false);
  build_fertilizer(states_selected, false);
  build_energy_input(states_selected, false);
  build_labor_input(states_selected, false);

  let key = document.getElementById("list");

  d3.selectAll().remove();
}

//--------------------------------------------//
// Removes state from Vis #2
//--------------------------------------------//
function removeLine(){
  let newState = document.getElementById("selector").value;

  d3.selectAll(newState).remove();

  if (states_selected.includes(newState)){
    const index = states_selected.indexOf(newState);
    states_selected.splice(index, 1);

    build_pesticide(states_selected, false);
    build_fertilizer(states_selected, false);
    build_energy_input(states_selected, false);
    build_labor_input(states_selected, false);

    dispKey();
  }
}

//--------------------------------------------//
// Builds legend for Vis #2
//--------------------------------------------//
function dispKey() {
  let state_count = 0;
  d3.select("#list").remove();

  let svg = d3.select("#viz2key")
    .append("svg")
    .attr("id", "list")
    .attr("height", 800)
    .attr("width", 100);

  svg.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text("Key")
    .style("font-size", "15px")
    .attr("alignment-baseline","middle");

  let firstCirclePos = 45;

  states_selected.forEach(item => {
    let alreadyClicked = false;
    svg.append("circle")
      .attr("cx",20)
      .attr("cy",firstCirclePos)
      .attr("r", 6)
      .style("fill", colors[state_count]);
    svg.append("text")
      .attr("x", 40)
      .attr("y", firstCirclePos)
      .attr("id", item)
      .text(item)
      .style("font-size", "12px")
      .attr("alignment-baseline","middle")
      .on("click", function() {
        if (alreadyClicked) {
          d3.selectAll("." + item)
          .attr("stroke-width", 1.5)
          .style("font-weight", "normal")
          .style("color", "black")
        } else {
          d3.selectAll("."+item)
          .attr("stroke-width", 5)
          .style("font-weight", "bolder")
          .style("color", states_colors[item])
          alreadyClicked = true;
        }
      });
    firstCirclePos = firstCirclePos + 20;

    document.getElementById(item).style.cursor = "pointer";

    state_count ++;
  })
}

//--------------------------------------------//
// RUN FUNCTIONS TO BUILD PLOTS
//--------------------------------------------//
build_pesticide([], true);
build_fertilizer([], true);
build_energy_input([], true);
build_labor_input([], true);
build_outputs();
build_stacked_outputs();
dispKey();
