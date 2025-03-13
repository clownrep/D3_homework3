// Set up margin and dimensions for all plots
const margin = { top: 50, right: 30, bottom: 80, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// === BOX PLOT: Social Media Likes Distribution ===
d3.select("body")
  .append("h2")
  .text("Social Media Likes Distribution");

// Create SVG for Box Plot
const boxplotSVG = d3.select("body")
                     .append("svg")
                     .attr("width", width + margin.left + margin.right)
                     .attr("height", height + margin.top + margin.bottom)
                     .append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);

// Load Box Plot Data
d3.csv("C:\Users\holli\OneDrive\Desktop\D3_homework3\socialMedia.csv").then(data => {
    data.forEach(d => d.Likes = +d.Likes);
    
    // Define scales
    const xScale = d3.scaleBand().domain([...new Set(data.map(d => d.Platform))])
                     .range([0, width]).padding(0.1);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.Likes)])
                     .range([height, 0]);

    // Append X & Y Axes
    boxplotSVG.append("g").attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(xScale));

    boxplotSVG.append("g").call(d3.axisLeft(yScale));

    // Placeholder for Box Plot Elements
    // (You would add the quartile calculations and drawing logic here)
});

// === BAR PLOT: Average Likes by Platform and Post Type ===
d3.select("body")
  .append("h2")
  .text("Average Likes by Platform and Post Type");

// Create SVG for Bar Plot
const barplotSVG = d3.select("body")
                     .append("svg")
                     .attr("width", width + margin.left + margin.right)
                     .attr("height", height + margin.top + margin.bottom)
                     .append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);

// Load Bar Plot Data
d3.csv("C:\Users\holli\OneDrive\Desktop\D3_homework3\socialMediaAvg.csv").then(data => {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const x0 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.Platform))])
                 .range([0, width]).padding(0.1);

    const x1 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.PostType))])
                 .range([0, x0.bandwidth()]).padding(0.05);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)])
                .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                         .domain([...new Set(data.map(d => d.PostType))]);

    // Append X & Y Axes
    barplotSVG.append("g").attr("transform", `translate(0,${height})`)
               .call(d3.axisBottom(x0));

    barplotSVG.append("g").call(d3.axisLeft(y));

    // Add bars
    const groups = barplotSVG.selectAll(".barGroup")
                     .data(data)
                     .enter()
                     .append("g")
                     .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    groups.append("rect")
          .attr("x", d => x1(d.PostType))
          .attr("width", x1.bandwidth())
          .attr("y", d => y(d.AvgLikes))
          .attr("height", d => height - y(d.AvgLikes))
          .attr("fill", d => colorScale(d.PostType));
});

// === LINE PLOT: Average Likes Over Time ===
d3.select("body")
  .append("h2")
  .text("Average Likes Over Time");

// Create SVG for Line Plot
const lineplotSVG = d3.select("body")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

// Load Line Plot Data
d3.csv("C:\Users\holli\OneDrive\Desktop\D3_homework3\socialMediaTime.csv").then(data => {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const xScale = d3.scaleBand()
                     .domain(data.map(d => d.Date))
                     .range([0, width]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.AvgLikes)])
                     .range([height, 0]);

    const line = d3.line()
                   .x(d => xScale(d.Date) + xScale.bandwidth() / 2)
                   .y(d => yScale(d.AvgLikes))
                   .curve(d3.curveNatural);

    // Append path for the line
    lineplotSVG.append("path")
               .datum(data)
               .attr("fill", "none")
               .attr("stroke", "steelblue")
               .attr("stroke-width", 2)
               .attr("d", line);

    // Add x-axis
    lineplotSVG.append("g")
               .attr("transform", `translate(0, ${height})`)
               .call(d3.axisBottom(xScale))
               .selectAll("text")
               .style("text-anchor", "end")
               .attr("transform", "rotate(-25)");

    // Add y-axis
    lineplotSVG.append("g").call(d3.axisLeft(yScale));
});