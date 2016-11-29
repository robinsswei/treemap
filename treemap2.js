/*global $*/
$(function(){

  // 1. load header.html
  $("#header").load("../../header.html",function(){
    document.getElementById("brand").innerHTML="Heatmap";
    document.getElementById("userinput").value="";
  });

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

  var cpu = {},
      cpuData = {},
      diskData = {},
      memData = {},
      allcpu = {},
      alldisk = {},
      allmem = {}

  var fetchCpuData = function(){
    // return d3.json("../api/heatmap/cpu", function(error, data){
    return d3.json("../api/heatmap/cpu", function(error, data){
        cpu = data

        var temp = {}
        temp = JSON.parse(JSON.stringify(cpu))

        var stack = []
        stack.push(temp)

        var colorRange = [0.1, 1.0]

        while(stack.length>0){
          var child = stack.pop()
          var total = 0
          if(child.children !== undefined){
            for(var i=0; i<child.children.length; i++){
              total += child.children[i].title
            }
            child.totalTitle = total

            for(var i=0; i<child.children.length; i++){
              var grandChild = child.children[i]
              grandChild.rate = grandChild.title / total

              if(grandChild.value === 0){
                grandChild.colorRate = colorRange[0]
              }else{
                colorRate = grandChild.used/grandChild.value
                if(colorRate>colorRange[1]) colorRate = colorRange[1]
                if(colorRate<colorRange[0]) colorRate = colorRange[0]
                grandChild.colorRate = colorRate
              }

              if(grandChild.children !== undefined) stack.push(grandChild)

            }
          }
        }

        cpuData = temp

        if(data["cpuTotal"] > 0) showCpu = true

        if(showCpu) createTreemap("cpu", cpuData)
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
              // .then(fetchDiskData)
              // .then(fetchMemData)
  }

  $.when(fetchAllData())
   .then(function(){
      console.log("cpu")
      console.log(cpu)

      console.log("cpuData")
      console.log(cpuData)

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
          .text(function(d) {console.log(typeof(d.value), d.value); return d.name + ', value: ' + d.title + ', percent : ' + formatNumber(d.rate); });
  
      g.append("text")
          .attr("dy", ".75em")
          .attr("id", uniqueId)
          .text(function(d) { return d.name; })
          // .call(text);
          .attr("x", function(d) { return x(d.x) + 6; })
          .attr("y", function(d) { return y(d.y) + 6; })
          .attr("fill", function (d) {return getContrast50(color(parseFloat(d.colorRate)))})
          .style("opacity", function(d){


            // var box = this.getBBox()
            // console.log("TEXT width: " + box.width)

            // var id = $(this).attr("id")
            // console.log(id)
            // var parent = $("#"+id).prev()

            // var parentWidth = parent[0].parentNode.getBoundingClientRect().width

            // console.log("Parent Width: " + parentWidth)

            // if(box.width <= parentWidth) {
            //   return 1; // fits, show the text
            // } else {
            //   return 0; // does not fit, make transparent
            // }
        })

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
  
        // Transition to the new view.


        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);
        
        t1.selectAll("text").call(text).style("fill-opacity", 0);
        t2.selectAll("text").call(text).style("fill-opacity", 1);
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
  }

  function createSimpleTreemap(mapName, data){
    var simpleMap = main.append("<div class='row simpleTreemap'></div>")
    simpleMap.append("<h3>"+ mapName + "</h3>")
    simpleMap.append("<div id='" + mapName + "'></div>")

    var width = $("#"+mapName).innerWidth(),
        height = 500,
        formatNumber = d3.format(",%"),
        colorDomain = [0, 0.5, 1.0],
        colorRange = ["#33A133", "#742D2D", "#D62222"]

    // sets x and y scale to determine size of visible boxes
    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width])
    
    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height])
    
    // adding a color scale
    var color = d3.scale.linear()
        .domain(colorDomain)
        .range(colorRange)

    var treemap = d3.layout.treemap()
                  .size([width, height])
                  .sticky(true)
                  .value(function(d) { return d.rate; });
 
    var node = d3.select("#"+mapName).append("svg")
              .attr("width", width)
              .attr("height", height)
              .style("margin-left", -margin.left + "px")
              .style("margin.right", -margin.right + "px")
              .datum(data)
              .selectAll(".node")
                .data(treemap.nodes)
              .enter().append("div")
                .attr("class", "node")
                .call(position)
                .style("background-color", function(d) {
                    return d.type == 'root' ? '#fff' : color(parseFloat(d.colorRate)); })
                .append('div')
                .style("font-size", function(d) {
                    // compute font size based on sqrt(area)
                    // return Math.max(20, 0.18*Math.sqrt(d.rate))+'px'; })
                    return '20px'; })
                .text(function(d) { return d.children ? null : d.name; });

      function position() {
        this.style("left", function(d) { return d.x + "px"; })
            .style("top", function(d) { return d.y + "px"; })
            .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
            .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
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
  //   var temp = {}
  //   // shallow copy of the json object
  //   _.extend(temp, json) 

  //   function genRate(obj){
  //     var d = $.Deferred();
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

  //     return d

  //   }

  //   genRate(temp)

  //   return temp
  // }


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

