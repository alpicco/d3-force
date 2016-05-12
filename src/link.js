import constant from "./constant";
import jiggle from "./jiggle";
import {map} from "d3-collection";

function index(d, i) {
  return i;
}

export default function(links) {
  var id = index,
      strength = constant(0.7),
      strengths,
      distance = constant(30),
      distances,
      nodes,
      count,
      iterations = 1;

  if (links == null) links = [];

  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x = target.x + target.vx - source.x - source.vx || jiggle();
        y = target.y + target.vy - source.y - source.vy || jiggle();
        l = Math.sqrt(x * x + y * y);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x *= l, y *= l;
        target.vx -= x / (b = count[target.index]);
        target.vy -= y / b;
        source.vx += x / (b = count[source.index]);
        source.vy += y / b;
      }
    }
  }

  function initialize() {
    if (!nodes) return;

    var i,
        n = nodes.length,
        m = links.length,
        nodeById = map(nodes, id),
        link;

    for (i = 0, count = new Array(n); i < n; ++i) {
      count[i] = 0;
    }

    for (i = 0; i < m; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = nodeById.get(link.source);
      if (typeof link.target !== "object") link.target = nodeById.get(link.target);
      ++count[link.source.index], ++count[link.target.index];
    }

    strengths = new Array(m), initializeStrength();
    distances = new Array(m), initializeDistance();
  }

  function initializeStrength() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i]);
    }
  }

  function initializeDistance() {
    if (!nodes) return;

    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i]);
    }
  }

  force.initialize = function(_) {
    nodes = _;
    initialize();
  };

  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };

  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initializeStrength(), force) : strength;
  };

  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant(+_), initializeDistance(), force) : distance;
  };

  return force;
}
