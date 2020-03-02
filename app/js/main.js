// using d3 for convenience
var main = d3.select('main')
var scrolly = main.select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');



d3.json('/interactive/2020/02/science-gender-gap/scrolly-graph/data/metrics-wos2017-l-1A.json')
    // d3.json('/interactive/2020/02/gender_gap_scroll/data/metrics-wos2017-l-1A.json')
    .then(function(data) {

        var dataFilter = data.filter(function(num) {
            // return num.year >= 1955;
            return num.year >= 1954 && num.year < 2007;
        });

        //create width and height and the margins of the d3 graphic
        var width = d3.select("figure").node().getBoundingClientRect().width;

        // var width = window.innerWidth;
        var height = window.innerHeight;
        var margin = {
            top: 20,
            bottom: 40,
            left: 50,
            right: 40,
        };

        var svg = scrolly.select("figure")
            .append("svg")
            .attr("class", "chart_container")
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom);

        var figureHeight = height * 2 / 3;
        var figureMarginTop = (height - figureHeight) * 2 / 3;


        var dataMax = d3.extent(dataFilter, function(d) {
            // console.log(d);
            return d.year;
            // if(d.year >= 1955){
            // return d.year;
            // }
        });

        function canvas_clear() {

            svg
                .selectAll(".stackLayers")
                .remove();

            svg
                .selectAll(".annotation-group")
                .remove();

            svg
                .selectAll(".dotted-line")
                .remove();

            svg
                .selectAll(".dot")
                .remove();

            svg
                .selectAll(".dotted-line-2")
                .remove();

            svg
                .selectAll(".dot-2")
                .remove();

        }

        var keys = d3.keys(data[0]).filter(function(key) {

            return key !== "year" && key !== "unknown";

        });

        var x = d3.scaleLinear()
            .domain(dataMax)
            .range([0, width * 0.90]);
        var xAxis = d3.axisBottom(x)
        .ticks(10)
        .tickSize(0)
        // .tickFormat(d3.format("d"));
        .tickFormat(function(d,i){
            if(width < 600){
                return i%3 !== 1 ? " ": d;

            }
            else{
                return d;
            }

            });
        // .tickSize(0);
        svg.append("g")
            .attr("class", "x-axis");
        // .attr("transform", "translate(" + margin.left + "," + (figureHeight + 5) + ")")
        // .call(xAxis);

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {
                return +d.male;
            }) * 1 / 3])
            .range([figureHeight, 0]);

        var yAxis = d3.axisLeft(y)
            .tickSize(0);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + margin.left + ",5)");
        // .call(yAxis);

        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(['#e41a1c', '#377eb8']);

        var keyLabels = ["Male", "Female"];

        var circle = svg.selectAll("circle")
            .enter().append("circle")
            .attr("r", 10);

        circle.data(keyLabels.reverse())
            .enter().append("circle")
            .attr("class", "label-circle")
            // .attr("cx", function(d, i) {
            //     return (width / 2 - margin.left) + i * 100;
            // })
            // .attr("cy", function(d, i) {
            //     return 10;
            // })
            .attr("r", 10)
            .attr("fill", function(d) {
                return color(d);
            });

        svg.selectAll("myLabels")
            .data(keyLabels)
            .enter().append("text")
            .attr("class", "label-text")
            // .attr("x", function(d, i) {
            //     return ((width / 2 - margin.left) + 20) + i * 100;
            // })
            // .attr("y", function(d, i) {
            //     return 15;
            // })
            .style("fill", function(d) {
                return color(d);
            })
            .text(function(d) {
                return d;
            })
            .attr("font-weight", 600)
            .attr("font-size", "16px")
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


        var stackedData = d3.stack()
            .keys(keys)
            (dataFilter);

        svg
            .selectAll("myLayers")
            .data(stackedData.reverse())
            .enter()
            .append("path")
            .attr("class", "stackLayers");
        // .attr("fill", function(d) {
        //     // console.log(color(d.key));
        //     return color(d.key);
        // })
        // .attr("stroke", "none")
        // .attr("transform", "translate(" + margin.left + ",5)")
        // .attr("d", d3.area()
        //     .x(function(d, i) {
        //
        //         return x(d.data.year);
        //     })
        //     .y0(function(d) {
        //         return y(d[0]);
        //     })
        //     .y1(function(d) {
        //         return y(d[1]);
        //     })
        // );


        function resizeChart() {
            width = d3.select("figure").node().getBoundingClientRect().width,
                width = width - margin.left - margin.right;

            x.range([0, width * 0.90]);
            y.range([figureHeight, 0]);

            svg.select(".x-axis")
                .attr("transform", "translate(" + margin.left + "," + (figureHeight + 5) + ")")
                .call(xAxis);

            svg.select(".y-axis")
                .attr("transform", "translate(" + margin.left + ",5)")
                .call(yAxis);


            svg.selectAll(".stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);
                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })

                );

            svg.selectAll(".label-text")
                .attr("x", function(d, i) {
                    return ((width / 2 - margin.left) + 20) + i * 100;
                })
                .attr("y", function(d, i) {
                    return 15;
                });

            svg.selectAll(".label-circle")
                .attr("cx", function(d, i) {
                    return (width / 2 - margin.left) + i * 100;
                })
                .attr("cy", function(d, i) {
                    return 10;
                });

            svg.selectAll(".dotted-line")
                .attr("x1", function(d) {


                    // return d.year === 1955;
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y2", figureHeight);

            svg.selectAll(".dot")
                .attr("cx", function(d) {

                    return x(d[1].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[1].data.female);
                });

            svg.selectAll(".dotted-line-2")
                .attr("x1", function(d) {

                    // console.log(d.length);
                    // return d.year === 1955;
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y2", figureHeight);

            svg.selectAll(".dot-2")
                .attr("cx", function(d) {

                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[d.length - 2].data.female) + 5;
                });

            svg.selectAll("#text-label-fem")
            .attr("x", function(d) {
                return x(d[d.length - 2].data.year) * 6.5 / 8;
            })
            .attr("y", function(d) {
                return height - (y(d[d.length - 1].data.female) * 4 / 5);
                // return  height - (y(d[d.length -1].data.female)/2);
            })
            .transition()
            .delay(3000)
            .duration(3000)
            .attr("fill", "#fff")
            // .attr("font-size", "30px")
            // .attr("font-weight", 600)
            .text("27.1%");

            svg.selectAll("#text-label-male")
            .attr("x", function(d) {
                return x(d[d.length - 2].data.year) * 6.5 / 8;
            })
            .attr("y", function(d) {
                return y(d[d.length - 1].data.male);
            })
            .transition()
            .delay(2000)
            .duration(3000)
            .attr("fill", "#fff")
            // .attr("font-size", "30px")
            // .attr("font-weight", 600)
            .text("72.9%");


        }



        function sec_1() {
            canvas_clear();


            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers");
            // .attr("fill", function(d) {
            //     // console.log(color(d.key));
            //     return color(d.key);
            // })
            // .attr("stroke", "none")
            // .attr("transform", "translate(" + margin.left + ",5)")
            // .attr("d", d3.area()
            //     .x(function(d, i) {
            //
            //         return x(d.data.year);
            //     })
            //     .y0(function(d) {
            //         return y(d[0]);
            //     })
            //     .y1(function(d) {
            //         return y(d[1]);
            //     })
            // );

            resizeChart();
            d3.select(window).on('resize.one', resizeChart);




        }

        function sec_2() {

            canvas_clear();
            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);

                })
                .attr("stroke-width", function(d) {
                    // console.log(d.key)
                    if (d.key === "female") {
                        return 5;
                    }

                })
                .attr("stroke", "white")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr('opacity', 1)
                .transition()
                .ease(d3.easeLinear)
                .duration(1000)
                .attr('opacity', function(d) {
                    if (d.key === "female") {
                        return 1;
                    } else {
                        return 0.2;

                    }
                })
                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);

                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })
                );




            svg.append("line")
                .data(stackedData.reverse())
                .attr("class", "dotted-line")
                .attr("stroke", "#000")
                .attr("stroke-dasharray", "6,6")
                .attr("stroke-width", 2)
                .attr("x1", function(d) {


                    // return d.year === 1955;
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[1].data.year) + margin.left;
                })
                .attr("y2", figureHeight);



            circle
                .data(stackedData.reverse())
                .enter()
                .append("circle")
                // .attr("id", "dot")
                .attr("r", 7)
                .attr("stroke", "white")
                .attr("class", "dot")
                .attr("cx", function(d) {

                    return x(d[1].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[1].data.female);
                });


                var labels = [{

                }]

                var annotations = [{
                    // type: d3.annotationCalloutCircle,
                    data:{
                        year:dataFilter[1].year,
                        comment: "12.3% authors are female."
                    },
                    // note: {
                    //
                    //     title: "1955",
                    //     label: "12.3% authors are female."
                    // },
                    connector: {
                        end: "arrow" // 'dot' also available
                    },
                    //settings for the subject, in this case the circle radius
                    subject: {
                        radius: 20
                    },
                    // x: x(dataFilter[1].year) + margin .left,
                    // y: y(dataFilter[1].female),
                    dy: -57,
                    dx: 162
                }].map(function(d) {
                    d.color = "#000";
                    d.note = Object.assign(
                        {}, d.note, {
                            title: d.data.year,
                            label: d.data.comment
                        }
                    )
                    return d;
                });

                var xLabel = x(dataFilter[1].year);
                var yLabel = y(dataFilter[1].female);
                var makeAnnotations = d3.annotation()
                    // .type(d3.annotationLabel)
                    .annotations(annotations)
                    .type(d3.annotationCalloutCircle)
                    .accessors({ x: function x(d) {
                         return xLabel + margin.left;
                       },
                       y: function y(d) {
                         return yLabel;
                       }
                   });
                svg
                    .append("g")
                    // .data(stackedData.reverse())
                    .attr("class", "annotation-group")
                    .call(makeAnnotations);

            //     .attr("class", "stackLayers")
            //     .attr("id", "annotation-group")
            //     .call(makeAnnotations);


            function resizeAnnotation(){

                width = d3.select("figure").node().getBoundingClientRect().width,
                    width = width - margin.left - margin.right;

                x.range([0, width * 0.90]);
                y.range([figureHeight, 0]);

                console.log(width);

                var xLabel = x(dataFilter[1].year);
                // console.log(xLabel);
                var yLabel = y(dataFilter[1].female);
                // console.log(yLabel);

                var makeAnnotations = d3.annotation()
                    // .type(d3.annotationLabel)
                    .annotations(annotations)
                    .type(d3.annotationCalloutCircle)
                    .accessors({ x: function x(d) {
                         return xLabel + margin.left;
                       },
                       y: function y(d) {
                         return yLabel;
                       }
                   });

               svg.selectAll(".annotation-group")
                    .call(makeAnnotations);


                // if(width < 400){
                //     makeAnnotations.type(d3.annotationBadge);
                //         svg.selectAll(".annotation-group").call(makeAnnotations);
                //
                // }


            }
            //
            resizeAnnotation();
            d3.select(window).on('resize.two', resizeAnnotation);
            // if(width< 400){
            //     makeAnnotations.type(d3.annotationBadge);
            //     svg.select(".annotation-group").call(makeAnnotations);
            // }


        }

        function sec_3() {


            canvas_clear();
            svg
                .selectAll("myLayers")
                .data(stackedData.reverse())
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("stroke-width", function(d) {
                    // console.log(d.key)
                    if (d.key === "female") {
                        return 5;
                    }


                })
                .attr("opacity", function(d) {
                    if (d.key === "female") {
                        return 1;
                    } else {
                        return 0.2;

                    }
                })
                .attr("stroke", "white")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", d3.area()
                    .x(function(d, i) {

                        return x(d.data.year);

                    })
                    .y0(function(d) {
                        return y(d[0]);
                    })
                    .y1(function(d) {
                        return y(d[1]);
                    })
                );

            // console.log(stackedData)

            svg.append("line")
                .data(stackedData.reverse())
                .attr("class", "dotted-line-2")
                .attr("stroke", "#000")
                .attr("stroke-dasharray", "6,6")
                .attr("stroke-width", 2)
                .attr("x1", function(d) {

                    // console.log(d.length);
                    // return d.year === 1955;
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y1", 0)
                .attr("x2", function(d) {
                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .attr("y2", figureHeight);

            // svg.selectAll("circle")
            circle
                .data(stackedData.reverse())
                .enter()
                .append("circle")
                // .attr("id", "dot")
                .attr("r", 7)
                .attr("stroke", "white")
                .attr("class", "dot-2")
                .attr("cx", function(d) {

                    return x(d[d.length - 2].data.year) + margin.left;
                })
                .transition()
                .duration(2000)
                .attr("cy", function(d) {

                    return y(d[d.length - 2].data.female) + 5;
                });

            var annotations = [{
                // type: d3.annotationCalloutCircle,
                // note: {
                //
                //     title: "2005",
                //     label: "35.4% authors are female."
                // },
                data:{
                    year:dataFilter[dataFilter.length - 2].year,
                    comment: "12.3% authors are female."
                },
                connector: {
                    end: "arrow" // 'dot' also available
                },
                //settings for the subject, in this case the circle radius
                subject: {
                    radius: 20
                },
                // x: x(dataFilter[dataFilter.length - 2].year) + margin.left,
                // y: y(dataFilter[dataFilter.length - 2].female) + 5,
                dy: -87,
                dx: -180
            }].map(function(d) {
                d.color = "#000";
                d.note = Object.assign(
                    {}, d.note, {
                        title: d.data.year,
                        label: d.data.comment
                    }
                )
                return d;
            })

            var xLabel = x(dataFilter[dataFilter.length - 2].year);
            var yLabel = y(dataFilter[dataFilter.length - 2].female);
            var makeAnnotations = d3.annotation()
                // .type(d3.annotationLabel)
                .annotations(annotations)
                .type(d3.annotationCalloutCircle)
                .accessors({ x: function x(d) {
                     return xLabel + margin.left;
                   },
                   y: function y(d) {
                     return yLabel;
                   }
               });

               svg
                   .append("g")
                   // .data(stackedData.reverse())
                   .attr("class", "annotation-group")
                   .call(makeAnnotations);

                   function resizeAnnotation(){

                       width = d3.select("figure").node().getBoundingClientRect().width,
                           width = width - margin.left - margin.right;

                       x.range([0, width * 0.90]);
                       y.range([figureHeight, 0]);

                       console.log(width);

                       var xLabel = x(dataFilter[dataFilter.length - 2].year);
                       // console.log(xLabel);
                       var yLabel = y(dataFilter[dataFilter.length - 2].female);
                       // console.log(yLabel);

                       var makeAnnotations = d3.annotation()
                           // .type(d3.annotationLabel)
                           .annotations(annotations)
                           .type(d3.annotationCalloutCircle)
                           .accessors({ x: function x(d) {
                                return xLabel + margin.left;
                              },
                              y: function y(d) {
                                return yLabel;
                              }
                          });

                      svg.selectAll(".annotation-group")
                           .call(makeAnnotations);


                       // if(width < 400){
                       //     makeAnnotations.type(d3.annotationBadge);
                       //         svg.selectAll(".annotation-group").call(makeAnnotations);
                       //
                       // }


                   }
                   //
                   resizeAnnotation();
                   d3.select(window).on('resize.three', resizeAnnotation);
        }

        function sec_4() {
            canvas_clear();

            var initialarea = d3.area()
                .x(function(d) {
                    return x(d.data.year);
                })
                .y0(figureHeight + 5)
                .y1(figureHeight + 5);


            var area = d3.area()
                .x(function(d, i) {

                    return x(d.data.year);
                })
                .y0(function(d) {
                    return y(d[0]);
                })
                .y1(function(d) {
                    return y(d[1]);
                });

            svg
                .selectAll("myLayers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", "stackLayers")
                .attr("fill", function(d) {
                    // console.log(color(d.key));
                    return color(d.key);
                })
                .attr("stroke", "none")
                .attr("transform", "translate(" + margin.left + ",5)")
                .attr("d", initialarea)
                .transition()
                .duration(2000)
                .attr("d", area);


            svg.append("text")
                .data(stackedData)
                // .attr("class", "text-label")
                .attr("x", function(d) {
                    return x(d[d.length - 2].data.year) * 7 / 8;
                })
                .attr("y", function(d) {
                    return height - (y(d[d.length - 1].data.female) * 4 / 5);
                    // return  height - (y(d[d.length -1].data.female)/2);
                })
                .transition()
                .delay(3000)
                .duration(3000)
                .attr("class", "stackLayers")
                .attr("id", "text-label-fem")
                .attr("fill", "#fff")
                // .attr("font-size", "30px")
                // .attr("font-weight", 600)
                .text("27.1%");

            svg.append("text")
                .data(stackedData.reverse())
                // .attr("class", "text-label-2")
                .attr("x", function(d) {
                    return x(d[d.length - 2].data.year) * 7 / 8;
                })
                .attr("y", function(d) {
                    return y(d[d.length - 1].data.male);
                })
                .transition()
                .delay(2000)
                .duration(3000)
                .attr("class", "stackLayers")
                .attr("id", "text-label-male")
                // .attr("dy", "0.71em")
                .attr("fill", "#fff")
                // .attr("font-size", "30px")
                // .attr("font-weight", 600)
                .text("72.9%");


        }

        resizeChart();
        d3.select(window).on('resize.one', resizeChart);
        // initialize the scrollama
        var scroller = scrollama();

        var activateFunctions = [];
        activateFunctions[0] = sec_1;
        activateFunctions[1] = sec_2;
        activateFunctions[2] = sec_3;
        activateFunctions[3] = sec_4;

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(height * 0.75);
            step.style('height', stepH + 'px');



            figure
                .style('height', figureHeight + 'px')
                .style('top', figureMarginTop + 'px');


            // 3. tell scrollama to update new element dimensions
            scroller.resize();
        }

        // scrollama event handlers
        function handleStepEnter(response) {
            // console.log(response)
            // response = { element, direction, index }

            // add color to current step only
            step.classed('is-active', function(d, i) {
                return i === response.index;
            })

            // update graphic based on step
            figure.select('p').text(response.index + 1);
            figure.call(activateFunctions[response.index]);
        }

        function setupStickyfill() {
            d3.selectAll('.sticky').each(function() {
                Stickyfill.add(this);
            });
        }

        function init() {
            setupStickyfill();

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // 		this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            scroller.setup({
                    step: '#scrolly article .step',
                    offset: 0.60,
                    debug: false,
                    // debug: false,
                })
                .onStepEnter(handleStepEnter)


            // setup resize event
            window.addEventListener('resize', handleResize);
        }

        // kick things off
        init();
    }).catch(function(error) {
        // handle error
    });
