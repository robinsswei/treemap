/*global $*/
$(function(){

  var counter = 0;
  window.uniqueId = function(){
      return 'id-' + counter++
  }

  // global variables
  var main = $("#main")
  var margin = {top: 30, right: 0, bottom: 20, left: 0}
  var showCpu = false,
      showDisk = false,
      showMem = false

  var cpuData = {},
      diskData = {},
      memData = {},
      allcpu = {},
      alldisk = {},
      allmem = {}

  var fetchCpuData = function(){
    // return $.getJSON("../api/heatmap/cpu").then(function(data){
    return d3.json("data/cpu.json", function(error, data){
        window.data = data
        cpuData = window.cpuData = parseData(data)

        if(data["cpuTotal"] > 0) createTreemap("cpu", cpuData)
        // allcpu = getVMContainers(data, "allcpu")
    })
  }

  var fetchDiskData = function(){
    return $.getJSON("../api/heatmap/disk").then(function(data){
        diskData = data
        if(data["diskTotal"] > 0) showDisk = true
        alldisk = getVMContainers(data, "alldisk")
    })
  }

  var fetchMemData = function(){
    return $.getJSON("../api/heatmap/mem").then(function(data){
        memData = data
        if(data["memTotal"] > 0) showMem = true
        allmem = getVMContainers(data, "allmem")
    })
  }

  var fetchAllData = function() {
      return fetchCpuData()
              .then(fetchDiskData)
              .then(fetchMemData)
  }


  $.when(fetchCpuData())
  // $.when(fetchAllData())
   .then(function(){
      // console.log("cpu")
      // console.log(cpuData)
      // console.log("allcpu")
      // console.log(allcpu)
      createResponsibleLegend('legend')

      if(showCpu) createTreemap("cpu", cpuData)
      // if(showDisk) createTreemap("disk", diskData)
      // if(showMem) createTreemap("mem", memData)
  });

  function createResponsibleLegend(eleId){
    var width = $("#" + eleId).innerWidth(),
        formatNumber = d3.format(",%"),
        colorDomain = [0, 0.5, 1.0],
        // colorRange = ["#373a93", 'white', "#936638"],
        colorRange = ["#33A133", "#385238", "#873535"],
        sectionWidth = width/5

        // adding a color scale
    var color = d3.scale.linear()
        .domain(colorDomain)
        .range(colorRange)

    var legend = d3.select("#"+eleId).append("svg")
      .attr("width", width + margin.left + margin.right)
      // .attr("width", width)
      .attr("height", 30)
      .attr('class', 'legend')
      .selectAll("g")
          // .data([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])
          .data([0,1,2,3,4])
          .enter()
          .append('g')
    
    var legends = legend.append("g")
                  .attr("transform", function(d) { return "translate(1,1)"; })
                  .attr("class", "highlight")
                  .on("click", function(d){
                    console.log(d)
                    // TO-DO: Add event listener to filter the treemap
                  })
        
    legends.append("rect")
        .attr("x", function(d){return margin.left + d * sectionWidth})
        // .attr("x", function(d){return d * sectionWidth })
        .attr("y", 0)
        .attr("fill", function(d) {return color(colorIncrements(colorDomain, d))})
        .attr('width', sectionWidth +"px")
        .attr('height', '30px')

    legends.append("text")
            .text(function(d){return formatNumber(colorIncrements(colorDomain, d))})
            .attr('y', 20)
            // .attr('x', function(d){return margin.left + d * 80 + 40})
            .attr('x', function(d){return d * sectionWidth + sectionWidth/2})
  }

  // function createTreemap(mapName, root){
  //   var map = main.append("<div class='row treemap'></div>")
  //   map.append("<h3>"+ mapName + "</h3>")
  //   map.append("<div id='" + mapName + "'></div>")
  //   var width = $("#"+mapName).innerWidth(),
  //     height = 500,
  //     formatNumber = d3.format(",%"),
  //     colorDomain = [0, 0.5, 1.0],
  //     // colorRange = ["#373a93", 'white', "#936638"],
  //     colorRange = ["#33A133", "#742D2D", "#D62222"],
  //     transitioning;
  
  //   console.log("Treemap:")
  //   console.log("width: " + width + "; height: " + height)

  //   // sets x and y scale to determine size of visible boxes
  //   var x = d3.scale.linear()
  //       .domain([0, width])
  //       .range([0, width]);
    
  //   var y = d3.scale.linear()
  //       .domain([0, height])
  //       .range([0, height]);
    
  //   // adding a color scale
  //   var color = d3.scale.linear()
  //       .domain(colorDomain)
  //       .range(colorRange);
    
  //   // introduce color scale here
    
  //   var treemap = d3.layout.treemap()
  //       .children(function(d, depth) { return depth ? null : d._children; })
  //       .sort(function(a, b) { return a.value - b.value; })
  //       .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
  //       .round(false);
    
  //   var svg = d3.select("#"+mapName).append("svg")
  //       .attr("width", width)
  //       .attr("height", height)
  //       .style("margin-left", -margin.left + "px")
  //       .style("margin.right", -margin.right + "px")
  //     .append("g")
  //       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //       .style("shape-rendering", "crispEdges")
  //       .attr("id", uniqueId)
    
  //   var grandparent = svg.append("g")
  //       .attr("class", "grandparent")
  //       .attr("id", uniqueId)
    
  //   grandparent.append("rect")
  //       .attr("y", -margin.top)
  //       .attr("width", width)
  //       .attr("height", margin.top)
  //       .attr("id", uniqueId)
    
  //   grandparent.append("text")
  //       .attr("x", 6)
  //       .attr("y", 6 - margin.top)
  //       .attr("dy", ".75em")
  //       .attr("id", uniqueId)

  //   initialize(root);
  //   accumulate(root);
  //   layout(root);
  //   display(root);
  
  //   function display(d) {
  //     grandparent
  //         .datum(d.parent)
  //         .on("click", transition)
  //       .select("text")
  //         .text(name(d))
  //         .attr("id", uniqueId)
  
  //     // color header based on grandparent's rate
  //     grandparent
  //       .datum(d.parent)
  //       .select("rect")
  //       // .attr("fill", function(){console.log(color(d.rate)); return color(d['colorRate'])})
  //       .attr("fill", "#cccccc")
  //       .attr("id", uniqueId)
  
  //     var g1 = svg.insert("g", ".grandparent")
  //         .datum(d)
  //         .attr("class", "depth")
  //         .attr("id", uniqueId)
  
  //     var g = g1.selectAll("g")
  //         .data(d._children)
  //       .enter().append("g")
  //               .attr("id", uniqueId)
  
  //     g.filter(function(d) { return d._children; })
  //         .classed("children", true)
  //         .on("click", transition);
  
  //     g.selectAll(".child")
  //         .data(function(d) { return d._children || [d]; })
  //       .enter().append("rect")
  //         .attr("class", "child")
  //         .attr("id", uniqueId)
  //         .call(rect);
  
  //     g.append("rect")
  //         .attr("class", "parent")
  //         .attr("id", uniqueId)
  //         .call(rect)
  //       .append("title")
  //         .text(function(d) {
  //           // console.log(typeof(d.value), d.value); 
  //           return d.name + ', value: ' + d.title + ', percent : ' + formatNumber(d.rate); 
  //         });
  
  //     g.append("text")
  //         .attr("dy", ".75em")
  //         .attr("id", uniqueId)
  //         .text(function(d) { return d.name; })
  //         // .call(text);
  //         .attr("x", function(d) { return x(d.x) + 6; })
  //         .attr("y", function(d) { return y(d.y) + 6; })
  //         .attr("fill", function (d) {return getContrast50(color(parseFloat(d.colorRate)))})
  //         // .each(fontSize)
  //         .each(wordWrap)

  //     function transition(d) {
  //       if (transitioning || !d) return;
  //       transitioning = true;
  
  //       var g2 = display(d),
  //           t1 = g1.transition().duration(750),
  //           t2 = g2.transition().duration(750);
  
  //       // Update the domain only after entering new elements.
  //       x.domain([d.x, d.x + d.dx]);
  //       y.domain([d.y, d.y + d.dy]);
  
  //       // Enable anti-aliasing during the transition.
  //       svg.style("shape-rendering", null);
  
  //       // Draw child nodes on top of parent nodes.
  //       svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
  
  //       // Fade-in entering text.
  //       g2.selectAll("text").style("fill-opacity", 0);
  
  //       // Transition to the new view.
  //       t1.selectAll("text").call(text).style("fill-opacity", 0);
  //       t2.selectAll("text").call(text).style("fill-opacity", 1);
        
  //       t1.selectAll("rect").call(rect);
  //       t2.selectAll("rect").call(rect);
        

  //       // Remove the old node when the transition is finished.
  //       t1.remove().each("end", function() {
  //         svg.style("shape-rendering", "crispEdges");
  //         transitioning = false;
  //       });
  //     }
  
  //     return g;
  //   }

  //   // functions
  //   function initialize(root) {
  //     root.x = root.y = 0;
  //     root.dx = width;
  //     root.dy = height;
  //     root.depth = 0;
  //   }

  //   // Compute the treemap layout recursively such that each group of siblings
  //   // uses the same size (1×1) rather than the dimensions of the parent cell.
  //   // This optimizes the layout for the current zoom state. Note that a wrapper
  //   // object is created for the parent node for each group of siblings so that
  //   // the parent’s dimensions are not discarded as we recurse. Since each group
  //   // of sibling was laid out in 1×1, we must rescale to fit using absolute
  //   // coordinates. This lets us use a viewport to zoom.
  //   function layout(d) {
  //     if (d._children) {
  //       // treemap nodes comes from the treemap set of functions as part of d3
  //       treemap.nodes({_children: d._children});
  //       d._children.forEach(function(c) {
  //         c.x = d.x + c.x * d.dx;
  //         c.y = d.y + c.y * d.dy;
  //         c.dx *= d.dx;
  //         c.dy *= d.dy;
  //         c.parent = d;
  //         // recursion
  //         layout(c);
  //       });
  //     }
  //   }

  //   function text(text) {
  //     text.attr("x", function(d) { return x(d.x) + 6; })
  //         .attr("y", function(d) { return y(d.y) + 6; })
  //         .attr("fill", function (d) {return getContrast50(color(parseFloat(d.colorRate)))})
  //   }

  //   function rect(rect) {
  //     rect.attr("x", function(d) { return x(d.x); })
  //         .attr("y", function(d) { return y(d.y); })
  //         .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
  //         .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
  //         .attr("fill", function(d){return color(parseFloat(d.colorRate));});
  //   }
  // }
  
  function createTreemap(mapName, root){
    var map = main.append("<div class='row treemap'></div>")
    map.append("<h3>"+ mapName + "</h3>")
    map.append("<div id='" + mapName + "'></div>")
		
    var width = $("#"+mapName).innerWidth(),
      height = 500,
      formatNumber = d3.format(",%"),
      colorDomain = [0, 0.5, 1.0],
      // colorRange = ["#373a93", 'white', "#936638"],
      colorRange = ["#33A133", "#742D2D", "#D62222"],
      transitioning;
  		
    console.log("Treemap:")
    console.log("width: " + width + "; height: " + height)

    // sets x and y scale to determine size of visible boxes
    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);
    
    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);
    
    // adding a color scale
    var color = d3.scale.linear()
        .domain(colorDomain)
        .range(colorRange);
    
    // introduce color scale here
    
    var treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);
    
    var svg = d3.select("#"+mapName).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges")
        .attr("id", uniqueId)
    
    var grandparent = svg.append("g")
        .attr("class", "grandparent")
        .attr("id", uniqueId)
    
    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top)
        .attr("id", uniqueId)
    
    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em")
        .attr("id", uniqueId)

    initialize(root);
    accumulate(root);
    layout(root);
    display(root);
  
    function display(d) {
      grandparent
          .datum(d.parent)
          .on("click", transition)
        .select("text")
          .text(name(d))
          .attr("id", uniqueId)
  
      // color header based on grandparent's rate
      grandparent
        .datum(d.parent)
        .select("rect")
        // .attr("fill", function(){console.log(color(d.rate)); return color(d['colorRate'])})
        .attr("fill", "#cccccc")
        .attr("id", uniqueId)
  
      var g1 = svg.insert("g", ".grandparent")
          .datum(d)
          .attr("class", "depth")
          .attr("id", uniqueId)
  
      var g = g1.selectAll("g")
          .data(d._children)
        .enter().append("g")
                .attr("id", uniqueId)
  
      g.filter(function(d) { return d._children; })
          .classed("children", true)
          .on("click", transition);
  
      g.selectAll(".child")
          .data(function(d) { return d._children || [d]; })
        .enter().append("rect")
          .attr("class", "child")
          .attr("id", uniqueId)
          .call(rect);
  
      g.append("rect")
          .attr("class", "parent")
          .attr("id", uniqueId)
          .call(rect)
        .append("title")
          .text(function(d) {
            // console.log(typeof(d.value), d.value); 
            return d.name + ', value: ' + d.title + ', percent : ' + formatNumber(d.rate); 
          });
  
      // g.append("text")
      //     .attr("dy", ".75em")
      //     .attr("id", uniqueId)
      //     .text(function(d) { return d.name; })
      //     // .call(text);
      //     .attr("x", function(d) { return x(d.x) + 6; })
      //     .attr("y", function(d) { return y(d.y) + 6; })
      //     .attr("fill", function (d) {return getContrast50(color(parseFloat(d.colorRate)))})
      //     // .each(fontSize)
      //     .each(wordWrap)
      
    /* Adding a foreign object instead of a text object, allows for text wrapping */
		g.append("foreignObject")
				.call(rect)
				/* open new window based on the json's URL value for leaf nodes */
				/* Firefox displays this on top 
				.on("click", function(d) { 
					if(!d.children){
						window.open(d.url); 
				}
			})*/
			.attr("class","foreignobj")
			.append("xhtml:div") 
			.attr("dy", ".75em")
			.html(function(d) { return '' +
				' <p class="title"> ' + d.name + '</p>' + 
				// ' <p> En 2014 : ' + d3.round(d.value,2) + ' Million(s) d\047euros </p>' + 
				// ' <p> 2013/2014 : ' + formatNumber(d.rate); 
				' <p>' + formatNumber(d.rate) + '</p>'
				;})
			.attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS
      
      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;
  
        var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);
  
        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);
  
        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);
  
        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
  
        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);
        g2.selectAll("foreignObject div").style("display", "none"); /*added*/
        
        // Transition to the new view.
        t1.selectAll("text").call(text).style("fill-opacity", 0);
        t2.selectAll("text").call(text).style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);

        /* Foreign object */
  		  t1.selectAll(".textdiv").style("display", "none"); /* added */
  		  t1.selectAll(".foreignobj").call(foreign); /* added */
  		  t2.selectAll(".textdiv").style("display", "block"); /* added */
  		  t2.selectAll(".foreignobj").call(foreign); /* added */ 			

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function() {
          svg.style("shape-rendering", "crispEdges");
          transitioning = false;
        });
      }
  
      return g;
    }

    // functions
    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d._children) {
        // treemap nodes comes from the treemap set of functions as part of d3
        treemap.nodes({_children: d._children});
        d._children.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          // recursion
          layout(c);
        });
      }
    }

    function text(text) {
      text.attr("x", function(d) { return x(d.x) + 6; })
          .attr("y", function(d) { return y(d.y) + 6; })
          .attr("fill", function (d) {return getContrast50(color(parseFloat(d.colorRate)))})
    }

    function rect(rect) {
      rect.attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
          .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
          .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
          .attr("fill", function(d){return color(parseFloat(d.colorRate));});
    }
    
    function foreign(foreign){ /* added */
			foreign.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}
  }
  
  function name(d) {
    return d.parent
        ? name(d.parent) + " / " + d.name
        : d.name;
  }
  
  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
      // recursion step, note that p and v are defined by reduce
        ? d.value = d.children.reduce(function(p, v) {return p + accumulate(v); }, 0)
        : d.value;
  }


  // determines if white or black will be better contrasting color
  function getContrast50(hexcolor){
      return (parseInt(hexcolor.replace('#', ''), 3) > 0xffffff/3) ? 'black':'white';
  }

  function colorIncrements(colorDomain, d){
    return (colorDomain[colorDomain.length - 1] - colorDomain[0])/4*d + colorDomain[0];
  }

  // function parseData(json){
  //   // deep copy 
  //   var temp = jQuery.extend(true, {}, json)
    
  //   // Shallow copy
  //   // var temp = jQuery.extend({}, json)
    
  //   function genRate(obj){
  //     var children = obj.children

  //     if( children === undefined || !Array.isArray(children) ) return

  //     var colorRange = [0.1, 1.0],
  //         len = children.length,
  //         total = 0

  //     for(var i=0; i<len; i++){
  //       total += children[i].title
  //     }

  //     obj.totalTitle = total

  //     if(total !== 0){
  //       for(var i=0; i<len; i++){
  //         var child = children[i]
  //         child.rate = child.title / total

  //         if(child.value === 0){
  //           child.colorRate = colorRange[0]
  //         }else{
  //           colorRate = child.used/child.value
  //           if(colorRate>colorRange[1]) colorRate = colorRange[1]
  //           if(colorRate<colorRange[0]) colorRate = colorRange[0]
  //           child.colorRate = colorRate
  //         }

  //         genRate(child)
  //       }
  //     }

  //   }

  //   genRate(temp)

  //   return temp
  // }

  function parseData(json) {
    var colorRange = [0.1, 1.0],
        i = 0
        
    var root = jQuery.extend(true, {}, json)
  
    function recurse(node) {
      
      if(node.title) 
        node.rate = node.title/node.totalTitle
      
      if(node.value === 0){
        node.colorRate = colorRange[0]
      }else{
        node.colorRate = node.used/node.value
        if(node.colorRate>colorRange[1]) node.colorRate = colorRange[1]
        if(node.colorRate<colorRange[0]) node.colorRate = colorRange[0]
      }
          
      if (node.children){
        // TO-DO: calculate total title for node
        var totalTitle = _.reduce(node.children, function(sum, child){ return sum + child.title; }, 0)
        
        _.each(node.children, function(child){
          child.totalTitle = totalTitle
        })
        
        // recurse call for each children node
        node.children.forEach(recurse)
      }
      
      // update node Id
      if(!node.id) {
        ++i;
        node.id = 'n' + i;
      }
    }
  
    recurse(root)
    
    return root

  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var colorRange = [0.1, 1.0],
        i = 0;
  
    function recurse(node) {
      
      if(node.title) 
        node.rate = node.title/node.totalTitle
      
      if(node.value === 0){
        node.colorRate = colorRange[0]
      }else{
        node.colorRate = node.used/node.value
        if(node.colorRate>colorRange[1]) node.colorRate = colorRange[1]
        if(node.colorRate<colorRange[0]) node.colorRate = colorRange[0]
      }
          
      if (node.children){
        // TO-DO: calculate total title for node
        var totalTitle = _.reduce(node.children, function(sum, child){ return sum + child.title; }, 0)
        
        _.each(node.children, function(child){
          child.totalTitle = totalTitle
        })
        
        // recurse call for each children node
        node.children.forEach(recurse)
      }
      
      // update node Id
      if(!node.id) {
        ++i;
        node.id = 'n' + i;
      }
    }
  
    recurse(root)

  }

  /**
   * [genChildrenRate description]
   * @param  {[type]} children [description]
   * @return {[type]}          [description]
   */
  function genChildrenRate(children){
    var array = []

    if(Array.isArray(children)){
 

      function genRate(array){
        if( !Array.isArray(array) ) return

        var colorRange = [0.1, 1.0],
          children = array.slice(0),
          len = children.length

        for(var i=0; i<len; i++){
          total += children[i].title
        }

        for(var i=0; i<len; i++){
          var child = children[i]
          child.rate = child.title / total

          if(child.value === 0){
            child.colorRate = colorRange[0]
          }else{
            colorRate = child.used/child.value
            if(colorRate>colorRange[1]) colorRate = colorRange[1]
            if(colorRate<colorRange[0]) colorRate = colorRange[0]
            child.colorRate = colorRate
          }
        }

        return children
      }
    }

    return 
  }



  function getVMContainers(json, type){
    var VMContainers = {
      "name": type,
      "type": "root",
      "children":[]
    }

    var children = []
    var data = JSON.parse(JSON.stringify(json))

    if(data.children){
      
    }
    recurse(json)

    function recurse(node) {
        if(node.children !== undefined){
          node.children.forEach(function(node){
            recurse(node);
          })
        }else{
          if(node.type == "VM" || node.type == "CONTAINER"){
            var tmp = JSON.parse(JSON.stringify(node))
            children.push(tmp)
          }
        }
    }

    VMContainers.children =  genChildrenRate(children)


    return VMContainers

  }

})

