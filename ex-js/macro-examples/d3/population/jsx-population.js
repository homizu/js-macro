expression λ {
    identifier: d;
    expression: e;
    { _ (d -> e) => function (d) { return e; } }
}

expression translate {
    expression: tx, ty;
    literal: s;
    { _ (tx, ty, s) => "translate(" + tx + ", " + ty + ")scale(-1, -1)" }
    { _ (tx, ty) => "translate(" + tx + ", " + ty + ")" }
}

expression add {
    expression: s,t,e1,e2,f1,f2;
    { _ (s) {} => s }
    { _ (s) { [#e1:f1#], [#e2:f2#], ... } => add(s.attr(e1,f1)) { e2:f2, ... } }
    { _ (s,t) { [#e1:f1#], ... } => add(s.append(t)) { e1:f1, ... } }
}

$(function () {
    var width = 960,
    height = 500;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([0, height - 40]);

    // An SVG element with a bottom-right origin.
    var svg = add((add(d3.select("#chart-macro"), "svg")
                      { "with": width, "height": height }).style("padding-right", "30px"), "g")
                 { "transform": translate(x(1), (height - 20), s) };

    // A sliding container to hold the bars.
    var body = svg.append("g")
        .attr("transform", translate(0,0));

    // A container to hold the y-axis rules.
    var rules = add(svg, "g"){};

    // A label for the current year.
    var title = (add(svg, "text")
                    { "class": "title", "dy": ".71em", "transform": translate(x(1), y(1), s) })
                .text(2000);

    d3.csv("population.csv", function(data) {
        var age0, age1, year0, year1, year, years;
        
        function redraw() {
            if (!(year in data)) return;
            title.text(year);

            body.transition()
                .duration(750)
                .attr("transform", λ(d -> translate(x(year - year1), 0)));

            years.selectAll("rect")
                .data(λ(d -> data[year][d] || [0, 0]))
                .transition()
                .duration(750)
                .attr("height", y);
        }

        // Convert strings to numbers.
        data.forEach(function(d) {
            d.people = +d.people;
            d.year = +d.year;
            d.age = +d.age;
        });

        // Compute the extent of the data set in age and years.
        age0 = 0,
        age1 = d3.max(data, λ(d -> d.age)),
        year0 = d3.min(data, λ(d -> d.year)),
        year1 = d3.max(data, λ(d -> d.year)),
        year = year1;

        // Update the scale domains.
        x.domain([0, age1 + 5]);
        y.domain([0, d3.max(data, λ(d -> d.people))]);

        // Add rules to show the population values.
        rules = add(rules.selectAll(".rule").data(y.ticks(10)).enter(), "g")
                   { "class": "rule", "transform": λ(d -> translate(0, y(d))) };

        add(rules, "line") { "x2": width };

        (add(rules, "text")
            { "x": 6, "dy": ".35em", "transform": "rotate(180)" })
        .text(λ(d -> Math.round(d / 1e6) + "M"));

        // Add labeled rects for each birthyear.
        years = add(body.selectAll("g").data(d3.range(year0 - age1, year1 + 5, 5)).enter(), "g")
                   { "transform": λ(d -> translate(x(year1 - d), 0)) };

        add(years.selectAll("rect").data(d3.range(2)).enter(), "rect")
           { "x": 1, "width": x(5) - 2, "height": 1e-6 };

        (add(years, "text")
            { "y": -6, "x": -x(5) / 2, "transform": "rotate(180)", "text-anchor": "middle"})
        .style("fill", "#fff")
        .text(String);

        // Add labels to show the age.
        (add((add(svg, "g"){}).selectAll("text").data(d3.range(0, age1 + 5, 5)).enter(), "text")
            { "text-anchor": "middle", "transform": λ(d -> translate((x(d) + x(5) / 2), -4, s)),
              "dy": ".71em" })
        .text(String);

        // Nest by year then birthyear.
        data = d3.nest()
            .key(λ(d -> d.year))
            .key(λ(d -> d.year - d.age))
            .rollup(λ(v -> v.map(λ(d -> d.people))))
            .map(data);

        // Allow the arrow keys to change the displayed year.
        d3.select(window).on("keydown", function() {
            switch (d3.event.keyCode) {
            case 37: year = Math.max(year0, year - 10); break;
            case 39: year = Math.min(year1, year + 10); break;
            }
            redraw();
        });

        redraw();

    });
});