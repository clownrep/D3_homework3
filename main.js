// Set up SVG dimensions
const width = 600, height = 400, margin = { top: 50, right: 50, bottom: 100, left: 80 };

// Box plot section
d3.csv("socialMedia.csv").then(data => {
    // Convert "Likes" to numeric
    data.forEach(d => d.Likes = +d.Likes);

    // Compute quartiles for each platform
    const rollupFunction = d => {
        const likes = d.map(v => v.Likes).sort(d3.ascending);
        const q1 = d3.quantile(likes, 0.25);
        const median = d3.quantile(likes, 0.5);
        const q3 = d3.quantile(likes, 0.75);
        const min = d3.min(likes);
        const max = d3.max(likes);
        return { q1, median, q3, min, max };
    };
    
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);
    const platforms = Array.from(quartilesByPlatform.keys());

    // Create scales
    const xScale = d3.scaleBand().domain(platforms).range([margin.left, width - margin.right]).padding(0.5);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.Likes)]).nice().range([height - margin.bottom, margin.top]);

    // Create SVG
    const svg = d3.select("#boxplot").append("svg").attr("width", width).attr("height", height);

    // Draw boxes
    quartilesByPlatform.forEach((quartiles, platform) => {
        const x = xScale(platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical line (min to max)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");

        // Draw box (q1 to q3)
        svg.append("rect")
            .attr("x", x)
            .attr("width", boxWidth)
            .attr("y", yScale(quartiles.q3))
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });

    // Add axes
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(yScale));

    // Add title
    svg.append("text").attr("x", width / 2).attr("y", 20).attr("text-anchor", "middle").text("Likes Distribution by Platform");
});

// Bar Plot section
d3.csv("socialMediaAvg.csv").then(data => {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Scales
    const x0 = d3.scaleBand().domain(platforms).range([margin.left, width - margin.right]).padding(0.2);
    const x1 = d3.scaleBand().domain(postTypes).range([0, x0.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height - margin.bottom, margin.top]);
    const color = d3.scaleOrdinal().domain(postTypes).range(["steelblue", "orange", "green"]);

    const svg = d3.select("#barplot").append("svg").attr("width", width).attr("height", height);

    // Group data by platform
    const groups = svg.selectAll("g").data(data).enter().append("g")
        .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars
    groups.selectAll("rect")
        .data(d => [d])
        .enter().append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add axes
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x0));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y));

    // Add title
    svg.append("text").attr("x", width / 2).attr("y", 20).attr("text-anchor", "middle").text("Average Likes by Platform & Post Type");
});

// Line plot section
d3.csv("socialMediaTime.csv").then(data => {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    // Parse date
    const parseDate = d3.timeParse("%m/%d/%Y (%A)");
    data.forEach(d => d.Date = parseDate(d.Date));

    const x = d3.scaleTime().domain(d3.extent(data, d => d.Date)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height - margin.bottom, margin.top]);

    const svg = d3.select("#lineplot").append("svg").attr("width", width).attr("height", height);

    // Line generator
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);

    // Draw line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add axes
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y));

    // Add title
    svg.append("text").attr("x", width / 2).attr("y", 20).attr("text-anchor", "middle").text("Likes Over Time");
});
