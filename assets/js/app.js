var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function xScale(censusData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.85,
        d3.max(censusData, d => d[chosenXAxis]) * 1.15
        ])
        .range([0, width]);

    return xLinearScale;

}

function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.85,
        d3.max(censusData, d => d[chosenYAxis]) * 1.15
        ])
        .range([height, 0]);

    return yLinearScale;

}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(100)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(100)
        .call(leftAxis);

    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(100)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderLabels(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circleLabels.transition()
        .duration(100)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 3);

    return circleLabels;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age:";
    }
    else {
        xlabel = "Income:";
    }

    var ylabel;

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity:";
    }
    else if (chosenYAxis === "smoking") {
        ylabel = "Smoking:";
    }
    else {
        ylabel = "Lacking Healthcare:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -80])
        .html(function (d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function (censusData, err) {
    if (err) throw err;

    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    var circleLabels = chartGroup.selectAll(null)
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]) + 3)
        .text(d => d.abbr)
        .attr("font-size", "9px")
        .attr("text-anchor", "middle")
        .attr("fill", "black");

    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "aqua")
        .attr("opacity", ".5");

    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("Poverty");

    var ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age");

    var incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Income");

    var labelsYGroup = chartGroup.append("g")
        .attr("transform", `rotate(-90)`);

    var obesityLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") 
        .classed("active", true)
        .text("Obese");

    var smokeLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smoking") 
        .classed("inactive", true)
        .text("Smoking");

    var healthcareLabel = labelsYGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") 
        .classed("inactive", true)
        .text("Lacking Healthcare");

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    labelsXGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                chosenXAxis = value;

                xLinearScale = xScale(censusData, chosenXAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                yAxis = renderYAxes(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }


        });

    labelsYGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                chosenYAxis = value;

                yLinearScale = yScale(censusData, chosenYAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                yAxis = renderYAxes(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smoking") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }


        });
}).catch(function (error) {
    console.log(error);
});