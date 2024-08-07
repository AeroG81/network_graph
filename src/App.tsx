import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  SimulationNodeDatum,
  SimulationLinkDatum,
  forceSimulation,
  forceLink,
  forceCenter,
  forceManyBody,
  forceCollide
} from "d3-force";

import * as d3 from 'd3';

interface CustomNode extends SimulationNodeDatum {
  id: string;
  name: string;
}

interface CustomLink extends SimulationLinkDatum<CustomNode> {
  strength: number;
  distance: number;
}

const initNodes: CustomNode[] = [
  { id: "id1", name: "Quang" },
  { id: "id2", name: "Dahyun" },
  { id: "id3", name: "Dubu" },
  { id: "id4", name: "Sana" },
  { id: "id5", name: "Fana" },
  { id: "id6", name: "Gana" },
  { id: "id7", name: "Tana" },
  { id: "id8", name: "Qana" },
];

const initLinks: CustomLink[] = [
  { source: "id1", target: "id2", strength: 1, distance: 1 },
  { source: "id1", target: "id3", strength: 2, distance: 1 },
  { source: "id1", target: "id4", strength: 3, distance: 1 },
  { source: "id2", target: "id4", strength: 1, distance: 1 },
  { source: "id3", target: "id2", strength: 1, distance: 3 },
  { source: "id4", target: "id5", strength: 1, distance: 4 },
  { source: "id7", target: "id6", strength: 1, distance: 1 },
  { source: "id6", target: "id8", strength: 8, distance: 6 },
];

interface GraphData {
  nodes: CustomNode[];
  links: CustomLink[];
}

interface ForceGraphProps {
  data: GraphData;
  height: number;
  width: number;
}

const GraphExample: React.FC<ForceGraphProps> = ({ data, width, height }: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const NODE_STRENGTH = -10;
    const RADIUS = 8;
    const FORCE_RADIUS_FACTOR = 1.5;
    const LINK_DISTANCE = 30;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).id((d: any) => d.id).distance((d: any) => d.distance))
      .force('charge', forceManyBody().strength(NODE_STRENGTH))
      .force('center', forceCenter(width / 2, height / 2).strength(0.05))
      .force("collision", forceCollide(RADIUS * FORCE_RADIUS_FACTOR))
      .on('tick', ticked);

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr("cx", ({x}:any) => x)
      .attr("cy", ({y}:any) => y)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value));

    const g = svg.append('g');

    const node = g
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr("cx", ({x}:any) => x)
      .attr("cy", ({y}:any) => y)
      .attr('r', 5)
      .attr('fill', (d: any) => color(d.group));

    node.append('title')
      .text((d: any) => d.id);

    function ticked() {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    }

    const dragstarted = (event: any, d: CustomNode) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    const dragged = (event: any, d: CustomNode) => {
      d.fx = event.x;
      d.fy = event.y;
    }

    const dragended = (event: any, d: CustomNode) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    node.call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

    function zoomed({transform}: any) {
      node.attr("transform", transform);
      link.attr("transform", transform);
    }

    svg.call(d3.zoom<any, any>()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);


  return (
    <svg height={height} width={width} ref={svgRef}>
    </svg>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div style={{ border: '2px solid #ffffff' }}>
          {
            GraphExample({
              width: 2200,
              height: 800,
              data: {
                nodes: initNodes,
                links: initLinks
              }
            })
          }
        </div>

      </header>
    </div>
  );
}

export default App;
